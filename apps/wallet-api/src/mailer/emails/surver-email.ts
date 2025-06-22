export function generateSurveyEmail(name: string) {
  return `
<html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h1 style="text-align: left;">Survey Email</h1>
          <p>Dear ${name},</p>
          <p>Thank you for participating in the soft launch of our remittance platform! We're thrilled you took the time to try it out and send money using our service.</p>
          <p> As we continue to improve, your feedback is incredibly valuable. We'd really appreciate it if you could take 2–3 minutes to complete a short survey about your experience.</p>
          <a href="https://forms.gle/ExTjyxr5xNMo6STNA" style="; text-decoration: none;">👉 link to fill survey form</a>
          <p>Your thoughts will help us identify what’s working well and what we can do better before our full launch.</p>
          <p>Thanks again for your support.</p>
          <div style="display:grid">
          Warm regards,
          <strong>The Xafpay Team</strong>
          <a href="www.xafpay.com" style="; text-decoration: none;">www.xafpay.com</a>
          </div>
          <div style="margin-top: 20px; text-align: center; padding: 10px 0; background-color: #f4f4f4; border-radius: 5px;">
          <p style="margin-top: 20px; font-size: 16px;">
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
    </html>    
    `;
}
