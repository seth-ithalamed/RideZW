// RideZW Service Worker for Background Push Notifications & Offline Caching

const CACHE_NAME = 'ridezw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Background Push Notification Listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'RideZW Alert',
    body: 'New trip update or driver bid received.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'ridezw-trip-update',
    url: '/'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [200, 100, 200, 100, 300],
    tag: data.tag || 'ridezw-notification',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      tripId: data.tripId
    },
    actions: [
      { action: 'open', title: 'Open RideZW' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
