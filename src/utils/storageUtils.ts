/**
 * Local storage keys for persisting user authentication data
 */
const STORAGE_KEYS = {
  USER_ID: "auth_user_id",
  AUTH_TOKEN: "auth_token",
  USER_DATA: "auth_user_data",
} as const;

/**
 * Store user ID in localStorage
 * Called after successful login with the .NET backend response
 */
export function storeUserId(userId: string): void {
  if (userId?.trim()) {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId.trim());
  }
}

/**
 * Retrieve user ID from localStorage
 * Returns the stored user ID or null if not found
 */
export function getStoredUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.USER_ID) || null;
  } catch (error) {
    console.warn("Failed to retrieve user ID from localStorage", error);
    return null;
  }
}

/**
 * Store authentication token in localStorage
 * Called after successful login
 */
export function storeAuthToken(token: string): void {
  if (token?.trim()) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token.trim());
  }
}

/**
 * Retrieve authentication token from localStorage
 * Returns the stored token or null if not found
 */
export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
  } catch (error) {
    console.warn("Failed to retrieve auth token from localStorage", error);
    return null;
  }
}

/**
 * Store user data in localStorage for quick access
 * Stores the entire user object returned from login
 */
export function storeUserData(userData: Record<string, any>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.warn("Failed to store user data in localStorage", error);
  }
}

/**
 * Retrieve user data from localStorage
 * Returns the stored user object or null if not found
 */
export function getStoredUserData(): Record<string, any> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to retrieve user data from localStorage", error);
    return null;
  }
}

/**
 * Clear all authentication data from localStorage
 * Called on logout
 */
export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.warn("Failed to clear auth storage", error);
  }
}

/**
 * Store complete login response from .NET backend
 * Response format: { token, role, expiration, errorMessage, id }
 */
export function storeLoginResponse(response: {
  token: string;
  role?: string;
  expiration?: string;
  id: string;
}): void {
  try {
    if (response.id) {
      storeUserId(response.id);
    }
    if (response.token) {
      storeAuthToken(response.token);
    }
    storeUserData({
      id: response.id,
      role: response.role,
      expiration: response.expiration,
      storedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Failed to store login response", error);
  }
}
