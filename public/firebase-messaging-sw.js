importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

let messaging = null;

// Config is sent from the app via postMessage — no hardcoded keys
self.addEventListener("message", (event) => {
  if (event.data?.type !== "INIT_FIREBASE") return;

  if (!firebase.apps.length) {
    firebase.initializeApp(event.data.config);
  }

  if (!messaging) {
    messaging = firebase.messaging();
  }
});

// Background push handler
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch { return; }

  const title = payload.notification?.title ?? "Family Hub";
  const body = payload.notification?.body ?? "";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "family-hub-notification",
    })
  );
});
