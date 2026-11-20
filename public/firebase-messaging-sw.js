/* Service worker de push (FCM). Se completa en T-070: notificaciones en segundo plano
   y apertura de data.link al tocarlas. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) { c.navigate(link); return c.focus(); }
      return self.clients.openWindow(link);
    }),
  );
});
