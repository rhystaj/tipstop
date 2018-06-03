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


var constCurrentUser = null;
var requestsDiv = null;

var eventsToFire = 2;


window.onload = () =>{

    //Get the div where the requests will be added as they are read in.
    requestsDiv = document.getElementById("requests_div");


    onWindowAndUserLoaded();

}

auth.onAuthStateChange(user => {
    
    if(user === null){
        window.location = "../sign_in_page/signin.html";
    }

    currentUser = user;

    onUserAndMapAndWindowLoaded();

});


function onWindowAndUserLoaded(){

    eventsToFire--;
    if(eventsToFire > 0){
        return;
    }

    db.child("users").child(currentUser.uid).child("assignedRequests").on('value', showRequests);

}

//The html for an interacatable request.
const requestHTML =  
`<h1 class="content-h">User Request</h1>
<button id="myBtn" class="myBtn">
    <div class="dis">
        <div class="modal-h">usernameshere@gmail.com</div>
        <div class="modal-p date" >2/06/2018</div>
    </div>
        <h2>Request Type</h2>
        <p class="button-p">Request short description</p>

  </button>`

function showRequests(assignedRequestsSnap){

    requestsDiv.innerHTML = "";
    loadRequestsFromDatabase(Object.keys(assignedRequestsSnap.val()), requests =>{

        //Sort requests based on the time they were sent, with later ones coming FIRST.
        requests.sort((a, b) => {
            return a.rawSentTime - b.rawSentTime;
        });

        requests.forEach(req => {

            const button = generateRequestButton(req.username, req.dateSent, req.type, req.description);

            requestsDiv.appendChild(button);
            requestsDiv.write('</br>');

        });

    });

}

function loadRequestsFromDatabase(requestIds, onload){

    let requestsLeft = requestIds.length;
    let requests = new Array();
    requestIds.forEach(id => {

        db.child('requests').child(id).once(r => {
            requests.push(r.val());
        })

        if(requestsLeft <= 0){
            onload(requests);
        }

    })

}

function generateRequestButton(username, time, type, msg){

    //Create new element wrapper.
    const newButton = document.createElement('button');
    newButton.className += "myBtn";
    newButton.id = "myBtn";


    //Add information.
    newButton.innerHTML =
    `<div class="dis">
        <div class="modal-h">${username}</div>
        <div class="modal-p date" >${time}</div>
    </div>
        <h2>${type}</h2>
        <p class="button-p">${msg}</p>`

    return newButton;

}