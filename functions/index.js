const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

var usersSnap;

/*
    Fires when a user send a request to the database.
*/
 exports.requestRecieved = functions.database.ref('/requests/{pushId}').onCreate((newRequestSnap, cont) => {
    
    const dbroot = newRequestSnap.ref.parent.parent;

    //Get a snapshot of the users.
    return dbroot.child('users').once('value', usersSnap => {

        //Add the request's id to the lists of the user's sent requests.
        usersSnap.ref.child(newRequestSnap.val().senderId).child("sentRequests").child(newRequestSnap.key).set(true);

        //Filter out irrelevant users and give the others a copy of the request id.
        const possibleHelpers = getPossibleHelpers(newRequestSnap.val(), usersSnap.val());
        possibleHelpers.forEach(helper => {
            usersSnap.ref.child(helper).child('assignedRequests').child(newRequestSnap.key).set(true);
        });

    });


 });

 /**
  * Is fired whenever a new request is assigned to a user - changing the user's status to having unseen requests.
  */
 exports.requestAssigned = functions.database.ref('/users/{id}/assignedRequests/{pushId}').onCreate((snap, cont) => {
    snap.ref.parent.parent.child("newUnseenRequests").set(true);
 });


/**
 * Get a collections of users that could help with the given request.
 * @param {The request to search for help for.} request 
 */
function getPossibleHelpers(request, usersObj){

    users = Object.keys(usersObj);

    return users.filter(user => filterUser(request, user, usersObj[user]));

}

//Add an entry to the database representing a newly signed-in user.
exports.enterNewUserInDatabase = functions.auth.user().onCreate(user => {

    admin.database().ref("/users").child(user.uid).child("email").set(user.email);
    admin.database().ref("/users").child(user.uid).child("newUnseenRequests").set(false);
    admin.database().ref("/users").child(user.uid).child("newUnseenResponses").set(false);
    admin.database().ref("/users").child(user.uid).child("responses").set("empty");
    admin.database().ref("/users").child(user.uid).child("likes").set("empty");
    return admin.database().ref("/users").child(user.uid).child("assignedRequests").set("empty");

});

/**
 * When a request is deleted from a database, all references to it are deleted.
 */
exports.removeAllRequestReferences = functions.database.ref('requests/{id}').onDelete((requestSnap, cont) =>{

    const dbRoot = requestSnap.ref.parent.parent;

    return dbRoot.child('users').once('value', usersSnap => {

        const users = Object.keys(usersSnap.val());
        
        console.log(users);
        
        users.forEach(user => {

            usersSnap.ref.child(user).child("assignedRequests").child(requestSnap.key).remove();
            usersSnap.ref.child(user).child("sentRequests").child(requestSnap.key).remove();
            usersSnap.ref.child(user).child("responses").child(requestSnap.key).remove();

        });

    });

});

/**
 * Ensure that assignedRequests and responses is never actually deleted.
 */
exports.maintainAssignedRequestsReference = functions.database.ref('users/{id}/assignedRequests').onDelete((snap, cont) => {
    snap.ref.parent.child('assignedRequests').set("Empty");
});
exports.maintainResponsesReference = functions.database.ref('users/{id}/responses').onDelete((snap, cont) => {
    snap.ref.parent.child('responses').set("Empty");
});
exports.maintainLikesReference = functions.database.ref('users/{id}/likes').onDelete((snap, cont) => {
    snap.ref.parent.child('likes').set("Empty");
});


/**
 * Returns wheter a given user may be able to help with a given request.
 * @param {The request being sent} request 
 * @param {The user being evaluated} user 
 */
function filterUser(request, userId, userObj){

    //Don't assign requests to users that 
    if(userObj.placesNearby === undefined || userId.localeCompare(request.senderId) === 0){
        return false;
    }

    const relevantPlaces = request.category.split(" ");
    const placesNearUser = Object.keys(userObj.placesNearby);

    console.log(placesNearUser);

    for(var i = 0; i < relevantPlaces.length; i++){
        if(placesNearUser.includes(relevantPlaces[i])){
            return true;
        }
    }

    return false;

}