var config = {
    apiKey: "AIzaSyBlqyGWkLQfnzLV3q4qw6YNwLI526WQ5uA",
    authDomain: "tipstop-7153f.firebaseapp.com",
    databaseURL: "https://tipstop-7153f.firebaseio.com",
    projectId: "tipstop-7153f",
    storageBucket: "tipstop-7153f.appspot.com",
    messagingSenderId: "400002968757"
};
firebase.initializeApp(config);

const auth = firebase.auth();
const db = firebase.database().ref();


var currentUser = null;
var recommendationsDiv = null;

var eventsToFire = 2;


window.onload = () =>{

    //Get the div where the requests will be added as they are read in.
    recommendationsDiv = document.getElementById("recommendations_div");


    onWindowAndUserLoaded();

}

auth.onAuthStateChanged(user => {
    
    if(user === null){
        window.location = "../sign_in_page/signin.html";
    }

    currentUser = user;

    onWindowAndUserLoaded();

});


function onWindowAndUserLoaded(){

    eventsToFire--;
    if(eventsToFire > 0){
        return;
    }

    db.child("users").child(currentUser.uid).child("assignedRequests").on('value', showRecommendations);

}

function showRecommendations(recommendationsSnap){

    recommendationsDiv.innerHTML = "";

    const recommendationsObj = recommendationsSnap.val();
    const recommendationRequestIds = Object.keys(recommendationsObj);
    loadRequestsWithResponses(recommendationRequestIds, requestsObj => {

        //Sort requests by their latest response.
        recommendationRequestIds.sort((a, b) => {

            const aTime = getTimeOfLatestResponse(a, recommendationsObj);
            const bTime = getTimeOfLatestResponse(b, recommendationsObj);
            return aTime - bTime;

        });

        recommendationRequestIds.forEach(id => {


            const requestResponseDiv = generateRequestResponsesDiv(requestsObj[id].category, requestsObj[id].message);

            const recommendationIds = Object.keys(recommendationsObj[id]);
            
            //Sort recommendations by latest;
            recommendationIds.sort((a, b) => {
                return recommendationsObj[id][a].rawTimeSent - recommendationsObj[id][b].rawTimeSent;
            })
            
            recommendationIds.forEach(recId => {

                const currectRec = recommendationsObj[id][recId];
                requestResponseDiv.appendChild(generateRequestResponse(currectRec.responderName, currectRec.timeSent, currectRec.message));

            });

            recommendationsDiv.appendChild(requestResponseDiv);

        });

    });

}

function getTimeOfLatestResponse(requestId, recommendationsObj){

    const responsesObj = recommendationsObj[requestId];

    const responseIds = Object.keys(responsesObj);
    if(responseIds.length <= 0){return 0;}

    var latestTime = responsesObj[responseIds[0]].rawTimeSent;
    for(var i = 1; i < responseIds.length; i++){

        if(latestTime < responsesObj[responseIds[0]].rawTimeSent){
            latestTime = responsesObj[responseIds[0]].rawTimeSent;
        }

    }

    return latestTime;

}

/**
 * Get an object will the requests with the given id's and perform the given operation.
 * @param {} requestIds 
 * @param {*} onload 
 */
function loadRequestsWithResponses(requestIds, onload){

    let requestsLeft = requestIds.length;
    let requestsObj = new Object();
    requestIds.forEach(id => {

        db.child('requests').child(id).once('value', requestSnap => {

            requestsObj[requestSnap.key] = requestSnap.val();

            requestsLeft--;
            if(requestsLeft <= 0){
                onload(requestsObj);
            }

        });
        
    });

}

function generateRequestResponsesDiv(category, message){

    const div = document.createElement('div');
    div.className += "user-request";

    div.innerHTML =
    `
    <button type="button" class="button-close">Close whole request</button>
      <h2 class="content-h2">${category}</h2>
      <p class="user-request-detail">${message}</p>

    `

    return div;

}

function generateRequestResponse(username, date, message){

    return button = document.createElement('button');
    button.className += "myBtn";

    button.innerHTML = 
    `
    <div class="dis">
              <div class="modal-h">${username}</div>
              <div class="modal-p date" >${date}</div>
          </div>
              <p class="button-p">${message}</p>

    `

    return button;


}

