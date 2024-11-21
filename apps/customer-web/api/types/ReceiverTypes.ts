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
