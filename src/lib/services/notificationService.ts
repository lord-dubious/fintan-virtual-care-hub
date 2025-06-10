
// Simple notification service without external dependencies
class NotificationService {
  async sendPushNotification(userId: string, title: string, message: string) {
    console.log(`Push notification for ${userId}: ${title} - ${message}`);
    return { success: true };
  }

  async sendEmail(email: string, subject: string, message: string) {
    console.log(`Email to ${email}: ${subject} - ${message}`);
    return { success: true };
  }

  async sendSMS(phone: string, message: string) {
    console.log(`SMS to ${phone}: ${message}`);
    return { success: true };
  }
}

export const notificationService = new NotificationService();
