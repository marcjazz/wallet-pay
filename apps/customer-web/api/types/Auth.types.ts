import { Country, Gender, Language } from './enums';

/**
 * DTO for user sign-in.
 */
export interface SignInDto {
  /** Valid user email. */
  email: string;
  /** Strong password. */
  password: string;
}

/**
 * Response DTO containing authentication tokens.
 */
export interface AuthTokensDto {
  /** Access token for authenticated requests. */
  access_token: string;
  /** Refresh token to obtain a new access token. */
  refresh_token: string;
}

/**
 * DTO for user sign-up.
 */
export interface SignUpDto {
  /** Valid user email. */
  email: string;
  /** Strong password. */
  password: string;
  /** Country code. */
  country: Country;
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
  gender: Gender;
  /** Preferred language for the user. */
  preferred_language: Language;
}

export type RefreshTokenDto = Pick<AuthTokensDto, 'refresh_token'>;
