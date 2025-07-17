import { Gender, Language } from './EnumTypes';

/**
 * Entity representing a user.
 */
export interface UserEntity {
  /** User's email address. */
  email: string;
  /** User's password. */
  password: string;
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
  /** User's preferred language. */
  preferred_language: Language;
  /** Unique identifier for the user. */
  user_id: string;
  /** Timestamp when the user was created. */
  created_at: string;
  /** Whether the user's email is verified. */
  is_verified: boolean;
  /** Whether the user is cybrid verified (restricts profile editing). */
  cybrid_verified: boolean;
}

/**
 * DTO for updating user profile.
 */
export interface UpdateProfileDto {
  /** User's email address (always editable). */
  email?: string;
  /** User's phone number (always editable). */
  phone_number?: string;
  /** User's first name (editable only if not cybrid verified). */
  first_name?: string;
  /** User's last name (editable only if not cybrid verified). */
  last_name?: string;
  /** User's birthdate (editable only if not cybrid verified). */
  birthdate?: string;
}
