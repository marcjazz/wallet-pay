'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { API_BASE_URL } from '../../api/constants';
import { ApiClient } from '../../api/services/ApiClient';
import { NotificationService } from '../../api/services/NotificationService';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotificationManager = () => {
  const { formatMessage } = useIntl();
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPermission(Notification.permission);

    // Ensure service worker is registered
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('Service Worker registered');
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  const requestPermission = async () => {
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    if (newPermission === 'granted') {
      subscribeUserToPush();
    }
  };

  const subscribeUserToPush = async () => {
    try {
      const serviceWorker = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        throw new Error('Missing VAPID public key in environment variables');
      }

      const subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      console.log('Push subscription:', subscription);

      const apiClient = ApiClient.getInstance(API_BASE_URL);
      const notificationService = new NotificationService(apiClient);
      await notificationService.subscribe(subscription);
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  };

  // Show the prompt if permission is not granted and the user has not dismissed it
  const open = !dismissed && permission !== 'granted';

  const handleClose = () => {
    setDismissed(true);
  };

  const action = (
    <>
      <Button
        variant="text"
        color="primary"
        size="small"
        onClick={requestPermission}
      >
        {formatMessage({ id: 'enablePushNotification' }).toUpperCase()}
      </Button>
      <IconButton size="small" color="inherit" onClick={handleClose}>
        <CloseIcon />
      </IconButton>
    </>
  );

  return (
    <Snackbar
      open={open}
      message="Enable push notification to get updates about KYC status and transactions status updates."
      action={action}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    />
  );
};

export default PushNotificationManager;
