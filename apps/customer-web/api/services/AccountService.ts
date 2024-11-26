import { VerificationStatus } from '../types';
import {
  CreateExternalAccountDto,
  CreateWorkflowDto,
  CybridAccountEntity,
  ExternalBankAccountEntity,
  IdentityVerificationEntity,
  VerifyCybridAccountDto,
  WorkflowEntity,
} from '../types/AccountTypes';
import { ApiClient } from './ApiClient';

/**
 * Service for interacting with `/accounts` endpoints.
 */
export class AccountService {
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
  async findAllExternals(
    verificationStatus?: VerificationStatus
  ): Promise<ExternalBankAccountEntity[]> {
    return this.apiClient.get<ExternalBankAccountEntity[]>(
      `/api/v1/accounts/externals${
        verificationStatus ? `?verification_status=${verificationStatus}` : ''
      }`
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
  async createWorkflow(payload: CreateWorkflowDto): Promise<WorkflowEntity> {
    return this.apiClient.post<WorkflowEntity>(
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
