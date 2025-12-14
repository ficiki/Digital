// src/utils/pushNotifications.js
import { authService, notificationService } from '../services/api';

/**
 * Converts a base64 string to a Uint8Array.
 * This is needed to convert the VAPID public key.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribes the user to push notifications.
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push messaging is not supported');
    alert('Maaf, notifikasi push tidak didukung di browser Anda.');
    return;
  }

  try {
    const swRegistration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker Registered');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permission for notifications was denied');
      alert('Anda telah menolak izin notifikasi. Anda bisa mengaktifkannya di pengaturan browser.');
      return;
    }

    // Get VAPID public key from the server
    const response = await notificationService.getVapidKey();
    const vapidPublicKey = response.data.publicKey;
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe the user
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    console.log('User is subscribed:', subscription);

    // Send the subscription to the backend
    await notificationService.subscribe(subscription);
    console.log('Subscription sent to the backend');
    alert('Anda berhasil berlangganan notifikasi push!');

  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('Gagal berlangganan notifikasi. Silakan coba lagi.');
  }
}
