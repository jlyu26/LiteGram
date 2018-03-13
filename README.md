# LiteGram

A progressive web application that records and shares your life with the internet.

## PWA Basics

### What are Progressive Web Apps (PWAs)?

PWA is a term referring to **a couple of features** you can add to any web application/web page running in the browser, therefore to **enhance** it. You progressively enhance your existing web pages to make it feel and work more like native mobile apps. E.g. working when app is offline, having icon on homescreen, accessing device camera and location, synchronizing data in the background. PWAs are also supposed to works (with basic functions) on older browsers because the core thing is you **progressively** enhance a web application, which is not an all or nothing move.

1. Be reliable: load fast and provide offline functionality
2. Fast: Respond quickly to user actions
3. Engaging: Feel like a native app on mobile devices

Mobile Web vs Native Apps:

<img width="552" alt="pwa-vs-native-apps" src="https://user-images.githubusercontent.com/20265633/37131993-5940d38c-2259-11e8-96a3-4e17a7208799.PNG">

### Manifest

### Service Workers

Unlike normal loaded JavaScript files which runs on one single thread and attached to individual HTML pages, service worker runs on additional thread, decoupled from HTML pages. It manages **all pages** of given **scope** (e.g. all pages of a domain.) Scope by default is the folder the service worker sits in, so typically add `sw.js` to root folder. Service workers are **background processes**, they live on even after pages have been closed. And since they run on background, they are good at **reacting to events** by return a cached asset, show a notification to the user, etc.

<img width="510" alt="listenable-events" src="https://user-images.githubusercontent.com/20265633/37237883-9d3ab658-23e8-11e8-928b-372d1eedb4ec.PNG">

Service worker only works on HTTPS, because service worker is very powerful, it can intercept any request so you want to make sure that this is server on a secure host and this power isn't abused.

### Promises & Fetch API

### Caching

Caching with srvice workers —— providing **offline support** for our webapplication —— probably the main purpose of why we're using service workers. Occasions: poor connection (foorball game), no connection (elevator, underground), Lie-Fie (your phone displays it has a wifi connection but nah... especially in hotspots), etc. Offline support is offered by native apps (原生App) and that's what makes them more appreciated than traidtional web apps.

Disk cache has a disadvantage that it's controlled by browser and you as developer has little control over it, thus can't rely on the files being there when need them, or tell which assets to cache which not to cache. That's where **Cache API** steps in.

Cache API is a separate cache storage also lives in the browser but **managed by developer**. It holds key pairs where the key are HTTP requests you want to send, and the value is the respond you got back. (You do need to made the request successfully at least one time so that you got the response, otherwise you can't cache it.) Once you got the response, you can store it with the key (the request) and fetch it later on when you need to send that same request again but have no internet connection. Using **fetch event** in service worker is the key to intercept any request you wanna send, and with Cache API you have a complete network proxy living in service worker, which allows you to control if the request is allowed to continue to the network, or if you want to return a response from the cache if available.

Cache API can be accessed from not only service worker but also normal JavaScript files. However to access from service worker is more powerful, because you don't need to fetch service worker when visit the page, service worker is a background process and already running even without internet connection. On the other hand normal JS files sit on the server and loaded via request and without internet connection they can't even be loaded.

What to chache? Cache at least **App Shell** [[Document]](https://developers.google.com/web/fundamentals/architecture/app-shell). So first of all, find out what the app shell is (the core asset of your application that are visible on most pages, toolbar, basic styling, etc.) then **pre-cache** it during the installation of the service worker (static caching). Based on that, we can also **dynamically add files to cache** using different **caching strategies**.

