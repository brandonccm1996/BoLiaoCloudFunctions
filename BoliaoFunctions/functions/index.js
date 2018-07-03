// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendNotification = functions.database.ref('/notifications/{groupId}/{notificationId}/userList/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const userId = context.params.userId;

	const groupNameQuery = admin.database().ref('/groups/' + groupId + '/names').once('value');
	return groupNameQuery.then(groupResult => {
		const groupName = groupResult.val();

		const deviceToken = admin.database().ref('/users/'+ userId + '/devicetoken').once('value');
		return deviceToken.then(result => {
			const tokenId = result.val();

			const payload = {
				notification: {
					title: "BoLiao",
					body: "Details for " + groupName + " have been updated",
					icon: "default"
				}
			};
		
			return admin.messaging().sendToDevice(tokenId, payload).then(response => {
				return console.log('Attempt to send notification');
			});
		});
	});
});

exports.deleteNotification = functions.database.ref('/notifications/{groupId}/{notificationId}/userList/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const notificationId  = context.params.notificationId;
	const userId = context.params.userId;

	var notifRef = admin.database().ref('/notifications/' + groupId + '/' + notificationId + '/userList/' + userId);
	notifRef.remove().then(function() {
		return console.log('Remove succeeded');
	})
	.catch(function(error) {
		return console.log('Remove failed');
	});

	return 0;
});