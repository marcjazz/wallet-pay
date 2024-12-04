export interface TransactionReceipt {
  transactionId: string;
  recipientName: string;
  customerName: string;
  initiatedAt: string;
  /**
   * Append currency to amount.
   */
  amountSent: string;
  receiptUrl: string;
  /**
   * Preferrable format:
   *
   *  23773016895 (Mobile Money Cameroon)
   */
  recipientPhoneNumber: string;
}

export function generateTransactionReceiptEmail(
  data: TransactionReceipt
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h1 style="text-align: left;">Transaction Receipt</h1>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for trusting XafPay! Below are the details of your payout transaction:</p>
          <p style="margin-top: 20px; font-size: 16px;">
            <strong>Transaction ID:</strong> ${data.transactionId}<br>
            <strong>Date:</strong> ${data.initiatedAt}<br>
            <strong>Amount Sent:</strong> ${data.amountSent}<br>
            <strong>Recipient names:</strong> ${data.recipientName}<br>
            <strong>Recipient phone number:</strong> ${data.recipientPhoneNumber}<br>
          </p>
          <p>Download complete details by login into your account and navigating to <a href="mailto:${data.receiptUrl}">${data.receiptUrl}</a>.</p>
          <div style="margin-top: 20px; text-align: center; padding: 10px 0; background-color: #f4f4f4; border-radius: 5px;">
            <p>If you have any questions, feel free to contact our support team at <a href="mailto:contact@xafpay.com">contact@xafpay.com</a>.</p>
          </div>
          <footer style="background: #1e2d3d; color: #ffffff; text-align: center; padding: 10px; font-size: 14px;">
            © Xafpay By Glom All rights reserved<br>
            <a href="https://twitter.com" style="color: #ffffff; text-decoration: none;">Twitter</a> |
            <a href="https://github.com" style="color: #ffffff; text-decoration: none;">GitHub</a> |
            <a href="https://facebook.com" style="color: #ffffff; text-decoration: none;">Facebook</a> |
            <a href="https://instagram.com" style="color: #ffffff; text-decoration: none;">Instagram</a>
          </footer>
        </div>
      </body>
    </html>
  `;
}
