/**
 * Author: Jashan Shewakramani
 * Last updated: 27 June 2016
 * Description: Service worker for handling chrome push notifications
 *
 * NOTES:
 * -> "self" refers to the global ServiceWorker Object
 * -> This script is registered to the browser from a.js
 * -> We're only handling notification clicks; "delivered" is handled by NB
 * -> Use Google's closure compiler on http://closure-compiler.appspot.com/ for minifying
 */

if(typeof notificationData === "undefined"){
    // set up some variables we need globally
    var notificationData;
    var redirectPath; // when showing thr url; we need to log to LC before opening up the deep link
}

self.addEventListener('installed', function(event) {
    // force this service worker to become the active service worker; removes any previous implementations or migrations
    self.skipWaiting();
    // console.log('Service worker installed', self, event);
});

self.addEventListener('activated', function(event) {
    // console.log('Service worker activated', self, event);
});

self.addEventListener('push', function(event) {

    console.log('Push event: ', event);
    // get all the notification data
    notificationData = JSON.parse(event.data.text());
    // localStorage.setItem("nD",event.data.text());
    // if (window.indexedDB) {
    //
    // }

    // extract the parameters we need and fill up the notification
    redirectPath = notificationData['redirectPath'];
    var notificationOptions = notificationData['notificationOptions'];
    var title = notificationData['title'];
    event.waitUntil(self.registration.showNotification(title, notificationOptions));

});


self.addEventListener('notificationclick', function(event) {
    // if(typeof notificationData === "undefined"){
    //     notificationData = JSON.parse(localStorage.getItem("nD"));
    //     redirectPath = notificationData['redirectPath'];
    // }
    var finalDeepLink = redirectPath;
    var silentRequest = true; // are opening up a new window or sending a quiet get request from here?
    if (event.action === 'action1') {
        // button 1 was clicked
        if (typeof notificationData['notificationOptions']['actions'][0]['deepLink'] !== 'undefined') {
            finalDeepLink += '&r=' +  encodeURIComponent(notificationData['notificationOptions']['actions'][0]['deepLink']);
            silentRequest = false;
        }
        finalDeepLink += '&b=' + encodeURIComponent('button1');
    } else if (event.action === 'action2') {
        // the second button was clicked
        if (typeof notificationData['notificationOptions']['actions'][1]['deepLink'] !== 'undefined') {
            finalDeepLink += + '&r=' + encodeURIComponent(notificationData['notificationOptions']['actions'][1]['deepLink']);
            silentRequest = false;
        }
        finalDeepLink += '&b=' + encodeURIComponent('button2');
    } else {
        // general click
        if (typeof notificationData['deepLink'] !== 'undefined') {
            finalDeepLink += '&r=' + encodeURIComponent(notificationData['deepLink']);
            silentRequest = false;
        }

        finalDeepLink += '&b=' + encodeURIComponent('button0');
    }

    if (silentRequest) {
        fireSilentRequest(finalDeepLink);
    } else {
        clients.openWindow(finalDeepLink);
    }
    event.notification.close();
});

var fireSilentRequest = function(url) {
    // add the silent parameter to the deeplink so that LC knows not to raise an error
    url += '&s=true';

    // use the fetch API to make a silent request (we don't care about the response here)
    fetch(url, {'mode': 'no-cors'});
};
