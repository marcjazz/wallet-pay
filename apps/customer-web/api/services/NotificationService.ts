import { ApiClient } from './ApiClient';

/**
 * Service for interacting with `/notifications` endpoints.
 */
export class NotificationService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Subscribe to push notifications.
   * @param subscription Push subscription object.
   */
  async subscribe(subscription: PushSubscription): Promise<void> {
    return this.apiClient.post<void>(
      '/api/notifications/subscribe',
      subscription
    );
  }
}