import { type IdentityVerificationBankModel } from '@cybrid/cybrid-api-bank-typescript';
import { type IdentityVerificationStatus } from '@prisma/client';

export function roundNumber(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Check if a phone number is an MTN or Orange number
 * @param phoneNumber phone number to test
 * @returns 0 if MTN, 1 if Orange, and -1 otherwise.
 */
export function validatePhoneNumber(phoneNumber: string) {
  const testCase = phoneNumber.replace('+', '');
  const mtnRegexp = new RegExp(
    /^[1-9]{1,3}6(((7|8)[0-9]{7}$)|(5[1-4][0-9]{6}$))/
  );
  const orangeRegexp = new RegExp(
    /^[1-9]{1,3}6(((9)[0-9]{7}$)|(5[5-9][0-9]{6}$))/
  );
  if (mtnRegexp.test(testCase)) return 0;
  else if (orangeRegexp.test(testCase)) return 1;
  return -1;
}

/**
 * Transform cybrid verification status to internal verification status
 * @param identityVerification
 * @returns
 */
export function verificationStatusFrom({
  state,
  outcome,
}: IdentityVerificationBankModel): IdentityVerificationStatus {
  return state === 'completed' && outcome === 'failed'
    ? 'FAILED'
    : state === 'completed' && outcome === 'passed'
    ? 'PASSED'
    : !state
    ? 'STORING'
    : (state.toLocaleUpperCase() as IdentityVerificationStatus);
}
