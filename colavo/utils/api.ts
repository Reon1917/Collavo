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

  const data = (await response.json()) as T;
  return { data, handled: false };
}
