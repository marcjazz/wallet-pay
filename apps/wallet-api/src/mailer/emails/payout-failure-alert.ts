export function getPayoutFailureAlertMessage(
  transactionId: string,
  recipientPhone: string,
  amount: number,
  message: string
) {
  return `Dear Team,

        A remittance transaction payout has failed during processing.

        Transaction ID: ${transactionId}
        Recipient Phone: ${recipientPhone}
        Amount: ${amount}
        Message: ${message}

        Please investigate and take the necessary actions to resolve the issue promptly.

        Best regards,  
        XAfP`;
}
