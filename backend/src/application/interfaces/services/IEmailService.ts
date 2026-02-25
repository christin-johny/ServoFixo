
export interface IEmailService {
  sendTextEmail(to: string, subject: string, text: string): Promise<void>;
}
