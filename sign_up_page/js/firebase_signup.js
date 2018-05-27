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

window.onload = () => {

    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password_1");
    const confirmPasswordField = document.getElementById("password_2");

    const submitButton = document.getElementById("signup_button");
    submitButton.addEventListener('click', e =>{

        if(passwordField.value.localeCompare(confirmPasswordField.value) !== 0){
            alert("Your passwords do not match!");
            return;
        }

        auth.createUserWithEmailAndPassword(emailField.value, passwordField.value)
            .catch(onSignupError);

    });

};

auth.onAuthStateChanged(user => {
    
    if(user === null) return;
    window.location = "../map_page/map.html";

});

function onSignupError(err){
    alert("There was an error during signup, please provide a different email and password.");
}