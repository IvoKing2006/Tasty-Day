// Tasty Day – Service Worker (nur für Push-Benachrichtigungen, kein Offline-Cache)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: "Tasty Day", body: event.data ? event.data.text() : "" }; }
  const options = {
    body: data.body || "",
    icon: "icon-192.png",
    data: { url: data.url || "./" },
  };
  if (data.tag) options.tag = data.tag;
  event.waitUntil(self.registration.showNotification(data.title || "Tasty Day", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "./", self.registration.scope).href;
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of list) {
      if (client.url.startsWith(self.registration.scope) && "focus" in client) return client.focus();
    }
    return self.clients.openWindow(target);
  })());
});
