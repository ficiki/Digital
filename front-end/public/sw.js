// front-end/public/sw.js

console.log('Service Worker Loaded');

self.addEventListener('push', e => {
  let data;
  try {
    data = e.data.json();
  } catch (error) {
    console.warn('Push payload is not valid JSON. Treating as text.', error);
    const plainText = e.data.text();
    data = {
      title: 'Notifikasi',
      body: plainText,
      data: { url: '/' }
    };
  }

  console.log('Push Received...', data);

  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.body || 'Anda memiliki pembaruan baru.',
    icon: '/logo/image.jpg',
    badge: '/logo/image.jpg',
    data: {
      url: data.data?.url || '/'
    }
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  const notification = e.notification;
  notification.close();

  e.waitUntil(
    clients.openWindow(notification.data.url)
  );
});
