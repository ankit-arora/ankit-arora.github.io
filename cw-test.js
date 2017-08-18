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

importScripts('https://d2r1yp2w7bby2u.cloudfront.net/js/localforage.min.js');
var CACHE_VERSION = 4;
var CURRENT_CACHES = {
    prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

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
    // Delete all caches that aren't named in CURRENT_CACHES.
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
        return CURRENT_CACHES[key];
    });

    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (expectedCacheNames.indexOf(cacheName) === -1) {
                            // If this cache name isn't present in the array of "expected" cache names, then delete it.
                            console.log('Deleting out of date cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .catch(function(){
                console.log("Error while clearing cache")
            })
    );
});

self.addEventListener('push', function(event) {

    console.log('Push event: ', event);
    // get all the notification data
    notificationData = JSON.parse(event.data.text());
    var title = notificationData['title'];
    localforage.setItem(title, event.data.text()).then(function(value){
        // console.log("persisted");
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log("Error in persisting");
    });

    // extract the parameters we need and fill up the notification
    redirectPath = notificationData['redirectPath'];
    var notificationOptions = notificationData['notificationOptions'];
    var raiseNotificationViewedPath = notificationData['raiseNotificationViewedPath'];
    if(typeof raiseNotificationViewedPath !== "undefined"){
        //raise notification viewed event
        fetch(raiseNotificationViewedPath, {'mode': 'no-cors'}); //ignore the response
    }
    event.waitUntil(self.registration.showNotification(title, notificationOptions));

});

function onClick(event){
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
            finalDeepLink += '&r=' + encodeURIComponent(notificationData['notificationOptions']['actions'][1]['deepLink']);
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
}

self.addEventListener('notificationclick', function(event) {
    // if(typeof notificationData === "undefined"){
    var promise = localforage.getItem(event.notification.title).then(function(value) {
        notificationData = JSON.parse(value);
        redirectPath = notificationData['redirectPath'];
        // console.log("event",event);
        // console.log("redirect path: " + redirectPath);
        // console.log("notification data: " + notificationData);
        onClick(event);
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
    event.waitUntil(promise);
    // } else{
    //     onClick(event);
    // }
});

var fireSilentRequest = function(url) {
    // add the silent parameter to the deeplink so that LC knows not to raise an error
    url += '&s=true';

    // use the fetch API to make a silent request (we don't care about the response here)
    fetch(url, {'mode': 'no-cors'});
};
