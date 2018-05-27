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

let eventsToFire = 2;

window.onload = () => {

  const keyWordSelection = document.getElementById("keyword_selection");
  const timeLimitSelection = document.getElementById("time_limit_selection");
  const requestDetailsField = document.getElementById("request_details");
  
  const requestButton = document.getElementById("request_button");
  requestButton.addEventListener('click', e =>{
    sendRequest(keyWordSelection.value, requestDetailsField.value, currentUser);
  });

  const logoutButton = document.getElementById("logout_button");
  logoutButton.addEventListener('click', e => auth.signOut());

};

//When this page is loaded, a user should be logged in, otherwise, go to login page.
auth.onAuthStateChanged(user => {
    
  if(user === null){
      window.location = "../sign_in_page/signin.html";
      return;
  }

  currentUser = user;

});

function sendRequest(cat, msg, user){

    request = {
      category: cat,
      message: msg,
      senderId: user.uid,
      senderName: user.email
    }
  
    db.child("requests").push(request);
  
}

