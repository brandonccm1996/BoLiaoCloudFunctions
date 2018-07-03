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
	const notificationId  = context.params.notificationId;
	const userId = context.params.userId;

	console.log('Group ID: ', groupId);
	console.log('Notification ID: ', notificationId);
	console.log('User ID:', userId);

	// to prevent notification deletion from pushing notification
	// if (!event.data.val()) {
	// 	return console.log('Notification deleted', notificationId);
	// }

	const deviceToken = admin.database().ref('/users/'+ userId + '/devicetoken').once('value');

	return deviceToken.then(result => {
		const tokenId = result.val();
		console.log('Device Token:', tokenId);

		const payload = {
			notification: {
				title: "BoLiao",
				body: "Event has been updated",
				icon: "default"
			}
		};
	
		return admin.messaging().sendToDevice(tokenId, payload).then(response => {
			return console.log('Attempt to send notification');
		});
	});
});