var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if(!window.Promise) {
	window.Promise = Promise;
}

// Check if the service worker feature is available in browser
if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/service-worker.js')
		.then(function() {
			console.log('Service worker registered!');
		})
		.catch(function(err) {
			console.log(err);
		});
}

window.addEventListener('beforeinstallprompt', function() {
	console.log('beforeinstallprompt fired');
	event.preventDefault();
	deferredPrompt = event;
	return true;
});

function displayConfirmNotification() {
	if ('serviceWorker' in navigator) {
		var options = {
			body: 'You successfully subscribed to our notification service!',
			icon: '/src/images/icons/app-icon-96x96.png',
			image: '/src/images/main-image.jpg',
			dir: 'ltr',
			lang: 'en-US',
			vibrate: [100, 50, 200],
			badge: '/src/images/icons/app-icon-96x96.png',
			tag: 'confirm-notification',
			renotify: false,
			actions: [
				{ action: 'confirm', title: 'Confirm', icon: '/src/images/icons/app-icon-96x96.png' },
				{ action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
			]
		};

		// to display notification is a system feature, it depends on device, not browser
		navigator.serviceWorker.ready
			.then(function(swreg) {
				swreg.showNotification('Successfully Subscribed!', options);
			});
	}
}

function configurePushSub() {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	var reg;
	navigator.serviceWorker.ready
		.then(function(swreg) {
			reg = swreg;
			return swreg.pushManager.getSubscription();
		})
		.then(function(sub) {
			if (sub === null) {
				// create a new subscription
				var vapidPublicKey = 'BBKMQ2gv1t-pQGqjT8oVToSrV6Y14eTglNj8PxzavChA2nG1l-_8HMvHoFtDqORLoFpZVk-QpFSw086zeFIi-SA';
				var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
				return reg.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: convertedVapidPublicKey
				});
			} else {
				// already have a subscription
			}
		})
		.then(function(newSub) {
			return fetch('https://litegram-268b1.firebaseio.com/subscriptions.json', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify(newSub)
			})
		})
		.then(function(res) {
			if (res.ok) {
				displayConfirmNotification();
			}
		})
		.catch(function(err) {
			console.log(err);
		});
}

function askForNotificationPermission() {
	Notification.requestPermission(function(result) {
		console.log('User Choice:', result);
		if (result !== 'granted') {
			console.log('No notification permission granted...');
		} else {
			configurePushSub();
			// displayConfirmNotification();
		}
	})
}

if ('Notification' in window && 'serviceWorker' in navigator) {
	for (var i = 0; i < enableNotificationsButtons.length; i++) {
		enableNotificationsButtons[i].style.display = 'inline-block';
		enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
	}
}



// var promise = new Promise(function(res, rej) {	// resolve, reject
// 	setTimeout(function() {	// callback function
// 		// res('this is executed once the timer is done');
// 		rej({ code: 500, message: 'an error occured' });
// 	}, 3000);
// });

// AJAX request:
// Has a lot of synchronous code, and therefore won't work
// in service workers which are all about async code. So we 
// can't use AJAX in SW and it is more complex.
// var xhr = new XMLHttpRequest();
// xhr.open('GET', 'http://httpbin.org/ip');
// xhr.responseType = 'json';
// xhr.onload = function() {
// 	console.log(xhr.response);
// };
// xhr.onerror = function() {
// 	console.log('Error!');
// };
// xhr.send();

// fetch request:
// fetch('http://httpbin.org/ip')
// 	.then(function(res) {
// 		return res.json();
// 	})
// 	.then(function(data) {
// 		console.log(data);
// 	})
// 	.catch(function(err) {
// 		console.log(err);
// 	});

// fetch('http://httpbin.org/post', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Accept': 'application/json'
// 		},
// 		mode: 'cors',
// 		body: JSON.stringify({ message: 'Does this work?' })
// 	})
// 	.then(function(res) {
// 		return res.json();
// 	})
// 	.then(function(data) {
// 		console.log(data);
// 	})
// 	.catch(function(err) {
// 		console.log(err);
// 	});

// promise.then(function(text) {
// 	return text;
// }, function(err) {
// 	console.log(err.code, err.message);
// }).then(function(newText) {
// 	console.log(newText);
// });

// promise.then(function(text) {
// 	return text;
// }).then(function(newText) {
// 	console.log(newText);
// }).catch(function(err) {
// 	console.log(err.code, err.message);
// });

// console.log('this is executed right after setTimeout');