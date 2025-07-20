import { AuthProvider } from "@refinedev/core";
import { api, httpRequest } from '@/providers/dataProvider';
import { TOKEN_KEY, getToken, setToken, clearToken } from '@/utils/authToken';
import { getAppLang } from '@/utils/setAppLang'; // setAppLang, 
import { toggleLoaderApp } from '@/utils/dom';

const HTTP_UNAUTHORIZED = [401, 419];

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

      const locale = getAppLang(); // setAppLang();

      const response: any = await httpRequest.post('register', {
        searchParams: locale.obj, // setAppLang(),
        json 
      }).json();
      // console.log('response: ', response);

      // if(response?.data){
      //   return {
      //     success: true,
      //     redirectTo: redirectPath,
      //     successNotification: {
      //       message: response.message || "Registration Successful",
      //       description: "You have successfully registered",
      //     },
      //   };
      // }

      // return errorResponse;

      /** @OPTION : Auto login */
      if(response?.data){
        // let { token, expiresAt } = response.data;
        setToken(response.data.token, response.data.expiresAt);

        return {
          success: true,
          redirectTo: "/app" + locale.str,
          successNotification: {
            message: response.data.message || "Registration Successful",
            description: "You have successfully registered",
          },
        };
      }

      return errorResponse;
    } catch(e: any) {
      const data = await e.response.json().catch(() => null);
      // console.log('data: ', data);

      if(data.message){
        errorResponse.error.message = data.message;
      }

      return errorResponse;
    }
  },
  
  /** @OPTIONS : providerName */
  login: async ({ email, username, password, remember, provider }) => {
    const errorResponse = {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };

    if( ((username || email) && password) || provider ){
      try {
        /** @OPTION : For cross domain */
        // await api.get('sanctum/csrf-cookie');

        const locale = getAppLang(); // setAppLang();

        const response: any = await httpRequest.post('login', {
          searchParams: locale.obj, // locale
          json: provider 
            ? { provider, type: "spa" } 
            : { email, username, password, remember, type: "spa" }
        }).json();

        // console.log('response: ', response);

        if(response?.data){
          let { token, expiresAt, user } = response.data;
          setToken(token, expiresAt);

          // window.location.replace('/');
          
          return {
            success: true,
            // redirectTo: "/app" + locale.str,
            redirectTo: "/" + locale.str,
            user
          };
        }

        return errorResponse;
      }catch(e: any) { // (e: any)
        const data = await e.response.json().catch(() => null);
        // console.log('data: ', data);

        if(data.message){
          errorResponse.error.message = data.message;
        }

        return errorResponse;
        // throw errorResponse;
        // return Promise.reject(errorResponse);
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

      const locale = getAppLang(); // setAppLang();

      /** @OPTION : make sure logout api success */
      const response: any = await httpRequest.post('logout', {
        searchParams: locale.obj, // locale
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

        return {
          success: true,
          redirectTo: import.meta.env.VITE_LOGIN_PATH + locale.str,
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
      const response: any = await httpRequest('me', { searchParams: getAppLang().obj }).json();

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
      const response: any = await api.post('forgot-password', { searchParams: getAppLang().obj });
      // console.log('response: ', response);
      if(response?.data){
        return {
          success: true,
          redirectTo: import.meta.env.VITE_LOGIN_PATH + getAppLang().str, // "/auth/login"
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
    
    if(statusCode && HTTP_UNAUTHORIZED.includes(statusCode)){
      return {
        error,
        authenticated: false,
        logout: true,
        redirectTo: import.meta.env.VITE_LOGIN_PATH + getAppLang().str, // "/auth/login"
      }
    }

    return { error };
  },
};
