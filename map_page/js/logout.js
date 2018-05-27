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

window.onload = () =>{
    
    const logoutButton = document.getElementById("logout_button");

    logoutButton.addEventListener('click', e => auth.signOut());

}

auth.onAuthStateChanged(user => {

    if(user != null) return;
    window.location = "../sign_in_page/signin.html";

});
