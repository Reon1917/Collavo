/**
 * URL and Navigation Utilities
 * SSR-safe functions for URL manipulation and query parameters
 */

/**
 * Build URL with query parameters in a type-safe way
 * SSR-safe with fallback origin
 */
export function buildUrl(
  base: string, 
  params: Record<string, string | number | boolean | null | undefined>
): string {
  // Safe origin fallback for SSR
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const url = new URL(base, origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Extract query parameters from URL
 * SSR-safe with fallback origin
 */
export function getQueryParams(url: string): Record<string, string> {
  // Safe origin fallback for SSR
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const urlObj = new URL(url, origin);
  const params: Record<string, string> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Create a URL-safe slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
    .trim();
} 