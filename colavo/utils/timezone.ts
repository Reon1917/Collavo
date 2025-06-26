/**
 * Bangkok timezone utilities for email notification scheduling
 * Bangkok timezone is UTC+7 (Asia/Bangkok)
 */

const BANGKOK_TIMEZONE_OFFSET = 7 * 60; // 7 hours in minutes

/**
 * Convert UTC date to Bangkok time
 */
export function toBangkokTime(date: Date): Date {
  const bangkokTime = new Date(date.getTime() + (BANGKOK_TIMEZONE_OFFSET * 60 * 1000));
  return bangkokTime;
}

/**
 * Convert Bangkok time to UTC
 */
export function fromBangkokTime(date: Date): Date {
  const utcTime = new Date(date.getTime() - (BANGKOK_TIMEZONE_OFFSET * 60 * 1000));
  return utcTime;
}

/**
 * Calculate the scheduled time for a notification
 * @param deadline - The deadline date (in UTC)
 * @param daysBefore - Number of days before deadline
 * @param time - Time in HH:MM format (Bangkok time)
 * @returns Scheduled time in UTC
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
  
  // Create the target date (days before deadline)
  const targetDate = new Date(deadline);
  targetDate.setDate(targetDate.getDate() - daysBefore);
  
  // Convert to Bangkok time to set the time
  const bangkokDate = toBangkokTime(targetDate);
  bangkokDate.setHours(hours, minutes, 0, 0);
  
  // Convert back to UTC for storage
  return fromBangkokTime(bangkokDate);
}

/**
 * Format a date for display in Bangkok timezone
 */
export function formatBangkokTime(date: Date): string {
  const bangkokTime = toBangkokTime(date);
  return bangkokTime.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
    timeZoneName: 'short'
  });
}

/**
 * Check if a date is in the past (Bangkok time)
 * For notifications, we allow scheduling if the deadline itself is in the future,
 * even if the notification time would be in the past
 */
export function isPastTime(date: Date): boolean {
  const now = new Date();
  const bangkokNow = toBangkokTime(now);
  const bangkokDate = toBangkokTime(date);
  
  // Add a small buffer (5 minutes) to avoid issues with immediate scheduling
  const bufferTime = new Date(bangkokNow.getTime() + (5 * 60 * 1000));
  return bangkokDate < bufferTime;
}

/**
 * Check if a deadline allows for notification scheduling
 * This is more lenient - we only check if the deadline itself is far enough in the future
 */
export function canScheduleNotification(deadline: Date, daysBefore: number): boolean {
  const now = new Date();
  const bangkokNow = toBangkokTime(now);
  const bangkokDeadline = toBangkokTime(deadline);
  
  // Check if deadline is at least 1 hour in the future
  const minimumFutureTime = new Date(bangkokNow.getTime() + (1 * 60 * 60 * 1000)); // 1 hour buffer
  
  return bangkokDeadline > minimumFutureTime;
}

/**
 * Get current Bangkok time
 */
export function getBangkokNow(): Date {
  return toBangkokTime(new Date());
} 