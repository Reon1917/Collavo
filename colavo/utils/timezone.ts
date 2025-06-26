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
 */
export function isPastTime(date: Date): boolean {
  const now = new Date();
  const bangkokNow = toBangkokTime(now);
  const bangkokDate = toBangkokTime(date);
  return bangkokDate < bangkokNow;
}

/**
 * Get current Bangkok time
 */
export function getBangkokNow(): Date {
  return toBangkokTime(new Date());
} 