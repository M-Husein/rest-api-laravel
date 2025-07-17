import { AuthProvider } from "@refinedev/core";
import { api, httpRequest } from '@/providers/dataProvider';
import { TOKEN_KEY, getToken, setToken, clearToken } from '@/utils/authToken';
import { setAppLang } from '@/utils/setAppLang';

const toggleLoaderApp = () => {
  (document.getElementById('loaderApp') as HTMLElement)?.classList.toggle('hidden');
}

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

      const req: any = await httpRequest.post('register', {
        searchParams: setAppLang(),
        json 
      }).json();
      // console.log('req: ', req);

      // if(req?.data){
      //   return {
      //     success: true,
      //     redirectTo: redirectPath,
      //     successNotification: {
      //       message: req.message || "Registration Successful",
      //       description: "You have successfully registered",
      //     },
      //   };
      // }

      // return errorResponse;

      /** @OPTION : Auto login */
      if(req?.data){
        // let { token, expiresAt } = req.data;
        setToken(req.data.token, req.data.expiresAt);

        return {
          success: true,
          redirectTo: "/app",
          successNotification: {
            message: req.data.message || "Registration Successful",
            description: "You have successfully registered",
          },
        };
      }

      return errorResponse;
    } catch(e: any) {
      // console.log('e: ', e);
      // console.log('name: ', e.name);
      // console.log('message: ', e.message);
      // console.log('response: ', e.response);
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

        const req: any = await httpRequest.post('login', {
          searchParams: setAppLang(),
          json: provider 
            ? { provider, type: "spa" } 
            : { email, username, password, remember, type: "spa" }
        }).json();

        // console.log('req: ', req);

        if(req?.data){
          // let { token, expiresAt } = req.data;
          setToken(req.data.token, req.data.expiresAt);

          // window.location.replace('/');
          return {
            success: true,
            redirectTo: "/app",
          };
        }

        return errorResponse;
      }catch { // (e: any)
        return errorResponse;
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
      const req: any = await httpRequest.post('logout', {
        searchParams: setAppLang(),
        keepalive: true
      })
      .json();
      // console.log('req: ', req);

      // httpRequest.post('logout', {
      //   keepalive: true,
      //   headers: {
      //     Authorization: 'Bearer ' + token,
      //   }
      // });

      // clearToken(); // Clear data

      // const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
      // bc.postMessage({ type: "LOGOUT" });

      // // window.location.replace('/auth/login');

      // return {
      //   success: true,
      //   redirectTo: "/auth/login",
      //   // successNotification: {
      //   //   message: "Logout Successful",
      //   //   description: "You have successfully logged out",
      //   // },
      // };

      /** @OPTION : make sure logout api success */
      if(req?.data){
        clearToken(); // Clear data

        const bc = new BroadcastChannel(import.meta.env.VITE_BC_NAME);
        bc.postMessage({ type: "LOGOUT" });

        return {
          success: true,
          redirectTo: "/auth/login",
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
      // redirectTo: "/auth/login",
      error: {
        name: "Unauthorized",
        message: "Check failed",
      },
    };

    try {
      const req: any = await httpRequest('me', { searchParams: setAppLang() }).json();

      // console.log('req: ', req);

      if(req?.data){
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify(req.data));
        return { ...req.data, authenticated: true }
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
      const req: any = await api.post('forgot-password', { searchParams: setAppLang() });
      // console.log('req: ', req);
      if(req?.data){
        return {
          success: true,
          redirectTo: "/auth/login",
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
        redirectTo: "/auth/login",
      }
    }

    return { error };
  },
};
