"use strict";

const version = 2;
var isOnline = true;
var isLoggedIn = false

//self jest to bezposrednie odwolanie do service workera
self.addEventListener('install', onInstall)
self.addEventListener('activate', onActivate)
self.addEventListener('message', onMessage)
main().catch(console.error)

async function main () {
  console.log(`wersja ${version}`);
  await sendMessage({
    requestStatusUpdate: true
  })
}

async function sendMessage(msg) {
  var allClients = await clients.matchAll({
    includeUncontrolled: true
  })
  return Promise.all(
    allClients.map(client => {
      var channel = new MessageChannel()
      channel.port1.onmessage = onMessage
      return client.postMessage(msg, [channel.port2])
    })
  )
}

function onMessage(e) {
  if(e.data.statusUpdate) {
    ({isOnline, isLoggedIn} = e.data.statusUpdate)
    console.log('isOnline,', isOnline);
    console.log('isLoggedIn', isLoggedIn);
  }
}

async function onInstall(e) {
  console.log(`To jest wersja ${version} instaluje`);
  // wymusza na danym service workerze by byl aktywny (poprzedni stan to waiting)
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
  console.log(e);
  self.skipWaiting()
}

function onActivate(e) {
  
  // w przypadku gdy karta zostanie zamknieta chcemy kontrolowac flow, gdzie np. chcemy zainstalowac naszego service workera
  // https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
  e.waitUntil(handleActivation())
}

async function handleActivation() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
  await clients.claim()
  console.log(`To jest wersja ${version} aktywny`);
}