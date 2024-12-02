import { CreateReceiverDto, ReceiverEntity } from '../types';
import { ApiClient } from './ApiClient';

/**
 * Service for receiver-related API calls.
 */
export class ReceiverService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Find all receivers with optional search criteria.
   * @param search Optional search term to filter receivers.
   */
  async findReceivers(search?: string): Promise<ReceiverEntity[]> {
    return this.apiClient.get<ReceiverEntity[]>('/api/v1/receivers', {
      search,
    });
  }

  /**
   * Find a specific receiver by its ID.
   * @param id Unique ID of the receiver.
   */
  async findReceiverById(id: string): Promise<ReceiverEntity> {
    return this.apiClient.get<ReceiverEntity>(`/api/v1/receivers/${id}`);
  }

  /**
   * Create a new receiver.
   * @param receiverData Data for the new receiver.
   */
  async createReceiver(
    receiverData: CreateReceiverDto
  ): Promise<ReceiverEntity> {
    return this.apiClient.post<ReceiverEntity>(
      '/api/v1/receivers',
      receiverData
    );
  }
}
