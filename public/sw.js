// Allure PWA Service Worker — Push Notifications

// Activate immediately
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification received
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Allure", body: event.data.text() };
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-152.png",
    badge: "/icons/icon-152.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "allure-notification",
    renotify: true,
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title || "Allure", options));
});

// Notification click — focus or open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Push subscription change — re-subscribe automatically
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((newSubscription) => {
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSubscription.toJSON()),
        });
      })
  );
});
