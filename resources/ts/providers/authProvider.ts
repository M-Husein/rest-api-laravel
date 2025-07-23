import { AuthProvider } from "@refinedev/core";
import { api, httpRequest } from '@/providers/dataProvider';
import { TOKEN_KEY, getToken, setToken, clearToken } from '@/utils/authToken';
import { toggleLoaderApp } from '@/utils/dom';

const loginProccess = (token: string, expiresAt: string, user: any) => {
  setToken(token, expiresAt);

  // window.location.replace('/');

  const lang = user.lang || APP.defaultLang;

  localStorage.setItem("i18nextLng", lang);
  document.documentElement.lang = lang;
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
      // await api.get('sanctum/csrf-cookie');

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

      //   loginProccess(token, expiresAt, user);

      //   return {
      //     user, // <- Custom
      //     success: true,
      //     // redirectTo: "/app", // For admin
      //     redirectTo: "/",
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

      // if(data.message){
      //   errorResponse.error.message = data.message;
      // }

      return e;
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
        // await api.get('sanctum/csrf-cookie');

        // Hack for Refine run check to get user authentication
        sessionStorage.removeItem('LoginError');

        const response: any = await httpRequest.post('login', {
          // credentials: 'same-origin',
          json: provider 
            ? { provider, type: "spa" } 
            : { email, username, password, remember, type: "spa" }
        }).json();

        // console.log('response: ', response);

        if(response?.data){ // !response?.errors
          let { token, expiresAt, user } = response.data;

          loginProccess(token, expiresAt, user);
          
          return {
            user, // <- Custom
            success: true,
            // redirectTo: "/app", // For admin
            redirectTo: "/"
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
        sessionStorage.setItem('LoginError', '1');

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
      // await api.get('sanctum/csrf-cookie');

      /** @OPTION : make sure logout api success */
      const response: any = await httpRequest.post('logout', {
        keepalive: true
      })
      .json();
      // console.log('response: ', response);

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
      if(!response?.errors){ // response?.data
        clearToken(); // Clear data

        const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
        bc.postMessage({ type: "LOGOUT" });

        // Reset to default lang
        localStorage.setItem("i18nextLng", APP.defaultLang);
        document.documentElement.lang = APP.defaultLang;

        return {
          success: true,
          redirectTo: import.meta.env.VITE_LOGIN_PATH,
        };
      }
      return errorResponse;
    } catch { // (e)
      return errorResponse;
    } finally {
      toggleLoaderApp();
    }
  },
  
  check: async () => {
    // Hack for Refine run check to get user authentication
    const loginError = sessionStorage.getItem('LoginError');
    if(loginError){
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

      // console.log('req: ', req);

      if(response?.data){
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify(response.data));
        return { ...response.data, authenticated: true }
      }

      clearToken(); // Clear data

      return errorResponse;
    } catch { // (e)
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

  /** @DEV_OPTIONS : email */
  forgotPassword: async ({ username }) => {
    const errorResponse = {
      success: false,
      error: {
        name: "ForgotPasswordError",
        message: "Username does not exist",
      },
    };

    try { // send password reset link to the user's email address here
      // 'forgot-password/' + username
      const response: any = await api.post('forgot-password');
      // console.log('response: ', response);
      if(response?.data){
        return {
          success: true,
          redirectTo: import.meta.env.VITE_LOGIN_PATH, // "/auth/login"
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
