'use client';

import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { subscribeUser, unsubscribeUser } from './actions';
import { PushSubscription } from 'web-push';

/**
 * A component to manage push notification subscriptions.
 * It allows users to enable or disable push notifications.
 */
export function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState('default');

  useEffect(() => {
    async function checkSubscription() {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const serviceWorker = await navigator.serviceWorker.ready;
        const subscription = await serviceWorker.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
      setIsLoading(false);
    }

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    checkSubscription();
  }, []);

  /**
   * Handles the subscription change event.
   * Subscribes or unsubscribes the user from push notifications.
   */
  const handleSubscriptionChange = async () => {
    setIsLoading(true);
    if (isSubscribed) {
      await unsubscribeUser();
      setIsSubscribed(false);
    } else {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        const serviceWorker = await navigator.serviceWorker.ready;
        const subscription = await serviceWorker.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        await subscribeUser(subscription as unknown as PushSubscription);
        setIsSubscribed(true);
      }
    }
    setIsLoading(false);
  };

  if (notificationPermission === 'denied') {
    return (
      <p>
        Push notifications have been disabled. Please enable them in your
        browser settings.
      </p>
    );
  }

  return (
    <Button onClick={handleSubscriptionChange} disabled={isLoading}>
      {isLoading
        ? 'Loading...'
        : isSubscribed
        ? 'Disable'
        : 'Enable'}{' '}
      Push Notifications
    </Button>
  );
}