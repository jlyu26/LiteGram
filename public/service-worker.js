importScripts('workbox-sw.prod.v2.1.3.js');
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/,
	workboxSW.strategies.staleWhileRevalidate({
	cacheName: 'google-fonts',
	cacheExpiration: {
		maxEntries: 3,
		maxAgeSeconds: 60 * 60 * 24 * 30
	}
}));

workboxSW.router.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
	workboxSW.strategies.staleWhileRevalidate({
	cacheName: 'material-design-lite'
}));

workboxSW.router.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/,
	workboxSW.strategies.staleWhileRevalidate({
	cacheName: 'post-images'
}));

workboxSW.router.registerRoute('https://litegram-268b1.firebaseio.com/posts.json', function(args) {
	return fetch(args.event.request)
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
		});
});

workboxSW.router.registerRoute(function(routeData) {
	return (routeData.event.request.headers.get('accept').includes('text/html'));
}, function(args) {
	return caches.match(args.event.request)
		.then(function(response) {
			if (response) {
				return response;
			} else {
				return fetch(args.event.request)
					.then(function(res) {
						return caches.open('dynamic')
							.then(function(cache) {
								cache.put(args.event.request.url, res.clone());
								return res;
							})
					})
					.catch(function(err) {
						return caches.match('/offline.html')
							.then(function(res) {
								return res;
							});
					});
			}
		})
});


workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "3ae7ea348d0d30725be568e437ecf26d"
  },
  {
    "url": "manifest.json",
    "revision": "e36c6e658bafcc7986dc04edabd2b05a"
  },
  {
    "url": "offline.html",
    "revision": "6bfaa46674494721a67e6177b21c185a"
  },
  {
    "url": "src/css/app.css",
    "revision": "cc00e6ce1f123079990583defbd0e31a"
  },
  {
    "url": "src/css/feed.css",
    "revision": "6024f45b9baf5aae1403289cbb30b6f1"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "c5122327ad27af379753c93c1ba0b738"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "89e764d825c062afb468cff1ef58960e"
  },
  {
    "url": "src/js/fetch.min.js",
    "revision": "f5cdc3ed2164132ed58641078b20c220"
  },
  {
    "url": "src/js/idb.min.js",
    "revision": "88ae80318659221e372dd0d1da3ecf9a"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.min.js",
    "revision": "d4c70d4f5bc179792a380942e5c5137e"
  },
  {
    "url": "src/js/utility.min.js",
    "revision": "2b788e574063696525699c96bf41ee1b"
  }
]);


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
						postData.append('rawLocationLat', dt.rawLocation.lat);
						postData.append('rawLocationLng', dt.rawLocation.lng);
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
							console.log('[Error while Sending Data]', err);
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