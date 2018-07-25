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

exports.sendEditNotification = functions.database.ref('/editEventNotif/{groupId}/{notificationId}/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const userId = context.params.userId;
	const getDeviceTokensPromise = admin.database().ref('/users/' + userId + '/devicetokens').once('value');
	const getGroupNamePromise = admin.database().ref('/groups/' + groupId + '/names').once('value');
  	let tokensSnapshot;
	let tokens;
	
	return Promise.all([getDeviceTokensPromise, getGroupNamePromise]).then(results => {
		tokensSnapshot = results[0];
		const groupName = results[1].val();

		if (!tokensSnapshot.hasChildren()) {
			return console.log('There are no notification tokens to send to.');
		}
		console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');

		const payload = {
			notification: {
				title: "BoLiao",
				body: "Details for " + groupName + " have been updated",
				icon: "default"
			}
		};

		tokens = Object.keys(tokensSnapshot.val());
		return admin.messaging().sendToDevice(tokens, payload);
	});
});

exports.deleteEditNotification = functions.database.ref('/editEventNotif/{groupId}/{notificationId}/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const notificationId  = context.params.notificationId;
	const userId = context.params.userId;

	var notifRef = admin.database().ref('/editEventNotif/' + groupId + '/' + notificationId + '/' + userId);
	notifRef.remove().then(function() {
		return console.log('Remove succeeded');
	})
	.catch(function(error) {
		return console.log('Remove failed');
	});

	return 0;
});

exports.sendRemoveNotification = functions.database.ref('/removeNotif/{groupId}/{notificationId}/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const userId = context.params.userId;
	const getDeviceTokensPromise = admin.database().ref('/users/' + userId + '/devicetokens').once('value');
	const getGroupNamePromise = admin.database().ref('/groups/' + groupId + '/names').once('value');
  	let tokensSnapshot;
	let tokens;
	
	return Promise.all([getDeviceTokensPromise, getGroupNamePromise]).then(results => {
		tokensSnapshot = results[0];
		const groupName = results[1].val();

		if (!tokensSnapshot.hasChildren()) {
			return console.log('There are no notification tokens to send to.');
		}
		console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');

		const payload = {
			notification: {
				title: "BoLiao",
				body: "Admin for " + groupName + " has removed you from the activity",
				icon: "default"
			}
		};

		tokens = Object.keys(tokensSnapshot.val());
		return admin.messaging().sendToDevice(tokens, payload);
	});
});

exports.deleteRemoveNotification = functions.database.ref('/removeNotif/{groupId}/{notificationId}/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const notificationId  = context.params.notificationId;
	const userId = context.params.userId;

	var notifRef = admin.database().ref('/removeNotif/' + groupId + '/' + notificationId + '/' + userId);
	notifRef.remove().then(function() {
		return console.log('Remove succeeded');
	})
	.catch(function(error) {
		return console.log('Remove failed');
	});

	return 0;
});

exports.sendDeleteNotification = functions.database.ref('/deleteEventNotif/{groupId}/{groupName}/{notificationId}/{userId}').onCreate((data, context) => {
	const userId = context.params.userId;
	const groupName = context.params.groupName;
	const getDeviceTokensPromise = admin.database().ref('/users/' + userId + '/devicetokens').once('value');
  	let tokensSnapshot;
	let tokens;
	
	return getDeviceTokensPromise.then(results => {
		tokensSnapshot = results;

		if (!tokensSnapshot.hasChildren()) {
			return console.log('There are no notification tokens to send to.');
		}
		console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');

		const payload = {
			notification: {
				title: "BoLiao",
				body:  groupName + " has been deleted by organiser",
				icon: "default"
			}
		};

		tokens = Object.keys(tokensSnapshot.val());
		return admin.messaging().sendToDevice(tokens, payload);
	});
});

exports.deleteDeleteNotification = functions.database.ref('/deleteEventNotif/{groupId}/{groupName}/{notificationId}/{userId}').onCreate((data, context) => {
	const groupId = context.params.groupId;
	const notificationId  = context.params.notificationId;
	const userId = context.params.userId;
	const groupName = context.params.groupName;

	var notifRef = admin.database().ref('/deleteEventNotif/' + groupId + '/' + groupName + '/' + notificationId + '/' + userId);
	notifRef.remove().then(function() {
		return console.log('Remove succeeded');
	})
	.catch(function(error) {
		return console.log('Remove failed');
	});

	return 0;
});

exports.detectStartTimeChange = functions.database.ref('groups/{groupId}/startDateTime').onUpdate((change, context) => {
	const groupId = context.params.groupId;
	const updatedDateTime = change.after.val().toString();

	const payload = {
		data: {
			title: "Start Time Change Detected",
			groupId: groupId,
			newDateTime:  updatedDateTime,
		}
	};

	const userListsRef = admin.database().ref('userlists/' + groupId);
	return userListsRef.once('value').then(snapshot => {
		var reads = [];

		snapshot.forEach((childSnapshot) => {	
			console.log("Key", childSnapshot.key);
			const deviceToken = admin.database().ref('/users/'+ childSnapshot.key + '/devicetoken').once('value');
			
			var promise = deviceToken.then(result => {
				const tokenId = result.val();
				return admin.messaging().sendToDevice(tokenId, payload).then(response => {
					return console.log('Attempt to send start time change notification');
				});
			});

			reads.push(promise);
		});
		return Promise.all(reads);
	});
});

exports.detectNameChange = functions.database.ref('groups/{groupId}/names').onUpdate((change, context) => {
	const groupId = context.params.groupId;
	const updatedName = change.after.val().toString();

	const payload = {
		data: {
			title: "Name Change Detected",
			groupId: groupId,
			newName: updatedName,
		}
	};

	const userListsRef = admin.database().ref('userlists/' + groupId);
	return userListsRef.once('value').then(snapshot => {
		var reads = [];

		snapshot.forEach((childSnapshot) => {	
			console.log("Key", childSnapshot.key);
			const deviceToken = admin.database().ref('/users/'+ childSnapshot.key + '/devicetoken').once('value');
			
			var promise = deviceToken.then(result => {
				const tokenId = result.val();
				return admin.messaging().sendToDevice(tokenId, payload).then(response => {
					return console.log('Attempt to send name change notification');
				});
			});

			reads.push(promise);
		});
		return Promise.all(reads);
	});
});