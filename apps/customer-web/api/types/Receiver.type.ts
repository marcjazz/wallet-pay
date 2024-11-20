/**
 * DTO for receiver payout information.
 */
export interface ReceiverPayoutInfoDto {
  /** Full name of the receiver. */
  fullname: string;
  /** Receiver's national ID number. Optional if not applicable. */
  national_id_number?: string | null;
  /** Receiver's phone number. */
  phone_number: string;
  /** Unique ID for the receiver, if applicable. */
  receiver_id?: string | null;
}

export interface ReceiverEntity {
  fullname: string;
  national_id_number: string | null;
  phone_number: string;
  receiver_id: string;
  receiver_guid: string;
  person_id: string;
  created_at: Date;
}
