export interface SignInDto {
  /** Valid user email. */
  email: string;
  /** Strong password. */
  password: string;
}

export interface SignUpDto {
  /** Valid user email. */
  email: string;
  /** Strong password. */
  password: string;
  /** Country code. */
  country: 'USA' | 'CANADA';
  /** Unique username. */
  username: string;
  /** User's first name. */
  first_name: string;
  /** User's last name. */
  last_name: string;
  /** User's phone number. */
  phone_number: string;
  /** User's birthdate in ISO format. */
  birthdate: string;
  /** User's gender. */
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  /** Preferred language for the user. */
  preferred_language: 'EN_US' | 'FR';
}

export interface AccessTokenResponse {
  /** The access token string. */
  access_token: string;
  /** The expiration time in milliseconds. */
  expires_in: number;
  /** Issuance date in milliseconds. */
  issued_at: number;
  /** Token type, always `Bearer`. */
  token_type: 'Bearer';
  /** One time password identifier for unverified accounts */
  otp_id?: string;
}

export interface LogoutResponse {
  /** Message confirming successful logout. */
  message: string;
}
