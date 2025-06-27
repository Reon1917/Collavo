import { DateTime } from 'luxon';
import { 
  formatBangkokTime, 
  calculateScheduleTime, 
  isPastTime, 
  canScheduleNotification 
} from '../timezone';

describe('Luxon Timezone Utilities', () => {
  it('should format Bangkok time correctly', () => {
    // Test with a known UTC time
    const utcDate = new Date('2024-06-30T11:00:00.000Z'); // 6pm Bangkok time
    const formatted = formatBangkokTime(utcDate);
    
    // Should show 6pm Bangkok time (UTC+7)
    expect(formatted).toContain('06:00 PM');
    expect(formatted).toContain('GMT+7');
  });

  it('should calculate schedule time correctly', () => {
    // Event on June 30th 6pm UTC (1am+1 Bangkok = July 1st 1am Bangkok)
    const eventDate = new Date('2024-06-30T18:00:00.000Z');
    
    // Schedule 3 days before at 3am Bangkok time
    const scheduleTime = calculateScheduleTime(eventDate, 3, '03:00');
    
    // Should be June 27th 8pm UTC (3am Bangkok time - 7 hours)
    const bangkokScheduleTime = DateTime.fromJSDate(scheduleTime).setZone('Asia/Bangkok');
    
    expect(bangkokScheduleTime.day).toBe(27);
    expect(bangkokScheduleTime.month).toBe(6);
    expect(bangkokScheduleTime.hour).toBe(3);
    expect(bangkokScheduleTime.minute).toBe(0);
  });

  it('should handle timezone edge cases', () => {
    // Test around daylight saving transitions (though Bangkok doesn't have DST)
    const winterDate = new Date('2024-01-15T12:00:00.000Z');
    const summerDate = new Date('2024-07-15T12:00:00.000Z');
    
    const winterFormatted = formatBangkokTime(winterDate);
    const summerFormatted = formatBangkokTime(summerDate);
    
    // Both should show GMT+7 since Bangkok doesn't observe DST
    expect(winterFormatted).toContain('GMT+7');
    expect(summerFormatted).toContain('GMT+7');
  });

  it('should validate time input correctly', () => {
    const eventDate = new Date('2024-06-30T18:00:00.000Z');
    
    // Valid time
    expect(() => calculateScheduleTime(eventDate, 1, '09:30')).not.toThrow();
    
    // Invalid time formats
    expect(() => calculateScheduleTime(eventDate, 1, '9:30')).toThrow();
    expect(() => calculateScheduleTime(eventDate, 1, '25:00')).toThrow();
    expect(() => calculateScheduleTime(eventDate, 1, '09:60')).toThrow();
    expect(() => calculateScheduleTime(eventDate, 1, 'invalid')).toThrow();
  });

  it('should correctly identify past times', () => {
    const now = DateTime.now().setZone('Asia/Bangkok');
    
    // Past time (1 hour ago)
    const pastTime = now.minus({ hours: 1 }).toJSDate();
    expect(isPastTime(pastTime)).toBe(true);
    
    // Future time (1 hour from now)
    const futureTime = now.plus({ hours: 1 }).toJSDate();
    expect(isPastTime(futureTime)).toBe(false);
    
    // Very recent time (within 5 minute buffer)
    const recentTime = now.plus({ minutes: 2 }).toJSDate();
    expect(isPastTime(recentTime)).toBe(true); // Should be true due to 5-minute buffer
  });

  it('should validate notification scheduling correctly', () => {
    const now = DateTime.now().setZone('Asia/Bangkok');
    
    // Deadline far in future (2 hours from now)
    const futureDeadline = now.plus({ hours: 2 }).toJSDate();
    expect(canScheduleNotification(futureDeadline, 0)).toBe(true);
    
    // Deadline too close (30 minutes from now)
    const nearDeadline = now.plus({ minutes: 30 }).toJSDate();
    expect(canScheduleNotification(nearDeadline, 0)).toBe(false);
    
    // Past deadline
    const pastDeadline = now.minus({ hours: 1 }).toJSDate();
    expect(canScheduleNotification(pastDeadline, 0)).toBe(false);
  });
}); 