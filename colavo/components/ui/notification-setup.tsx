'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationSetupProps {
  onSchedule: (data: { daysBefore: number; time: string }) => Promise<void>;
  type: 'subtask' | 'event';
  loading?: boolean;
}

export function NotificationSetup({ onSchedule, type, loading = false }: NotificationSetupProps) {
  const [daysBefore, setDaysBefore] = useState<number>(1);
  const [time, setTime] = useState<string>('09:00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (daysBefore < 0 || daysBefore > 30) {
      alert('Days before must be between 0 and 30');
      return;
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      alert('Invalid time format. Use HH:MM format');
      return;
    }

    await onSchedule({ daysBefore, time });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          Setup {type === 'subtask' ? 'Subtask' : 'Event'} Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daysBefore">Days Before {type === 'subtask' ? 'Deadline' : 'Event'}</Label>
            <Select value={daysBefore.toString()} onValueChange={(value) => setDaysBefore(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select days before" />
              </SelectTrigger>
              <SelectContent>
                {type === 'event' && <SelectItem value="0">Same day</SelectItem>}
                {[1, 2, 3, 5, 7, 14, 30].map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day} {day === 1 ? 'day' : 'days'} before
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time (Bangkok Time)</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>📍 All times are in Bangkok timezone (UTC+7)</p>
            <p>✉️ Email will be sent to {type === 'subtask' ? 'the assigned user' : 'selected recipients'}</p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Scheduling...' : 'Schedule Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 