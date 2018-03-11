var deferredPrompt;

// Check if the service worker feature is available in browser
if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
		.then(function() {
			console.log('Service worker registered!');
		});
}

window.addEventListener('beforeinstallprompt', function() {
	console.log('beforeinstallprompt fired');
	event.preventDefault();
	deferredPrompt = event;
	return false;
});