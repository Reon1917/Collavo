/**
 * Utility Functions for Collavo Project Management System
 * 
 * This file contains type-safe utility functions for common operations
 * throughout the application. All functions are designed with security and
 * performance in mind.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { 
  Result, 
  ApiError, 
  ValidationResult, 
  FieldError,
  AllowedFileType,
  MAX_FILE_SIZE 
} from "@/types";

// ========================================================================================
// Style & UI Utilities
// ========================================================================================

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * This is the standard approach for conditional styling in the app
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format user initials for avatar display
 */
export function formatInitials(name: string): string {
  if (!name || typeof name !== 'string') return 'U';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
    
  return initials || 'U';
}

// ========================================================================================
// Date & Time Utilities
// ========================================================================================

/**
 * Format date to a readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'No date set';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format date to a relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj.getTime() > Date.now();
}

/**
 * Check if a date is overdue (past current date)
 */
export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day
  
  return dateObj.getTime() < now.getTime();
}

// ========================================================================================
// String Utilities
// ========================================================================================

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// ========================================================================================
// Validation Utilities
// ========================================================================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: FieldError[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/\d/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one special character' });
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate file type and size for uploads
 */
export function validateFile(file: File, allowedTypes: AllowedFileType[]): ValidationResult {
  const errors: FieldError[] = [];
  
  if (!file) {
    errors.push({ field: 'file', message: 'File is required' });
    return { isValid: false, errors };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type as AllowedFileType)) {
    errors.push({ 
      field: 'file', 
      message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    });
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({ 
      field: 'file', 
      message: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}` 
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ========================================================================================
// Format Utilities
// ========================================================================================

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format currency amounts
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format numbers with proper thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// ========================================================================================
// Array & Object Utilities
// ========================================================================================

/**
 * Type-safe function to check if value is not null or undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type-safe function to check if object has a specific property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Deep clone an object (JSON serializable objects only)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    // Fallback for non-serializable objects
    return obj;
  }
}

/**
 * Remove duplicates from array based on a key function
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Group array items by a key function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// ========================================================================================
// Async Utilities
// ========================================================================================

/**
 * Safe async wrapper that returns a Result type
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>
): Promise<Result<T, ApiError>> {
  try {
    const data = await asyncFn();
    return { success: true, data };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'ASYNC_ERROR',
      statusCode: 500,
    };
    
    return { success: false, error: apiError };
  }
}

/**
 * Delay execution for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delayMs = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await delay(delayMs);
    }
  }
  
  throw new Error('Retry logic error'); // This should never be reached
}

// ========================================================================================
// Security Utilities
// ========================================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Generate a secure random string for tokens/IDs
 */
export function generateSecureId(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Mask sensitive data (e.g., email addresses, phone numbers)
 */
export function maskSensitiveData(data: string, type: 'email' | 'phone' = 'email'): string {
  if (!data || typeof data !== 'string') return '';
  
  if (type === 'email') {
    const [localPart, domain] = data.split('@');
    if (!localPart || !domain) return data;
    
    const maskedLocal = localPart.length > 2 
      ? localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1)
      : localPart;
      
    return `${maskedLocal}@${domain}`;
  }
  
  // Phone masking
  if (type === 'phone') {
    return data.replace(/(\d{3})\d*(\d{4})/, '$1****$2');
  }
  
  return data;
}

// ========================================================================================
// Environment & Configuration Utilities
// ========================================================================================

/**
 * Type-safe environment variable getter
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value ?? defaultValue!;
}

/**
 * Check if the app is running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if the app is running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// ========================================================================================
// URL & Navigation Utilities
// ========================================================================================

/**
 * Build URL with query parameters in a type-safe way
 */
export function buildUrl(
  base: string, 
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const url = new URL(base, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Extract query parameters from URL
 */
export function getQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url, window.location.origin);
  const params: Record<string, string> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
} 