import { DateTime } from 'luxon';

/**
 * Bangkok timezone utilities for email notification scheduling
 * Using Luxon for robust timezone handling
 */

const BANGKOK_TIMEZONE = 'Asia/Bangkok';

/**
 * Format a date for display in Bangkok timezone
 */
export function formatBangkokTime(date: Date): string {
  return DateTime.fromJSDate(date)
    .setZone(BANGKOK_TIMEZONE)
    .toFormat('MM/dd/yyyy, hh:mm a ZZZZ');
}

/**
 * Calculate the scheduled time for a notification
 * @param deadline - The deadline date (stored as UTC in database)
 * @param daysBefore - Number of days before deadline  
 * @param time - Time in HH:MM format (Bangkok time)
 * @returns Scheduled time in UTC for storage
 */
export function calculateScheduleTime(deadline: Date, daysBefore: number, time: string): Date {
  const timeParts = time.split(':');
  if (timeParts.length !== 2) {
    throw new Error('Invalid time format. Expected HH:MM');
  }
  const hours = parseInt(timeParts[0]!, 10);
  const minutes = parseInt(timeParts[1]!, 10);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time values. Hours must be 0-23, minutes must be 0-59');
  }
  
  // Convert deadline to Bangkok timezone
  const deadlineInBangkok = DateTime.fromJSDate(deadline).setZone(BANGKOK_TIMEZONE);
  
  // For deadlines stored as midnight (start of day), we add the days calculation to the date
  // This treats "June 30" deadline as "any time during June 30"
  const targetDate = deadlineInBangkok.startOf('day').minus({ days: daysBefore });
  const targetDateTime = targetDate.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  
  // Convert back to UTC for storage
  return targetDateTime.toUTC().toJSDate();
}

/**
 * Check if a date is in the past (Bangkok time)
 * For notifications, we allow scheduling if the deadline itself is in the future,
 * even if the notification time would be in the past
 */
export function isPastTime(date: Date): boolean {
  const now = DateTime.now().setZone(BANGKOK_TIMEZONE);
  const dateInBangkok = DateTime.fromJSDate(date).setZone(BANGKOK_TIMEZONE);
  
  // Add a small buffer (5 minutes) to avoid issues with immediate scheduling
  const bufferTime = now.plus({ minutes: 5 });
  return dateInBangkok < bufferTime;
}

/**
 * Check if a deadline allows for notification scheduling
 * We need to check if the actual notification time (with specific hour) is in the future
 */
export function canScheduleNotification(deadline: Date, daysBefore: number, time: string = '09:00'): boolean {
  const now = DateTime.now().setZone(BANGKOK_TIMEZONE);
  
  try {
    // Calculate the actual notification datetime using the same logic as calculateScheduleTime
    const actualNotificationTime = calculateScheduleTime(deadline, daysBefore, time);
    const notificationTimeInBangkok = DateTime.fromJSDate(actualNotificationTime).setZone(BANGKOK_TIMEZONE);
    
    // Add a larger buffer (10 minutes) to account for processing time with multiple recipients
    const minimumFutureTime = now.plus({ minutes: 10 });
    
    const canSchedule = notificationTimeInBangkok > minimumFutureTime;
    
    console.log('canScheduleNotification check:', {
      deadline: deadline.toISOString(),
      daysBefore,
      time,
      currentBangkokTime: now.toISO(),
      calculatedNotificationTime: notificationTimeInBangkok.toISO(),
      minimumFutureTime: minimumFutureTime.toISO(),
      canSchedule,
      timeDifferenceMinutes: notificationTimeInBangkok.diff(now, 'minutes').minutes
    });
    
    return canSchedule;
  } catch (error) {
    console.error('Error in canScheduleNotification, falling back to basic check:', error);
    // If calculateScheduleTime fails, fall back to basic date check
    const deadlineInBangkok = DateTime.fromJSDate(deadline).setZone(BANGKOK_TIMEZONE);
    const notificationDate = deadlineInBangkok.minus({ days: daysBefore });
    const minimumFutureTime = now.plus({ hours: 1 });
    
    const fallbackCanSchedule = notificationDate > minimumFutureTime;
    
    console.log('Fallback canScheduleNotification check:', {
      deadline: deadline.toISOString(),
      daysBefore,
      deadlineInBangkok: deadlineInBangkok.toISO(),
      notificationDate: notificationDate.toISO(),
      minimumFutureTime: minimumFutureTime.toISO(),
      fallbackCanSchedule
    });
    
    return fallbackCanSchedule;
  }
}

/**
 * Get current Bangkok time
 */
export function getBangkokNow(): Date {
  return DateTime.now().setZone(BANGKOK_TIMEZONE).toJSDate();
}

/**
 * Convert a Bangkok time string to UTC Date
 */
export function bangkokTimeToUTC(bangkokTimeString: string): Date {
  return DateTime.fromISO(bangkokTimeString, { zone: BANGKOK_TIMEZONE }).toUTC().toJSDate();
}

/**
 * Get Bangkok timezone offset for a specific date (handles DST if applicable)
 */
export function getBangkokOffset(date: Date): string {
  return DateTime.fromJSDate(date).setZone(BANGKOK_TIMEZONE).toFormat('ZZ');
} 