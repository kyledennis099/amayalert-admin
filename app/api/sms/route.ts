import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// TextBee configuration
const BASE_URL = 'https://api.textbee.dev/api/v1';

const getConfig = () => {
  const apiKey = process.env.TEXTBEE_API_KEY || 'a98c7417-f31f-4ff0-b3f5-ec853488db96';
  const deviceId = process.env.TEXTBEE_DEVICE_ID || '691db1a082033f1609644e03';

  if (!apiKey || !deviceId) {
    throw new Error('Missing required TextBee configuration');
  }

  return {
    apiKey,
    deviceId,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    // Validation
    if (!to || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: to and message are required',
        },
        { status: 400 },
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s+/g, ''))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number format. Use international format (e.g., +1234567890)',
        },
        { status: 400 },
      );
    }

    // Get TextBee configuration
    const config = getConfig();

    // Ensure phone number has + prefix
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;

    // Send SMS via TextBee
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${config.deviceId}/send-sms`,
      {
        recipients: [formattedPhone],
        message: message,
      },
      {
        headers: {
          'x-api-key': config.apiKey,
        },
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        id: response.data.data._id,
        status: response.data.data.status,
        recipients: response.data.data.recipients,
        message: response.data.data.message,
        createdAt: response.data.data.createdAt,
      },
      message: 'SMS sent successfully',
    });
  } catch (error) {
    console.error('SMS sending error:', error);

    // Handle axios/TextBee errors
    if (axios.isAxiosError(error)) {
      let errorMessage = 'Failed to send SMS';
      let statusCode = 500;

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        statusCode = error.response.status;
        errorMessage =
          error.response.data?.message || error.response.data?.error || 'Failed to send SMS';
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from SMS service';
        statusCode = 503;
      } else {
        // Something happened in setting up the request
        errorMessage = 'Failed to send SMS request';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: statusCode },
      );
    }

    if (error instanceof Error) {
      let errorMessage = 'Failed to send SMS';
      let statusCode = 500;

      if (error.message.includes('Missing required TextBee configuration')) {
        errorMessage = 'SMS service not properly configured';
        statusCode = 500;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check SMS service status
export async function GET() {
  try {
    // Check TextBee configuration
    const config = getConfig();

    return NextResponse.json({
      success: true,
      data: {
        configured: true,
        deviceId: config.deviceId,
        environment: process.env.NODE_ENV,
        provider: 'TextBee',
      },
      message: 'SMS service is configured and ready',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'SMS service not properly configured',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 },
    );
  }
}
