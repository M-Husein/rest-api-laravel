import Cookies from 'js-cookie';

type cookieResult = string | undefined | null;

export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;

/**
 * Get auth token
 * @returns string token | undefined | null
 */
export const getToken = (): cookieResult => Cookies.get(TOKEN_KEY);

/**
 * Set token in cookie
 * @param token string
 * @param expiresAt string date iso
 */
export const setToken = (token: string, expiresAt: string): void => {
  Cookies.set(
    TOKEN_KEY, 
    token,
    {
      sameSite: "Lax", // Lax | Strict
      secure: window.location.protocol === "https:",
      // expires: +import.meta.env.VITE_TOKEN_EXP, // new Date(new Date().getTime() + 3 * 60 * 1000)
      expires: new Date(expiresAt || Date.now() + 2 * 60 * 60 * 1000), 
    }
  );
}

/**
 * Clear auth token etc
 * @returns void
 */
export const clearToken = (): void => {
  Cookies.remove(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * 
 * @param tokenKey string
 * @returns string CSRF token | undefined | null
 */
export const getCsrfToken = (tokenKey: string = 'XSRF-TOKEN'): cookieResult => Cookies.get(tokenKey);
