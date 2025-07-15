/**
 * @FROM : https://github.com/refinedev/refine/blob/master/packages/simple-rest/src/utils/axios.ts
 */
// import { HttpError } from "@refinedev/core";
import ky from 'ky';
import { getCsrfToken, getToken } from '@/utils/authToken'; // , clearToken

export const api = ky.create({
  prefixUrl: APP.api, // import.meta.env.VITE_API
  retry: 0,
  // Default = 10000 (10 seconds)
  timeout: APP.timeout,
});

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const httpRequest = api.extend({
  credentials: "include",
	hooks: {
		beforeRequest: [
			request => {
        // console.log('request: ', request);

        /** @OPTION : For csrf token */
        // request.credentials === "include" && 
        if(MUTATING_METHODS.includes(request.method)){
          const csrfToken = getCsrfToken();
          if(csrfToken){
            request.headers.set('X-XSRF-TOKEN', csrfToken); // decodeURIComponent(csrfToken)
          }
        }

        const token = getToken();
        if(token){
          request.headers.set('Authorization', 'Bearer ' + token);
        }
			}
		],
	},
});