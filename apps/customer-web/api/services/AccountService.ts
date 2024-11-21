import { ApiClient } from './ApiClient';
import {
  CybridAccountEntity,
  ExternalBankAccountEntity,
  VerifyCybridAccountDto,
  IdentityVerificationEntity,
  CreateWorkflowDto,
  CreateExternalAccountDto,
} from '../types/AccountTypes';

/**
 * Service for interacting with `/accounts` endpoints.
 */
export class AccountsService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Fetch all Cybrid accounts.
   * @returns Array of Cybrid accounts.
   */
  async findAll(): Promise<CybridAccountEntity[]> {
    return this.apiClient.get<CybridAccountEntity[]>('/api/v1/accounts');
  }

  /**
   * Fetch all external bank accounts.
   * @returns Array of external bank accounts.
   */
  async findAllExternals(): Promise<ExternalBankAccountEntity[]> {
    return this.apiClient.get<ExternalBankAccountEntity[]>(
      '/api/v1/accounts/externals'
    );
  }

  /**
   * Verify a Cybrid account or an external bank account.
   * @param payload Account verification details.
   * @returns Identity verification entity.
   */
  async verifyAccount(
    payload: VerifyCybridAccountDto
  ): Promise<IdentityVerificationEntity> {
    return this.apiClient.post<IdentityVerificationEntity>(
      '/api/v1/accounts/verify',
      payload
    );
  }

  /**
   * Initialize a Plaid connection workflow.
   * @param payload Workflow initialization details.
   * @returns Workflow creation confirmation (empty object).
   */
  async createWorkflow(payload: CreateWorkflowDto): Promise<void> {
    return this.apiClient.post<void>(
      '/api/v1/accounts/init-plaid-connect',
      payload
    );
  }

  /**
   * Add a new external bank account from Plaid data.
   * @param payload External account creation details.
   * @returns Created external bank account entity.
   */
  async createExternalAccount(
    payload: CreateExternalAccountDto
  ): Promise<ExternalBankAccountEntity> {
    return this.apiClient.post<ExternalBankAccountEntity>(
      '/api/v1/accounts/new-external-account',
      payload
    );
  }
}
