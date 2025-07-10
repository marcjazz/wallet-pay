export type PayoutPayload = {
  amount: number;
  trackId: string;
  receipientPhonenumber: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderMobilePhone?: string;
};

export type SurverPerson = {
  person_id: string;
  email: string;
  first_name: string;
};
