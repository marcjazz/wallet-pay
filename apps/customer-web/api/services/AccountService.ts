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
    const { identity_verification_guid } =
      await this.apiClient.post<IdentityVerificationEntity>(
        '/api/v1/accounts/identity-verification/verify',
        payload
      );

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const identityVerification = await this.getIdentityVerification(
        identity_verification_guid
      );
      if (identityVerification.state === 'WAITING') {
        return identityVerification;
      } else if (identityVerification.state === 'FAILED') {
        throw new Error('Identity verification failed');
      } else {
        // Wait for 1 second before checking again.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Verify a Cybrid account or an external bank account.
   * @param payload Account verification details.
   * @returns Identity verification entity.
   */
  async getIdentityVerification(
    identityVerificationGuid: string
  ): Promise<IdentityVerificationEntity> {
    return this.apiClient.get<IdentityVerificationEntity>(
      `/api/v1/accounts/identity-verification/${identityVerificationGuid}`
    );
  }

  /**
   * Initialize a Plaid connection workflow.
   * @param payload Workflow initialization details.
   * @returns Workflow guid.
   */
  async createWorkflow(payload: CreateWorkflowDto): Promise<WorkflowEntity> {
    const { workflow_guid } = await this.apiClient.post<{
      workflow_guid: string;
    }>('/api/v1/accounts/plaid-connect/init', payload);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const workflow = await this.getWorkflow(workflow_guid);
      if (workflow.state === 'completed') {
        return workflow;
      } else if (workflow.state === 'failed') {
        throw new Error('Plaid connection');
      } else {
        // Wait for 1 second before checking again.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Get initiliazed Plaid connection workflow.
   * @param workflowGuid Workflow guid details.
   * @returns Workflow entity.
   */
  async getWorkflow(workflowGuid: string): Promise<WorkflowEntity> {
    return this.apiClient.get<WorkflowEntity>(
      `/api/v1/accounts/plaid-connect/${workflowGuid}`
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
