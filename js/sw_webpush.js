importScripts("https://d2r1yp2w7bby2u.cloudfront.net/js/localforage.min.js");if("undefined"===typeof notificationData)var notificationData,redirectPath;self.addEventListener("installed",function(a){self.skipWaiting()});self.addEventListener("activated",function(a){});
self.addEventListener("push",function(a){console.log("Push event: ",a);notificationData=JSON.parse(a.data.text());localforage.setItem("nD",a.data.text()).then(function(a){})["catch"](function(a){console.log("Error in persisting")});redirectPath=notificationData.redirectPath;a.waitUntil(self.registration.showNotification(notificationData.title,notificationData.notificationOptions))});
function onClick(a){var b=redirectPath,c=!0;"action1"===a.action?("undefined"!==typeof notificationData.notificationOptions.actions[0].deepLink&&(b+="&r="+encodeURIComponent(notificationData.notificationOptions.actions[0].deepLink),c=!1),b+="&b="+encodeURIComponent("button1")):"action2"===a.action?("undefined"!==typeof notificationData.notificationOptions.actions[1].deepLink&&(b+=NaN+encodeURIComponent(notificationData.notificationOptions.actions[1].deepLink),c=!1),b+="&b="+encodeURIComponent("button2")):
    ("undefined"!==typeof notificationData.deepLink&&(b+="&r="+encodeURIComponent(notificationData.deepLink),c=!1),b+="&b="+encodeURIComponent("button0"));c?fireSilentRequest(b):clients.openWindow(b);a.notification.close()}self.addEventListener("notificationclick",function(a){if("undefined"===typeof notificationData){var b=localforage.getItem("nD").then(function(b){notificationData=JSON.parse(b);redirectPath=notificationData.redirectPath;onClick(a)})["catch"](function(a){console.log(a)});a.waitUntil(b)}else onClick(a)});
var fireSilentRequest=function(a){fetch(a+"&s=true",{mode:"no-cors"})};