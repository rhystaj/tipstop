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
var requestsDiv = null;

var eventsToFire = 2;


window.onload = () =>{

    //Get the div where the requests will be added as they are read in.
    requestsDiv = document.getElementById("requests_div");

    const responseMessage = document.getElementById("response_message");
    
    document.getElementById("submit_button").addEventListener('click', e => {
        sendResponse(userBeingRespondedTo, requestBeingRespondedTo, responseMessage.value, currentUser);
        responseMessage.value = "";
        document.getElementById("myModal").style.display = "none";
        db.child('users').child(currentUser.uid).child('assignedRequests').child(requestBeingRespondedTo).remove();
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

  function loadRequestsFromDatabase(requestIds, onload){

    console.log(requestIds);

    let requestsLeft = requestIds.length;
    let requests = new Array();
    requestIds.forEach(id => {

        db.child('requests').child(id).once('value', r => {
            
            const request = r.val();
            request["id"] = r.key;

            requests.push(request);

            requestsLeft--;
            if(requestsLeft <= 0){
                onload(requests);
            }

        });

    })

}

function showRequests(assignedRequestsSnap, cont){

    

    if((typeof assignedRequestsSnap.val()).localeCompare('string') === 0){
        requestsDiv.innerHTML = `<p class="button-p">No Requests Assigned</p>`;
        return;
    } 
    
    requestsDiv.innerHTML = "";
    loadRequestsFromDatabase(Object.keys(assignedRequestsSnap.val()), requests =>{

        console.log("HERE");
        console.log("Requests: " + requests);

        //Sort requests based on the time they were sent, with later ones coming FIRST.
        requests.sort((a, b) => {
            const val = parseInt(b.rawTimeSent) - parseInt(a.rawTimeSent);
            console.log(val);
            return val;
        });

        requests.forEach(req => {

            const button = generateRequestButton(req.senderName, req.dateSent, req.requestType, req.message, req.id, req.senderId);

            requestsDiv.appendChild(button);
            requestsDiv.appendChild(document.createElement('br'));

        });

    });

    db.child('users').child(currentUser.uid).child('newUnseenRequests').set(false);

}


var requestBeingRespondedTo = null;
var userBeingRespondedTo = null;

function generateRequestButton(username, time, type, msg, id, senderId){

    //Create new element wrapper.
    const newButton = document.createElement('button');
    newButton.className += "myBtn";
    newButton.id = id;

    console.log(newButton);

    //Add information.
    newButton.innerHTML =
    `<div class="dis">
        <div class="modal-h">${username}</div>
        <div class="modal-p date" >${time}</div>
    </div>
        <h2>${type}</h2>
        <p class="button-p">${msg}</p>`

    newButton.addEventListener('click', e => {

        userBeingRespondedTo = senderId;

        requestBeingRespondedTo = e.target.id;
        
        document.getElementById("response_user").innerText = username;
        document.getElementById("myModal").style.display = "block";

    })

    return newButton;

}

function sendResponse(recipient, requestId, msg, user){

    const d = new Date();

    var mins = d.getMinutes();
    if(mins < 10){
      mins = "0" + mins;
    }

    console.log(recipient + " " + requestId);

    response = {
      message: msg,
      responderName: user.email,
      responderId: user.uid,
      dateSent: `${d.getHours()}:${mins} ${d.getDate()}/${d.getMonth()}`,
      rawTimeSent: d.getTime()
    };
  
    db.child("users").child(userBeingRespondedTo).child('newUnseenResponses').set(true);
    db.child("users").child(recipient).child("responses").child(requestId).push(response);
  
  }