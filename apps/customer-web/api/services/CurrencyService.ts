import { ApiClient } from './ApiClient';
import { CurrencyEntity } from '../types';

/**
 * Service for currency-related API calls.
 */
export class CurrencyService {
  constructor(private apiClient: ApiClient) {}

  async getCurrencies(isActive: boolean): Promise<CurrencyEntity[]> {
    return this.apiClient.get<CurrencyEntity[]>('/api/v1/currencies', {
      is_active: isActive,
    });
  }
}
