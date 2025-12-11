// @ts-ignore - africastalking uses CommonJS
import AfricasTalking from 'africastalking';

interface SendPlanLinkResult {
  success: boolean;
  error?: any;
}

/**
 * Sends an SMS notification to the user with their personalized fitness plan link
 * @param phone - Phone number in international format (e.g., +254712345678)
 * @param name - User's name for personalization
 * @param planId - The unique plan ID/slug (e.g., '8x92a')
 * @returns Promise with success status and optional error
 */
export async function sendPlanLink(
  phone: string,
  name: string,
  planId: string
): Promise<SendPlanLinkResult> {
  try {
    // Get environment variables
    const username = import.meta.env.AFRICASTALKING_USERNAME;
    const apiKey = import.meta.env.AFRICASTALKING_API_KEY;
    const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

    // Validate required credentials
    if (!username || !apiKey) {
      console.error('Africa\'s Talking credentials not configured');
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    // Initialize Africa's Talking client
    const africastalking = AfricasTalking({
      username,
      apiKey,
    });

    // Get SMS service
    const sms = africastalking.SMS;

    // Construct the message
    const message = `Hi ${name}, your personalized Bura Fitness plan is ready! View it here: ${baseUrl}/plan/${planId}`;

    // Send SMS
    const response = await sms.send({
      to: [phone],
      message,
    });

    // Check if send was successful
    if (response.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
      console.log(`SMS sent successfully to ${phone}`);
      return { success: true };
    } else {
      const errorMessage = response.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error';
      console.error(`SMS send failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    // Log error but don't throw - fail open strategy
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

