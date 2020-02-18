(function Blog(){
	"use strict";

	var offlineIcon;
	var isLoggedIn = /isLoggedIn=1/.test(document.cookie.toString() || "");
	var isOnline = ("onLine" in navigator) ? navigator.onLine : true
	var usingSW = ("serviceWorker" in navigator)
	var swRegistration;
	var svcworker


	document.addEventListener("DOMContentLoaded",ready,false);

	initServiceWorker().catch(err => console.error(err))
	// **********************************

	function ready() {
		offlineIcon = document.getElementById("connectivity-status");

		if(!isOnline) {
			offlineIcon.classList.remove('hidden')
		}

		window.addEventListener('online', function online() {
			offlineIcon.classList.add('hidden')
			isOnline = true
			sendStatussUpdate()

		})
		window.addEventListener('offline', function() {
			offlineIcon.classList.remove('hidden')
			isOnline = false
			sendStatussUpdate()
		})
	}
	async function initServiceWorker() {
		swRegistration = await navigator.serviceWorker.register("/sw.js",{
			updateViaCache: "none"
		})
		svcworker = swRegistration.installing || swRegistration.waiting || swRegistration.active
		navigator.serviceWorker.addEventListener('controllerchange', function(){
			svcworker = navigator.serviceWorker.controller
			sendStatussUpdate(svcworker)
		})

		navigator.serviceWorker.addEventListener('message', onSWMessage)
	}

	function onSWMessage(e) {
		var {data} = e
		// tutaj strona wysyla do service workera, stan czy uzytkownik jest zalogowany i czy jest podlaczony do sieci
		//service worker nie ma dostepu do localStorage i cookies
		if(data.requestStatusUpdate) {
			console.log('Recevied status update request from service worker');
			sendStatussUpdate(e.ports && e.ports[0])
		}
	}

	function sendStatussUpdate(target) {
		sendSWMessage({statusUpdate:{isOnline, isLoggedIn}}, target)
	}

	async function sendSWMessage(msg, target) {
		if(target) {
			target.postMessage(msg)
		} else if (svcworker) {
			svcworker.postMessage(msg)
		} else {
			navigator.serviceWorker.controller.postMessage(msg)
		}
	}
})();
