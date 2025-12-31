import nodemailer, { Transporter } from "nodemailer";
import { IEmailService } from "../../application/services/IEmailService";

export class NodemailerEmailService implements IEmailService {
  private _transporter: Transporter;
  private _from: string;

  constructor() {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      throw new Error("SMTP configuration missing in environment variables");
    }

    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this._from = process.env.SMTP_FROM;
  }

  async sendTextEmail(
    to: string,
    subject: string,
    text: string
  ): Promise<void> {
    await this._transporter.sendMail({
      from: this._from,
      to,
      subject,
      text,
    });
  }
}
