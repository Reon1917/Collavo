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
  
  // Calculate target date (days before deadline) in Bangkok timezone
  const targetDateTime = deadlineInBangkok
    .minus({ days: daysBefore })
    .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  
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
 * This is more lenient - we only check if the deadline itself is far enough in the future
 */
export function canScheduleNotification(deadline: Date, daysBefore: number): boolean {
  const now = DateTime.now().setZone(BANGKOK_TIMEZONE);
  const deadlineInBangkok = DateTime.fromJSDate(deadline).setZone(BANGKOK_TIMEZONE);
  
  // Check if there's enough time between now and the notification date
  // The notification should be scheduled at least 1 hour from now
  const notificationTime = deadlineInBangkok.minus({ days: daysBefore });
  const minimumFutureTime = now.plus({ hours: 1 });
  
  return notificationTime > minimumFutureTime;
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