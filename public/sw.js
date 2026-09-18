// Service Worker for Aura Moda & Calzado Push & Background Sync
const CACHE_NAME = 'aura-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for push events (if backend push is configured)
self.addEventListener('push', (event) => {
  let data = { title: '🛍️ Nuevo Pedido', body: 'Has recibido un nuevo pedido en Aura Moda & Calzado.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [300, 150, 300, 150, 450],
    tag: 'aura-order-alert',
    renotify: true,
    data: {
      url: '/?mode=admin'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/?mode=admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes('mode=admin') || client.url.includes('/admin')) {
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
