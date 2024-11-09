import Image from 'next/image';
import { validatePhoneNumber } from '../shared/utilities';

export const PhoneNetworkIcon = (phoneNumber: string) => {
  const result = validatePhoneNumber(phoneNumber);
  if (result === 0) {
    return (
      <Image
        src="/assets/momo.svg"
        height="32"
        width="32"
        alt="MTN mobile money Logo" />
    );
  } else if (result === 1) {
    return (
      <Image
        src="/assets/om.svg"
        height="32"
        width="32"
        alt="Orange money Logo" />
    );
  } else {
    return (
      <Image
        src="/assets/alert.svg"
        height="32"
        width="32"
        alt="lambda Logo" />
    );
  }
};