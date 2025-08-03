import { AuthProvider } from "@refinedev/core";
import { api, httpRequest } from '@/providers/dataProvider';
import { TOKEN_KEY, getToken, setToken, clearToken } from '@/utils/authToken';
import { toggleLoaderApp } from '@/utils/dom';
import i18n from "@/i18n";

// console.log('i18n: ', i18n);

const authErrors: any = {};

const setLang = (lang: string): void => {
  localStorage.setItem("i18nextLng", lang);
  document.documentElement.lang = lang;
  i18n.changeLanguage(lang);
}

export const authProvider: AuthProvider = {
  /** @OPTIONS : providerName | provider */
  register: async ({ redirectPath, ...json }) => {
    const errorResponse = {
      success: false,
      error: {
        name: "RegisterError",
        message: "Failed register",
      },
    };

    try {
      /** @OPTION : For cross domain */
      // await api.get('sanctum/csrf-cookie', { retry: 1 });

      const response: any = await httpRequest.post('register', {
        json 
      }).json();

      // console.log('response: ', response);

      if(response?.data){
        return {
          user: response.data.user, // <- Custom
          success: true,
          redirectTo: import.meta.env.VITE_LOGIN_PATH, // redirectPath || 
          successNotification: {
            message: response.message || "Registration Successful",
            description: "You have successfully registered",
          },
        };
      }

      return errorResponse;

      /** @OPTION : Auto login */
      // if(!response?.errors){ // response?.data
      //   let { token, expiresAt, user } = response.data;

      // setToken(token, expiresAt);
      // // window.location.replace('/');
      // setLang(user.lang || APP.defaultLang);

      //   return {
      //     user, // <- Custom
      //     success: true,
      //     redirectTo: "/", // "/app", // For admin
      //     successNotification: {
      //       message: response.message || "Registration Successful",
      //       description: "You have successfully registered",
      //     },
      //   };
      // }

      // return errorResponse;
    } catch(e: any) {
      // const data = await e.response.json().catch(() => null);
      // console.log('data: ', data);

      if(e.message){
        errorResponse.error.message = e.message;
      }

      return errorResponse;
    }
  },
  
  /** @OPTIONS : providerName */
  login: async ({ email, username, password, remember, provider }) => {
    const errorResponse = {
      success: false,
      error: {
        name: "Login Error", // LoginError
        message: "Invalid username or password",
      },
    };

    if( ((username || email) && password) || provider ){
      try {
        /** @OPTION : For cross domain */
        // await api.get('sanctum/csrf-cookie', { retry: 1 });

        // const json = provider 
        //   ? { provider, type: "spa" } 
        //   : { email, username, password, remember, type: "spa" };
        const json = { email, username, password, remember, type: "spa" };

        // const response: any = await httpRequest.post('login', {
        //   // credentials: 'same-origin',
        //   json
        // }).json();

        const response: any = await httpRequest.post('login-spa', { 
          json, 
          // prefixUrl: window.location.origin + '/v1'
        }).json();

        // console.log('response: ', response);
        // console.log('loginSpa: ', loginSpa);

        if(response?.data){ // !response?.errors
          let { token, expiresAt, user } = response.data;

          setToken(token, expiresAt);
          // window.location.replace('/');
          setLang(user.lang || APP.defaultLang);

          // Hack for Refine run check to get user authentication
          authErrors.login = 0; // sessionStorage.removeItem('LoginError');

          // After successfully logging in and setting the auth token,
          // re-fetch the CSRF cookie to ensure it's up-to-date with the new session
          // await api.get('sanctum/csrf-cookie', { retry: 1 });
          
          return {
            user, // <- Custom
            success: true,
            redirectTo: "/" // "/app", // For admin
          };
        }

        return errorResponse;
      }catch(e: any) { // (e: any)
        // console.log('e: ', e);
        // const data = await e.response.json().catch(() => null);
        // // console.log('data: ', data);

        if(e.message){
          errorResponse.error.message = e.message;
        }

        // Hack for Refine run check to get user authentication
        authErrors.login = 1; // sessionStorage.setItem('LoginError', '1');

        return errorResponse;
        // throw errorResponse;
      }
    }

    return errorResponse;
  },

  logout: async () => { // params: any
    const errorResponse = {
      success: false,
      error: {
        name: "LogoutError",
        message: "Logout failed",
      },
    };

    toggleLoaderApp();

    try {
      /** @OPTION : For cross domain */
      // await api.get('sanctum/csrf-cookie', { retry: 1 });

      /** @OPTION : make sure logout api success */
      // , { keepalive: true}
      const response: any = await httpRequest.post('logout').json();
      // console.log('response: ', response);

      // , { prefixUrl: window.location.origin + '/v1' }
      // const response: any = await httpRequest.post('logout-spa').json();
      // console.log('logoutSpa: ', logoutSpa);

      // httpRequest.post('logout', {
      //   keepalive: true,
      //   headers: {
      //     Authorization: 'Bearer ' + token,
      //   }
      // });

      // clearToken(); // Clear data

      // const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
      // bc.postMessage({ type: "LOGOUT" });

      // // window.location.replace(import.meta.env.VITE_LOGIN_PATH);

      // return {
      //   success: true,
      //   redirectTo: import.meta.env.VITE_LOGIN_PATH,
      //   // successNotification: {
      //   //   message: "Logout Successful",
      //   //   description: "You have successfully logged out",
      //   // },
      // };

      /** @OPTION : make sure logout api success */
      if(response?.errors){ //  && logoutSpa?.erros
        return errorResponse;
      }

      clearToken(); // Clear data

      const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
      bc.postMessage({ type: "LOGOUT" });

      // Reset to default lang
      setLang(APP.defaultLang);

      // window.location.replace(import.meta.env.VITE_LOGIN_PATH);

      return {
        success: true,
        redirectTo: import.meta.env.VITE_LOGIN_PATH,
      };
    } catch { // (e)
      return errorResponse;
    } finally {
      toggleLoaderApp();
    }
  },
  
  check: async () => {
    // Hack for Refine run check to get user authentication
    if(authErrors.login){ // sessionStorage.getItem('LoginError');
      return { authenticated: false }
    }
    
    // const persistIdentity = await authProvider.getIdentity?.();
    // // console.log('persistIdentity: ', persistIdentity);
    // if(persistIdentity){
    //   return { ...persistIdentity, authenticated: true }
    // }

    const errorResponse = {
      authenticated: false,
      logout: true,
      // redirectTo: import.meta.env.VITE_LOGIN_PATH,
      error: {
        name: "Unauthorized",
        message: "Check failed",
      },
    };

    try {
      const response: any = await httpRequest('me').json();
      // console.log('response: ', response);

      if(response?.data){
        let datas = { ...response.data, authenticated: true };
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify(datas));
        return datas;
      }

      clearToken(); // Clear data
      return errorResponse;
    } catch(e: any) {
      // const identity = await authProvider.getIdentity?.();
      
      if(e.status === 401 && sessionStorage.getItem(TOKEN_KEY)){
        clearToken(); // Clear data

        httpRequest.post('logout-spa'); // , { prefixUrl: window.location.origin + '/v1' }
        // // console.log('logoutSpa: ', logoutSpa);
      }

      return errorResponse;
    }
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const token = getToken();
    const user = sessionStorage.getItem(TOKEN_KEY);

    if (token && user) {
      return JSON.parse(user);
    }

    return null;
  },

  /** @DEV_OPTIONS : username | email */
  forgotPassword: async (json) => {
    const errorResponse = {
      success: false,
      error: {
        name: "ForgotPasswordError",
        message: "Username does not exist",
      },
    };

    try {
      const response: any = await api.post('forgot-password', { json }).json();
      // console.log('response: ', response);

      if(response?.data){
        return {
          success: true,
          redirectTo: import.meta.env.VITE_LOGIN_PATH, // "/auth/login"
          successNotification: {
            message: response.message,
            // description: 
          }
        };
      }
      
      return errorResponse;
    } catch { // (e)
      return errorResponse;
    }
  },

  onError: async (error) => {
    // console.log('%cauthProvider onError error: ', 'color:yellow', error);

    // Request abort / cancel
    // if (error.name === 'AbortError' || error.message === 'canceled') {
    //   return  {};
    // }

    let statusCode = error?.response?.status;
    
    // const HTTP_UNAUTHORIZED = [401, 419];
    if(statusCode && [401, 419].includes(statusCode)){
      // sessionStorage.removeItem(TOKEN_KEY);
      // authErrors.login = 0;

      return {
        error,
        authenticated: false,
        logout: true,
        redirectTo: import.meta.env.VITE_LOGIN_PATH, // "/auth/login"
      }
    }

    return { error };
  },
};
