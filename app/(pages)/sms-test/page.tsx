'use client';

import smsService, { BulkSMSResponse, SMSResponse } from '@/app/lib/sms-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, MessageCircle, Send, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function SMSTestPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState(
    'Hello! This is a test message from AmayAlert emergency system.',
  );
  const [useTest, setUseTest] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SMSResponse | BulkSMSResponse | null>(null);
  const [serviceStatus, setServiceStatus] = useState<SMSResponse | null>(null);

  const checkServiceStatus = async () => {
    setLoading(true);
    try {
      const status = await smsService.checkStatus();
      setServiceStatus(status);
    } catch {
      setServiceStatus({ success: false, error: 'Failed to check service status' });
    }
    setLoading(false);
  };

  const sendTestSMS = async () => {
    if (!phoneNumber || !message) {
      setResult({ success: false, error: 'Please provide both valid phone number and message' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await smsService.sendSMS({
        to: phoneNumber,
        message,
        useTest,
        useMessagingService: true,
      });
      setResult(response);
    } catch {
      setResult({ success: false, error: 'Failed to send SMS' });
    }

    setLoading(false);
  };

  const sendEmergencyAlert = async () => {
    if (!phoneNumber) {
      setResult({ success: false, error: 'Please provide a phone number' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await smsService.sendEmergencyAlert({
        recipients: [phoneNumber],
        alertTitle: 'Test Emergency Alert',
        alertMessage:
          'This is a test emergency alert from the AmayAlert system. Please disregard this message.',
        priority: 'medium',
        useTest,
      });
      setResult(response);
    } catch {
      setResult({ success: false, error: 'Failed to send emergency alert' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">SMS Service Test</h1>
          <p className="text-muted-foreground">
            Test the SMS functionality for the AmayAlert system
          </p>
        </div>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkServiceStatus} disabled={loading} className="w-full">
              {loading ? 'Checking...' : 'Check SMS Service Status'}
            </Button>

            {serviceStatus && (
              <div
                className={`p-4 rounded-lg border ${
                  serviceStatus.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {serviceStatus.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {serviceStatus.success ? 'Service Ready' : 'Service Error'}
                  </span>
                </div>
                {serviceStatus.data && (
                  <div className="text-sm space-y-1">
                    <p>Device ID: {serviceStatus.data.id || 'N/A'}</p>
                    <p>Provider: TextBee</p>
                    <p>Environment: {process.env.NODE_ENV || 'N/A'}</p>
                  </div>
                )}
                {serviceStatus.error && (
                  <p className="text-sm text-red-600">{serviceStatus.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test SMS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Use international format (e.g., +1234567890)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your test message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">{message.length}/160 characters</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="test-mode"
                checked={useTest}
                onChange={(e) => setUseTest(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="test-mode">Use Test Environment</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={sendTestSMS} disabled={loading} className="flex-1">
                {loading ? 'Sending...' : 'Send Test SMS'}
              </Button>
              <Button
                onClick={sendEmergencyAlert}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send Emergency Alert'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">SMS sent successfully!</p>
                    {'data' in result && result.data && (
                      <div className="text-sm text-green-700 space-y-1">
                        <p>ID: {result.data.id}</p>
                        <p>Status: {result.data.status}</p>
                        <p>To: {result.data.recipients?.[0] || result.data.to}</p>
                        <p>Provider: TextBee</p>
                      </div>
                    )}
                    {'results' in result && result.results && (
                      <div className="text-sm text-green-700">
                        <p>Total Sent: {result.totalSent}</p>
                        <p>Total Failed: {result.totalFailed}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">Failed to send SMS</p>
                    {'error' in result && result.error && (
                      <p className="text-sm text-red-700">{result.error}</p>
                    )}
                    {'details' in result && result.details && (
                      <p className="text-xs text-red-600">{result.details}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              API Usage Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Direct API Call:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`fetch('/api/sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+1234567890',
    message: 'Hello from AmayAlert!',
    useTest: true
  })
})`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Using SMS Service:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`import smsService from '@/app/lib/sms-service';

// Send single SMS
await smsService.sendSMS({
  to: '+1234567890',
  message: 'Hello!',
  useTest: true
});

// Send emergency alert
await smsService.sendEmergencyAlert({
  recipients: ['+1234567890'],
  alertTitle: 'Emergency Alert',
  alertMessage: 'Please evacuate immediately',
  priority: 'critical'
});`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
