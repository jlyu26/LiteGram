importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v1';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/utility.js',
	'/src/js/feed.js',
	'/src/js/idb.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// function trimCache(cacheName, maxItems) {
// 	caches.open(cacheName)
// 		.then(function(cache) {
// 			return cache.keys()
// 				.then(function(keys) {
// 					if (keys.length > maxItems) {
// 						cache.delete(keys[0])	// call trimCache() recursively until length < maxItems
// 							.then(trimCache(cacheName, maxItems));
// 					}
// 				});
// 		});
// }

// Install Service Worker
self.addEventListener('install', function(event) {
	console.log('[Service Worker] Installing service worker...', event);
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
		.then(function(cache) {
			console.log('[Service Worker] Precaching App Shell..');
			cache.addAll(STATIC_FILES);
		})
	)
});

// Active Service Worker
self.addEventListener('activate', function(event) {
	console.log('[Service Worker] Activating service worker...', event);
	event.waitUntil(	// clean up old version cache
		caches.keys()
			.then(function(keyList) {
				return Promise.all(keyList.map(function(key) {
					if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
						console.log('[Service Worker] Removing old cache...', key);
						return caches.delete(key);
					}
				}));
			})
	);
	return self.clients.claim();
});

function isInArray(string, array) {
	var cachePath;
	// request targets domain where we serve the page from (i.e. NOT a CDN)
	if (string.indexOf(self.origin) === 0) {
		console.log('matched ', string);
		// take the part of the URL AFTER the domain (e.g. after localhost:8080)
		cachePath = string.substring(self.origin.length);
	} else {
		cachePath = string; // store the full request (for CDNs)
	}
	return array.indexOf(cachePath) > -1;
}

// Strategy: Cache then network
self.addEventListener('fetch', function(event) {
	var url = 'https://litegram-268b1.firebaseio.com/posts';

	if (event.request.url.indexOf(url) > -1) {	// have a cache-then-network strategy
		event.respondWith(fetch(event.request)
			.then(function (res) {
				var clonedRes = res.clone();
				clearAllData('posts')
					.then(function () {
						return clonedRes.json();
					})
					.then(function (data) {
						for (var key in data) {
							writeData('posts', data[key])
						}
					});
				return res;
			})
		);
	} else if (isInArray(event.request.url, STATIC_FILES)) {
		event.respondWith(	// use cache-only strategy
			caches.match(event.request)
		);
	} else {	// use cache-then-network-fallback strategy
		event.respondWith(
			caches.match(event.request)
				.then(function(response) {
					if (response) {
						return response;
					} else {
						return fetch(event.request)
							.then(function(res) {
								return caches.open(CACHE_DYNAMIC_NAME)
									.then(function(cache) {
										// trimCache(CACHE_DYNAMIC_NAME, 3);
										cache.put(event.request.url, res.clone());
										return res;
									})
							})
							.catch(function(err) {
								return caches.open(CACHE_STATIC_NAME)
									.then(function(cache) {
										if (event.request.headers.get('accept').includes('text/html')) {
											return cache.match('/offline.html');
										}
									});
							});
					}
				})
		);
	}
});


// Strategy: Cache then network fallback
// self.addEventListener('fetch', function(event) {
// 	event.respondWith(
// 		caches.match(event.request)	// key is always a request object, never a string
// 			.then(function(response) {
// 				if (response) {
// 					return response;
// 				} else {
// 					return fetch(event.request)
// 						.then(function(res) {
// 							return caches.open(CACHE_DYNAMIC_NAME)
// 								.then(function(cache) {
// 									cache.put(event.request.url, res.clone());
// 									return res;
// 								})
// 						})
// 						.catch(function(err) {
// 							return caches.open(CACHE_STATIC_NAME)
// 								.then(function(cache) {
// 									return cache.match('/offline.html');
// 								});
// 						});
// 				}
// 			})
// 	);
// });

// Strategy: Cache-only
// self.addEventListener('fetch', function(event) {
// 	event.respondWith(
// 		caches.match(event.request)
// 	);
// });

// Strategy: Network-only
// self.addEventListener('fetch', function(event) {
// 	event.respondWith(
// 		fetch(event.request)
// 	);
// });

// Strategy: Network with cache fallback, with dynamic caching
// self.addEventListener('fetch', function(event) {
// 	event.respondWith(
// 		fetch(event.request)
// 			.then(function(res) {
// 				return caches.open(CACHE_DYNAMIC_NAME)
// 					.then(function(cache) {
// 						cache.put(event.request.url, res.clone());
// 						return res;
// 					})
// 			})
// 			.catch(function(err) {
// 				return caches.match(event.request);
// 			})
// 	);
// });

self.addEventListener('sync', function(event) {
	console.log('[Service Worker] Backgound syncing...', event);
	if (event.tag === 'sync-new-posts') {	// post?
		console.log('[Service Work] Syncing new posts...');
		event.waitUntil(
			readAllData('sync-posts')
				.then(function(data) {
					for (var dt of data) {
						var postData = new FormData();
						postData.append('id', dt.id);
						postData.append('title', dt.title);
						postData.append('location', dt.location);
						postData.append('file', dt.picture, dt.id + '.png');

						fetch('https://us-central1-litegram-268b1.cloudfunctions.net/storePostData', {
						    method: 'POST',
						    body: postData
						})
						.then(function(res) {
						    console.log('[Sent Data]', res);
						    if (res.ok) {
						    	res.json()
						    		.then(function(resData) {
						    			deleteItemFromData('sync-posts', resData.id);
						    		});
						    }
						})
						.catch(function(err) {
							console.log('[Error while Dending Data]', err);
						});
					}	
				})
		);
	}
});

self.addEventListener('notificationclick', function(event) {
	var notification = event.notification;
	var action = event.action;

	console.log(notification);

	if (action === 'confirm') {
		console.log('<confirm> was chosen');
		notification.close();
	} else {
		console.log(action);
		event.waitUntil(
			clients.matchAll()
				.then(function(clis) {
					var client = clis.find(function(c) {
						return c.visibilityState === 'visible';
					});

					if (client !== undefined) {
						client.navigate(notification.data.url);
						client.focus();
					} else {
						clients.openWindow(notification.data.url);
					}
					notification.close();
				})
		);
	}
});

self.addEventListener('notificationclose', function(event) {
	console.log('Notification Closed!', event);
});

self.addEventListener('push', function(event) {
	console.log('Push Notification Received!', event);

	var data = { title: 'New!', content: 'Something New Happened...', openUrl: '/' };
	if (event.data) {
		data = JSON.parse(event.data.text());
	}

	var options = {
		body: data.content,
		icon: '/src/images/icons/app-icon-96x96.png',
		badge: '/src/images/icons/app-icon-96x96.png',
		data: {
			url: data.openUrl
		}
	};

	event.waitUntil(
		self.registration.showNotification(data.title, options)
	);
});