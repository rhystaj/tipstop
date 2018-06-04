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

var map = "Test";
var loc = null;
var currentUser = null;

let eventsToFire = 3;

var avaliablePlaceTypes = new Array();

function setMap(m, l){
  map = m;

  onUserAndMapAndWindowLoaded();
}

function setLocation(l){
  loc = l;
  findTypesOfNeabyPlaces(loc, 500, avaliablePlaceTypes, map, r => db.child("users").child(currentUser.uid).child("placesNearby").set(createLocationsObject(r)));
}

window.onload = () => {

  const keyWordSelection = document.getElementById("keyword_selection");
  const requestDetailsField = document.getElementById("request_details");
  
  const requestButton = document.getElementById("request_button");
  requestButton.addEventListener('click', e =>{
    sendRequest(keyWordSelection.options[keyWordSelection.selectedIndex].text, keyWordSelection.value, requestDetailsField.value, currentUser);
  });

  const logoutButton = document.getElementById("logout_button");
  logoutButton.addEventListener('click', e => auth.signOut());

  console.log(keyWordSelection.options);

  for(var i = 0; i < keyWordSelection.options.length; i++){

    const values = keyWordSelection.options[i].value.split(" ");
    values.forEach(value => {
      avaliablePlaceTypes.push(value);
    });

  }
    
  onUserAndMapAndWindowLoaded();

};

//When this page is loaded, a user should be logged in, otherwise, go to login page.
auth.onAuthStateChanged(user => {
    
  if(user === null){
      window.location = "../sign_in_page/signin.html";
      return;
  }

  currentUser = user;

  onUserAndMapAndWindowLoaded();

});

function sendRequest(typ, cat, msg, user){

    //Determine the time the request is being sent.
    const d = new Date();

    var mins = d.getMinutes();
    if(mins < 10){
      mins = "0" + mins;
    }

    request = {
      requestType: typ,
      category: cat,
      message: msg,
      senderId: user.uid,
      senderName: user.email,
      dateSent: `${d.getHours()}:${mins} ${d.getDate()}/${d.getMonth()}`,
      rawTimeSent: d.getTime()
    }
  
    db.child("requests").push(request);
  
}

var unseenRequests = false;
var unseenResponses = false;
function updateNotifcations(){

  const menuNotification = document.getElementById('menu_notification');
  const requestsNotification = document.getElementById('requests_notification');
  const responsesNotification = document.getElementById('responses_notification');

  if(unseenRequests){requestsNotification.style.display = "block";}
  else{requestsNotification.style.display = "none";}

  if(unseenResponses){responsesNotification.style.display = "block";}
  else{responsesNotification.style.display = "none";}

  if(unseenRequests || unseenResponses){menuNotification.style.display = "block";}
  else{menuNotification.style.display = "none";}

}

function onUserAndMapAndWindowLoaded(){

  eventsToFire --;
  if(eventsToFire > 0){
    return;
  }

  document.getElementById("dr-title").innerText = currentUser.email;

  //Register listens for changes in the unseen requests or responses status and update notifications accordingly.
  db.child('users').child(currentUser.uid).child('newUnseenRequests').on('value', snap => {
    unseenRequests = snap.val();
    updateNotifcations();
  });
  db.child('users').child(currentUser.uid).child('newUnseenResponses').on('value', snap => {
    unseenResponses = snap.val();
    updateNotifcations();
  })

  db.child('users').child(currentUser.uid).child('likes').on('value', likesSnap =>{

    if(likesSnap.val() === null || likesSnap.val() === undefined){
      return;
    }

    if((typeof likesSnap.val()).localeCompare('string') == 0){
    return;
    }

    const likesObj = likesSnap.val();
    const likeKeys = Object.keys(likesObj);
   
    animateLikesPopup(likeKeys, likesObj, 0);

  });

}

function animateLikesPopup(keys, likesObj, i){

  const liker = likesObj[keys[i]];

  jq('#ss').html(`
                <div style="height: 100%;display: flex;align-items: center;padding-left: 30px;box-sizing: border-box">
                  ${liker} <br>
                  liked your recommendation!
                </div>
                 `)
           .show()
           .delay(3000)
           .fadeOut('slow', () => {

              db.child('users').child(currentUser.uid).child('likes').child(keys[i]).remove();

              if(i < keys.length - 1){
                animateLikesPopup(keys, likesObj, i+1);
              }

           });

}

/**
 * Turns an array of location types strings into an object than 
 */
function createLocationsObject(locs){

  const obj = new Object();

  locs.forEach(loc =>{
    obj[loc] = true;
  });

  return obj;

}

