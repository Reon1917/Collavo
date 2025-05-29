/**
 * Utility Functions Index
 * Re-exports from focused utility modules for backward compatibility
 */

// Core utilities
export { cn } from '@/lib/utils';

// Date utilities
export {
  formatDate,
  formatRelativeTime,
  isFutureDate,
  isOverdue,
  formatDateForInput
} from './date';

// Formatting utilities
export {
  formatInitials,
  capitalize,
  toTitleCase,
  truncateText,
  formatFileSize,
  formatCurrency,
  formatNumber
} from './format';

// URL utilities
export {
  buildUrl,
  getQueryParams,
  slugify
} from './url';

// Type guards and validation
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

// Environment utilities
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Security utilities
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
} 