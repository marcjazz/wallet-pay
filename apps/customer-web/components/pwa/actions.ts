'use server'
 
import webpush, { PushSubscription } from 'web-push'
 
webpush.setVapidDetails(
  'mailto:kuidjamarco@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? ''
)
 
// This is a mock implementation. In a real application, you would store subscriptions in a database.
let subscription: PushSubscription | null = null;

/**
 * Subscribes a user to push notifications.
 * @param sub - The push subscription object.
 * @returns A promise that resolves to an object indicating success.
 */
export async function subscribeUser(sub: PushSubscription) {
  // Mock implementation: store subscription in memory
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

/**
 * Unsubscribes a user from push notifications.
 * @returns A promise that resolves to an object indicating success.
 */
export async function unsubscribeUser() {
  // Mock implementation: remove subscription from memory
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

/**
 * Sends a push notification to the subscribed user.
 * @param message - The message to send.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function sendNotification(message: string) {
  // Mock implementation: send a notification if a subscription exists
  if (!subscription) {
    throw new Error('No subscription available');
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/favicon.ico'
      })
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}