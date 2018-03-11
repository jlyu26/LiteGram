// Install SW
self.addEventListener('install', function(event) {
	console.log('[Service Worker] Installing service worker...', event);
});

// Active SW
self.addEventListener('activate', function(event) {
	console.log('[Service Worker] Activating service worker...', event);
	return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
	console.log('[Service Worker] Fetching something...', event);
	event.respondWith(fetch(event.request));
});