export function getInsufficientFundsAlertMessage(
  balance: number,
  attemptedAmount: number
) {
  return `Dear Team,
        
        The platform's payout account has insufficient funds to process a transaction.
        
        Available Balance: ${balance}
        Attempted Amount: ${attemptedAmount}
        
        Please top up the payout account as soon as possible to avoid transaction failures.
        
        Best regards,  
        XAfPay Platform`;
}
