export async function sendOTPNotification(phone: string, otp: string): Promise<void> {
  // TODO: Integrate with real SMS provider
  console.log(`[DEV] Sending OTP ${otp} to phone ${phone}`);
}

export async function sendEmailNotification(email: string, subject: string, message: string): Promise<void> {
  // TODO: Integrate with real email provider
  console.log(`[DEV] Sending email to ${email}: ${subject} - ${message}`);
}