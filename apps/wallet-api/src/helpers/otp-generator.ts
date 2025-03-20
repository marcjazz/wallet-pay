// src/utils/otp-generator.ts

import { randomBytes } from 'crypto';

/**
 * Generates a numeric OTP of the specified length.
 * @param length - The length of the OTP.
 * @returns A string representing the generated OTP.
 */
export function generateOtp(length: number): string {
  const otp = randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .split('')
    .map((char) => parseInt(char, 16))
    .join('')
    .slice(0, length);

  return otp;
}

/**
 * Generate a random account number string format.
 * @param numberOfBlocs Number of blocs of 4 random numbers, default to 4
 * @param prefix default to empty string
 * @returns
 */
export function generateAccountNumber(prefix = '', numberOfBlocs = 4) {
  const accNumber = [...new Array(numberOfBlocs)].reduce<string>(
    (accNumber) => accNumber.concat(generateOtp(4), ''),
    prefix
  );
  return accNumber.trim();
}

export function generateTransactionId() {
  return generateAccountNumber(`${generateAccountNumber('XAF', 1)}PAY`, 1);
}
