import { ReceiverEntity, ReceiverPayoutInfoDto } from '../api/types';

export enum ExternalAccountVerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
}

export enum RemittanceStep {
  amount = 1,
  recipient = 2,
  summary = 3,
}

export enum TransactionStatus {
  PROCESSING = 'PENDING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
}

export type Receiver =
  | (ReceiverPayoutInfoDto & {
      is_new: true;
    })
  | (ReceiverEntity & {
      is_new: false;
    });
