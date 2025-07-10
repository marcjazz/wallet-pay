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
}
