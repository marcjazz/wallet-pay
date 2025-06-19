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
    /^([1-9]{1,3})?6(((7|8)[0-9]{7}$)|(5[1-4][0-9]{6}$))/
  );
  const orangeRegexp = new RegExp(
    /^([1-9]{1,3})?6(((9)[0-9]{7}$)|(5[5-9][0-9]{6}$))/
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

/**
 * Validate if user is polite active or not.
 * Takes name and email and check if these exist on the given list
 * @param name  full name of user
 * @param email email of user
 * @returns boolean
 *
 */
export function isUserPilotActive({
  name,
  email,
}: {
  name: string;
  email: string;
}): boolean {
  const pilotActiveUser: { name: string; email: string }[] = [
    { name: 'Terence Njong', email: 'terencenjong@yahoo.com' },
    { name: 'Gilbert Berka Mengnjo', email: 'Gilbert.mengnjo@gmail.com' },
    { name: 'Zaumu Nelson', email: 'nelson.zaumu@gmail.com' },
    { name: 'Austin Verla', email: 'austin79verla@gmail.com' },
    { name: 'Lawrence Verla Shang', email: 'Shangverla@gmail.com' },
    { name: 'Sandra Fru', email: 'sandra.fru@outlook.com' },
    { name: 'Ngweka Queen', email: 'queen.cindy@yahoo.com' },
    { name: 'Lontsi Walters', email: 'lontsiwalters57@gmail.com' },
    { name: 'Chesi Derick', email: 'chesicrazy@yahoo.com' },
    { name: 'Amba Bole', email: 'inice1995@gmail.com' },
    { name: 'James Nyingcho', email: 'nyingchojames@yahoo.com' },
    { name: 'Solange Ngingwan', email: 'mafondi@yahoo.com' },
    { name: 'Lionel Che Ndingwan', email: 'lionelndingwan@gmail.com' },
    { name: 'Geraldine Fru', email: 'gerafru75@yahoo.com' },
    { name: 'Kodia Hope', email: 'kodiasteerforth@gmail.com' },
  ];

  // Normalize both input and reference names for comparaison
  const normalizeName = (fullName: string) => {
    return fullName.toLowerCase().split(/\s+/).sort().join(' ');
  };

  return pilotActiveUser.some((user) => {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return true;
    }

    const normalizedFullName = normalizeName(user.name);
    const normalizedInputName = normalizeName(name);

    return normalizedFullName === normalizedInputName;
  });
}
