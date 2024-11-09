export function preventRouteWhenSubmitting(
  event: React.MouseEvent,
  isSubmitting: boolean
) {
  if (isSubmitting) {
    event.preventDefault();
  }
}

export function getUsernameInitials(text: string, numberOfInitials?: number) {
  const arr = text.split(' ').map((name) => name[0].toUpperCase());
  numberOfInitials = numberOfInitials || 2;
  if (arr.length < numberOfInitials) return arr.join('');
  return arr.slice(0, numberOfInitials).join('');
}

/**
 * Check if a phone number is an MTN or Orange number
 * @param phoneNumber phone number to test
 * @returns 0 if MTN, 1 if Orange, and -1 otherwise.
 */
export function validatePhoneNumber(phoneNumber: string) {
  const mtnRegexp = new RegExp(/^6(((7|8)[0-9]{7}$)|(5[1-4][0-9]{6}$))/);
  const orangeRegexp = new RegExp(/^6(((9)[0-9]{7}$)|(5[5-9][0-9]{6}$))/);
  if (mtnRegexp.test(phoneNumber)) return 0;
  else if (orangeRegexp.test(phoneNumber)) return 1;
  return -1;
}
