var deferredPrompt;

if(!window.Promise) {
	window.Promise = Promise;
}

// Check if the service worker feature is available in browser
if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
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
	return false;
});

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