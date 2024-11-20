import { ReceiverEntity } from '../types';
import { ApiClient } from './ApiClient';

/**
 * Service for counterparty-related API calls.
 */
export class CounterpartyService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Find all counterparties with optional search criteria.
   * @param search Optional search term to filter counterparties.
   */
  async findCounterparties(search?: string): Promise<ReceiverEntity[]> {
    return this.apiClient.get<ReceiverEntity[]>('/api/v1/counterparties', {
      search,
    });
  }

  /**
   * Find a specific counterparty by its ID.
   * @param id Unique ID of the counterparty.
   */
  async findCounterpartyById(id: string): Promise<ReceiverEntity> {
    return this.apiClient.get<ReceiverEntity>(`/api/v1/counterparties/${id}`);
  }
}
