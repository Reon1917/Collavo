import { Client } from "@upstash/qstash";

// QStash configuration with development server support
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const QSTASH_DEV_URL = process.env.QSTASH_URL;
const QSTASH_DEV_TOKEN = process.env.QSTASH_TOKEN;

// Use development QStash CLI if configured, otherwise production
const qstashConfig = IS_DEVELOPMENT && QSTASH_DEV_URL && QSTASH_DEV_TOKEN ? {
  token: QSTASH_DEV_TOKEN,
  baseUrl: QSTASH_DEV_URL
} : {
  token: process.env.QSTASH_TOKEN || '',
  baseUrl: 'https://qstash.upstash.io'
};

if (!qstashConfig.token) {
  if (IS_DEVELOPMENT) {
    console.warn('⚠️ QStash not configured. For local testing, run: npx @upstash/qstash-cli dev');
    console.warn('⚠️ Then copy the environment variables to your .env.local file');
  } else {
    throw new Error("QSTASH_TOKEN environment variable is required");
  }
}

export const qstash = qstashConfig.token ? new Client({
  token: qstashConfig.token,
  baseUrl: qstashConfig.baseUrl,
}) : null;

// Thailand timezone utilities (UTC+7)
const THAILAND_TIMEZONE = 'Asia/Bangkok';
const THAILAND_OFFSET_HOURS = 7;

/**
 * Convert date to Thailand timezone (UTC+7)
 */
export function toThailandTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: THAILAND_TIMEZONE }));
}

/**
 * Calculate notification date in Thailand timezone with edge case handling
 * @param deadline - Task/Event deadline in UTC
 * @param daysBefore - Number of days before deadline to send notification
 * @param notificationTime - Time of day to send notification (HH:mm format, Thailand time)
 * @returns Notification date in UTC (for database storage and QStash scheduling)
 */
export function calculateNotificationDate(deadline: Date, daysBefore: number, notificationTime: string = "09:00"): Date {
  // Parse notification time
  const timeParts = notificationTime.split(':');
  if (timeParts.length !== 2) {
    throw new Error('Invalid notification time format. Use HH:mm format.');
  }
  
  const hoursStr = timeParts[0]!;
  const minutesStr = timeParts[1]!;
  
  // Check if both parts are numeric
  if (!/^\d+$/.test(hoursStr) || !/^\d+$/.test(minutesStr)) {
    throw new Error('Invalid notification time format. Use HH:mm format.');
  }
  
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid notification time format. Use HH:mm format.');
  }
  
  // Convert deadline to Thailand time to calculate correctly
  const deadlineThailand = toThailandTime(deadline);
  
  // Subtract days in Thailand timezone
  const notificationThailand = new Date(deadlineThailand);
  notificationThailand.setDate(notificationThailand.getDate() - daysBefore);
  
  // Set to user-specified time in Thailand timezone
  notificationThailand.setHours(hours, minutes, 0, 0);
  
  // Convert back to UTC for storage and QStash
  const notificationUTC = new Date(notificationThailand.getTime() - (THAILAND_OFFSET_HOURS * 60 * 60 * 1000));
  
  return notificationUTC;
}

/**
 * Calculate delay in seconds for QStash scheduling
 * @param notificationDate - When to send notification (UTC)
 * @returns Delay in seconds, minimum 60 seconds
 */
export function calculateQStashDelay(notificationDate: Date): number {
  const now = new Date();
  const delayMs = notificationDate.getTime() - now.getTime();
  const delaySeconds = Math.floor(delayMs / 1000);
  
  // Minimum delay of 60 seconds for QStash
  return Math.max(delaySeconds, 60);
}

/**
 * Validate if notification can be scheduled
 * @param notificationDate - When to send notification
 * @returns true if valid, throws error if invalid
 */
export function validateNotificationTiming(notificationDate: Date): boolean {
  const now = new Date();
  const delayMs = notificationDate.getTime() - now.getTime();
  
  if (delayMs < 60000) { // Less than 60 seconds
    throw new Error('Notification must be scheduled at least 60 seconds in the future');
  }
  
  if (delayMs > 31536000000) { // More than 1 year
    throw new Error('Notification cannot be scheduled more than 1 year in advance');
  }
  
  return true;
}

/**
 * Format date for user display in Thailand timezone
 */
export function formatThailandDate(date: Date): string {
  return date.toLocaleString('th-TH', { 
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 