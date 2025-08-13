interface ConfirmEmail {
  otpCode: string;
}
export function generateOtpCodeEmail(data: ConfirmEmail) {
  return `<!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Email</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
        <div style="background-color: #eaf3ff; text-align: center; padding: 20px;">
          <h1 style="margin: 0; font-size: 24px; color: #333;">${data.otpCode}</h1>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; color: #666;">One time password from XafPay</p>
          <p style="font-size: 16px; color: #666;">Please copy and paste the above code in your XafPay application</p>
          <p style="font-size: 16px; color: #666;">This code has <strong>5 minutes</strong> validity period.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; padding: 10px 0; background-color: #f4f4f4; border-radius: 5px;">
            <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@xafpay.com">support@xafpay.com</a>.</p>
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
    </html>`;
}
