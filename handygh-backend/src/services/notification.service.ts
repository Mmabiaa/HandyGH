import { Injectable } from 'tsyringe';
import { SMSProvider } from '../utils/sms';
import { EmailProvider } from '../utils/email';
import { Logger } from '../utils/logger';

@Injectable()
export class NotificationService {
  private smsProvider: SMSProvider;
  private emailProvider: EmailProvider;
  private logger: Logger;

  constructor() {
    this.smsProvider = new SMSProvider();
    this.emailProvider = new EmailProvider();
    this.logger = new Logger();
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    try {
      await this.smsProvider.send(phone, message);
      this.logger.info(`SMS sent to ${phone}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}: ${error.message}`);
      throw new Error('SMS sending failed');
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.emailProvider.send(to, subject, body);
      this.logger.info(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error('Email sending failed');
    }
  }
}