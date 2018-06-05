const auth = firebase.auth();

auth.onAuthStateChanged(user => {

    if(user === null){
        window.location = "./sign_in_page/signin.html";
    }
    else{
        window.location = "./map_page/map.html";
    }

});