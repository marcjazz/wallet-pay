import { CameroonRegions } from './EnumTypes';

/**
 * DTO for receiver payout information.
 */
export interface ReceiverPayoutInfoDto {
  /** Receiver's national ID number. Optional if not applicable. */
  national_id_number?: string | null;
  /** Receiver's phone number. */
  phone_number?: string | null;
  /** Unique ID for the receiver, if applicable. */
  receiver_id: string;
}

export interface ReceiverEntity {
  /** Full name of the receiver. */
  fullname: string;
  /** National ID number of the receiver (optional). */
  national_id_number?: string | null;
  /** Receiver's phone number. */
  phone_number: string;
  /** Unique receiver ID. */
  receiver_id: string;
  /** Globally unique receiver GUID. */
  receiver_guid: string;
  /** Timestamp of creation. */
  created_at: string;
}

export type CreateReceiverDto = {
  fullname: string;
  address: AddressDto;
  national_id_number?: string | null;
  phone_number: string;
};

/**
 * Represents an address with details about location and optional metadata.
 */
export interface AddressDto {
  /**
   * The city name.
   */
  city: string;

  /**
   * The primary street address.
   */
  street: string;

  /**
   * The region or subdivision of the address.
   * Must be one of the predefined values in the CameroonRegions enum.
   */
  subdivision: CameroonRegions;

  /**
   * An optional second line for the street address (e.g., apartment or suite number).
   * Can be null if not provided.
   */
  street2?: string | null;

  /**
   * The country code for the address. Default is '+237'.
   * This field is optional.
   */
  country_code?: string;

  /**
   * The postal code for the address. This field is optional and can be null.
   */
  postal_code?: string | null;
}
