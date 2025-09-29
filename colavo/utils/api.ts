import { handleApiError } from '@/utils/permissions';

interface FetchJsonOptions extends RequestInit {
  onPermissionRefresh?: () => void;
}

interface FetchJsonResult<T> {
  data: T | null;
  handled: boolean;
  errorMessage?: string;
}

/**
 * Fetch JSON data while honoring structured permission errors, including project deletions.
 * Returns `{ handled: true }` when the error was already surfaced to the user via toast/redirect.
 */
export async function fetchJsonWithProjectGuard<T>(
  input: RequestInfo,
  options: FetchJsonOptions = {}
): Promise<FetchJsonResult<T>> {
  const { onPermissionRefresh, ...init } = options;

  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (error) {
    // Surface network errors so callers can decide how to report them.
    throw error;
  }

  if (!response.ok) {
    const { handled, errorMessage } = await handleApiError(response, onPermissionRefresh);

    if (handled) {
      return { data: null, handled: true, errorMessage };
    }

    throw new Error(errorMessage || 'Request failed');
  }

  // Check for empty responses (204 status or empty content-length)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { data: undefined as T, handled: false };
  }

  // Check if response has content by trying to read text first
  const text = await response.text();
  if (!text.trim()) {
    return { data: undefined as T, handled: false };
  }

  try {
    const data = JSON.parse(text) as T;
    return { data, handled: false };
  } catch {
    // If JSON parsing fails, treat as empty response
    return { data: undefined as T, handled: false };
  }
}
