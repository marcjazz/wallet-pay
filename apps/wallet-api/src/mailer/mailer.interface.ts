export interface MailerOptions {
  user?: string;
  pass?: string;
  host?: string;
  secure: boolean;
}

export interface ISendTextMail {
  to: string;
  from?: string;
  subject: string;
  text: string;
}
