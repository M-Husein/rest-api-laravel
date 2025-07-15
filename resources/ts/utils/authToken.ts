import Cookies from 'js-cookie';

type cookieResult = string | undefined | null;

export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;

/**
 * Get auth token
 * @returns string token | undefined | null
 */
export const getToken = (): cookieResult => {
  // let token = Cookies.get(TOKEN_KEY);
  // // console.log('token: ', token)

  // if(token){
  //   return token;
  // }

  return Cookies.get(TOKEN_KEY);
}

export const setToken = (token: any, expiresAt: any): void => {
  Cookies.set(
    TOKEN_KEY, 
    token,
    {
      sameSite: "Lax", // Lax | Strict
      secure: window.location.protocol === "https:",
      // expires: +import.meta.env.VITE_TOKEN_EXP, // new Date(new Date().getTime() + 3 * 60 * 1000)
      expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 2 * 60 * 60 * 1000), 
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

export const getCsrfToken = (tokenName: string = 'XSRF-TOKEN'): cookieResult => Cookies.get(tokenName);
