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