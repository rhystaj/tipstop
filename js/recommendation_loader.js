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


let selectedResponseId = null;
let responseRequestId = null;
let userBeingRespondedTo = null;


window.onload = () =>{

    //Get the div where the requests will be added as they are read in.
    recommendationsDiv = document.getElementById("recommendations_div");

    const approveButton = document.getElementById("approve_button");
    const ignoreButton = document.getElementById("ignore_button");

    approveButton.addEventListener('click', e =>{
        
        db.child('users').child(currentUser.uid).child('responses').child(responseRequestId).child(selectedResponseId).remove();
        db.child('users').child(userBeingRespondedTo).child('likes').child(currentUser.uid).set(currentUser.email);
        
        document.getElementById("myModal").style.display = "none";
    });
    
    ignoreButton.addEventListener('click', e =>{
        db.child('users').child(currentUser.uid).child('responses').child(responseRequestId).child(selectedResponseId).remove();
        document.getElementById("myModal").style.display = "none";
    });

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

    db.child("users").child(currentUser.uid).child("responses").on('value', showRecommendations);

}

function showRecommendations(recommendationsSnap){

    db.child("users").child(currentUser.uid).child('newUnseenResponses').set(false);

    if((typeof recommendationsSnap.val()).localeCompare('string') === 0){
        recommendationsDiv.innerHTML = `<p class="button-p">No Responses</p>`;
        return;
    }     

    recommendationsDiv.innerHTML = "";
    const recommendationsObj = recommendationsSnap.val();

    console.log(recommendationsObj);

    const recommendationRequestIds = Object.keys(recommendationsObj);
    loadRequestsWithResponses(recommendationRequestIds, requestsObj => {

        //Sort requests by their latest response.
        recommendationRequestIds.sort((a, b) => {

            const aTime = getTimeOfLatestResponse(a, recommendationsObj);
            const bTime = getTimeOfLatestResponse(b, recommendationsObj);
            return bTime - aTime;

        });

        recommendationRequestIds.forEach(id => {


            const requestResponseDiv = generateRequestResponsesDiv(requestsObj[id].requestType, requestsObj[id].message, id);
            

            const recommendationIds = Object.keys(recommendationsObj[id]);
            
            //Sort recommendations by latest;
            recommendationIds.sort((a, b) => {
                return recommendationsObj[id][b].rawTimeSent - recommendationsObj[id][a].rawTimeSent;
            })
            
            recommendationIds.forEach(recId => {

                const currectRec = recommendationsObj[id][recId];
                requestResponseDiv.appendChild(generateRequestResponse(currectRec.responderName, currectRec.dateSent, currectRec.message, id, recId, recommendationsObj[id][recId].responderId));
                requestResponseDiv.appendChild(document.createElement('br'));

            });

            recommendationsDiv.appendChild(requestResponseDiv);
            recommendationsDiv.appendChild(document.createElement('br'));
            document.getElementById(`close-${id}`).addEventListener('click', e => {
                db.child('requests').child(id).remove();
            });

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

    console.log(requestIds);

    let requestsLeft = requestIds.length;
    let requestsObj = new Object();
    requestIds.forEach(id => {

        db.child('requests').child(id).once('value', requestSnap => {

            console.log(id + ": " + requestSnap.val());

            requestsObj[requestSnap.key] = requestSnap.val();

            requestsLeft--;
            if(requestsLeft <= 0){
                
                console.log(requestsObj);
                
                onload(requestsObj);
            }

        });
        
    });

}

function generateRequestResponsesDiv(category, message, requestId){

    const div = document.createElement('div');
    div.className += "user-request";

    div.innerHTML =
    `
    <button type="button" class="button-close" id="close-${requestId}">Close Request</button>
      <h2 class="content-h2">${category}</h2>
      <p class="user-request-detail">${message}</p>

    `;

    return div;

}


function generateRequestResponse(username, date, message, requestId, responseId, senderId){

    const button = document.createElement('button');
    button.className += "myBtn";

    button.innerHTML = 
    `
    <div class="dis">
              <div class="modal-h">${username}</div>
              <div class="modal-p date" >${date}</div>
          </div>
              <p class="button-p">${message}</p>

    `;

    //Display the popup with the response's details when the user selects a response.
    button.addEventListener('click', e => {

        selectedResponseId = responseId;
        responseRequestId = requestId;
        userBeingRespondedTo = senderId;

        document.getElementById("description_text").innerText = message;
        document.getElementById("myModal").style.display = "block";

    });

    return button;

}

