// Initialize Firebase
var config = {
    apiKey: "AIzaSyBlqyGWkLQfnzLV3q4qw6YNwLI526WQ5uA",
    authDomain: "tipstop-7153f.firebaseapp.com",
    databaseURL: "https://tipstop-7153f.firebaseio.com",
    projectId: "tipstop-7153f",
    storageBucket: "tipstop-7153f.appspot.com",
    messagingSenderId: "400002968757"
  };
firebase.initializeApp(config);
const auth = firebase.auth(); //Get authentification interface.

//When the window has loaded, set up the interactable page elements.
window.onload = () => {

    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    const signinButton = document.getElementById("signin_button");
    signinButton.addEventListener('click', e => {
        auth.signInWithEmailAndPassword(emailField.value, passwordField.value)
            .catch(onSignInError);
    });

};


auth.onAuthStateChanged(user => {
    
    if(user === null) return;
    window.location = "../map_page/map.html";

});

//The response to when firebase fails to sign in with the given credentials.
function onSignInError(err){
    alert("The username or password was incorrect.");
}