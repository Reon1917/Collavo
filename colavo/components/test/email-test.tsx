'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResendEmailService } from '@/lib/email/resend-service';
import { generateSubtaskReminderTemplate } from '@/lib/email/templates/subtask-reminder';
import { generateEventReminderTemplate } from '@/lib/email/templates/event-reminder';

export function EmailTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSubtaskEmail = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const emailHtml = generateSubtaskReminderTemplate({
        userName: 'John Doe',
        subtaskTitle: 'Complete project documentation',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        projectName: 'Test Project',
        daysRemaining: 3,
        projectId: 'test-project-id',
        subtaskId: 'test-subtask-id',
      });

      const response = await ResendEmailService.sendImmediate({
        recipientEmails: ['test@example.com'], // Replace with your email
        subject: 'Test Subtask Reminder',
        html: emailHtml,
      });

      setResult(`✅ Subtask email sent successfully! Email ID: ${response.emailId}`);
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testEventEmail = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const emailHtml = generateEventReminderTemplate({
        userName: 'Jane Smith',
        eventTitle: 'Project Kickoff Meeting',
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        projectName: 'Test Project',
        location: 'Conference Room A',
        description: 'Kick off meeting for the new project initiative',
        projectId: 'test-project-id',
        eventId: 'test-event-id',
        daysRemaining: 2,
      });

      const response = await ResendEmailService.sendImmediate({
        recipientEmails: ['test@example.com'], // Replace with your email
        subject: 'Test Event Reminder',
        html: emailHtml,
      });

      setResult(`✅ Event email sent successfully! Email ID: ${response.emailId}`);
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testScheduledEmail = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const scheduledTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
      
      const emailHtml = generateSubtaskReminderTemplate({
        userName: 'Test User',
        subtaskTitle: 'Test Scheduled Notification',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        projectName: 'Test Project',
        daysRemaining: 1,
        projectId: 'test-project-id',
        subtaskId: 'test-subtask-id',
      });

      const response = await ResendEmailService.scheduleNotification({
        recipientEmails: ['test@example.com'], // Replace with your email
        subject: 'Test Scheduled Notification',
        html: emailHtml,
        scheduledAt: scheduledTime,
      });

      setResult(`✅ Email scheduled successfully for ${scheduledTime.toLocaleString()}! Email ID: ${response.emailId}`);
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Notification System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={testSubtaskEmail} 
            disabled={loading}
            variant="outline"
          >
            Test Subtask Email
          </Button>
          
          <Button 
            onClick={testEventEmail} 
            disabled={loading}
            variant="outline"
          >
            Test Event Email
          </Button>
          
          <Button 
            onClick={testScheduledEmail} 
            disabled={loading}
            variant="default"
          >
            Test Scheduled Email
          </Button>
        </div>
        
        {loading && (
          <div className="text-center text-muted-foreground">
            Sending email...
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔧 <strong>Note:</strong> Update recipient email in the component before testing</p>
          <p>📧 <strong>Templates:</strong> Professional HTML emails with Bangkok timezone</p>
          <p>⏰ <strong>Scheduling:</strong> Uses Resend's native scheduling feature</p>
          <p>🌏 <strong>Timezone:</strong> All times are handled in Bangkok timezone (UTC+7)</p>
        </div>
      </CardContent>
    </Card>
  );
} 