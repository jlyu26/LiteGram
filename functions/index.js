var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./litegram-268b1-firebase-adminsdk-f7qjx-97164cc88f.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://litegram-268b1.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function(request, response) {
	cors(request, response, function() {
		admin.database().ref('posts').push({
			id: request.body.id,
			title: request.body.title,
			location: request.body.location,
			image: request.body.image
		})
		.then(function() {
			response.status(201).json({message: 'Data Stored...', id: request.body.id});
			return null;
		})
		.catch(function(err) {
			response.status(500).json({error: err});
		});
	});
});
