export type RemittanceEntity = {
  amount: number;
  currency: 'XAF' | 'EUR';
  externalId: string;
  payee: {
    partyIdType: 'MSISDN';
    partyId: string;
  };
  payeeNote: string;
  payerMessage: string;
  originatingCountry: string;
  originalCurrency: 'USD';
  payerIdentificationType: 'IDCD';
  payerIdentificationNumber: string;
  payerIdentity: string;
  payerFirstName: string;
  payerLanguageCode: 'en' | 'fr' | 'es'; // Add more languages if needed
  payerEmail: string;
  payerMsisdn: string;
  payerGender: 'MALE' | 'FEMALE' | 'OTHER';
};

export type InitiatePayoutPayload = {
  amount: number;
  receipientPhonenumber: string;
  customerEmail: string;
  transactionId: string;
  callbackUrl?: string;
};

export type MoMoAccessToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number;
};

export type AccountHolderBasicInfo = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  birthdate: string; // ISO 8601 date string (YYYY-MM-DD)
  locale: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN'; // Enum for gender
  updated_at: number; // Unix timestamp in seconds
};
