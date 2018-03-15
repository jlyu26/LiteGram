// This is the Node.js file that runs on Firebase server

var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});
var webpush = require('web-push');

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
			webpush.setVapidDetails('mailto:jlyu@wpi.edu', 'BBKMQ2gv1t-pQGqjT8oVToSrV6Y14eTglNj8PxzavChA2nG1l-_8HMvHoFtDqORLoFpZVk-QpFSw086zeFIi-SA', 'hEw13e0O7wT-hccsZOx0Eds1PlLmGeMBtY41O_sZZco');
			return admin.database().ref('subscriptions').once('value');
		})
		.then(function(subscriptions) {
			subscriptions.forEach(function(sub) {
				var pushConfig = {
					endpoint: sub.val().endpoint,
					keys: {
						auth: sub.val().keys.auth,
						p256dh: sub.val().keys.p256dh
					}
				};

				webpush.sendNotification(pushConfig, JSON.stringify({
					title: 'New Post',
					content: 'New Post Added!',
					openUrl: '/help'
				}))
					.catch(function(err) {
						console.log(err);
					})
			});
			response.status(201).json({message: 'Data Stored...', id: request.body.id});
			return null;
		})
		.catch(function(err) {
			response.status(500).json({error: err});
		});
	});
});
