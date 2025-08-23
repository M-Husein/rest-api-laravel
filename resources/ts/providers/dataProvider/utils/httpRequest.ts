/**
 * @FROM : https://github.com/refinedev/refine/blob/master/packages/simple-rest/src/utils/axios.ts
 */
// import { HttpError } from "@refinedev/core";
import ky from 'ky';
import { getCsrfToken, getToken } from '@/utils/authToken';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export const api = ky.create({
  // "http://localhost:8000", // 
  prefixUrl: APP.api, // import.meta.env.VITE_API
  retry: 0,
  timeout: APP.timeout, // Default = 10000 (10 seconds)
  hooks: {
    beforeRequest: [
      request => {
        /** For csrf token */
        if(request.credentials !== "omit" && MUTATING_METHODS.includes(request.method)){
          let csrfToken = getCsrfToken();
          csrfToken && request.headers.set('X-XSRF-TOKEN', csrfToken); // decodeURIComponent(csrfToken)
        }

        let lang = localStorage.getItem('i18nextLng');
        if(lang){ //  && lang !== APP.defaultLang
          request.headers.set('Accept-Language', lang);
        }
      }
    ],
    beforeError: [
      async (error: any) => {
        const { response } = error;

        // console.log('response: ', response);
        // console.log('error: ', error);
        // console.log('error.name: ', error.name);

        if (response) {
          const contentType = response.headers.get('content-type');

          if (contentType?.includes('application/json')) {
            let body = await response.json();
            // error.name = 'HttpError';
            error.message = body.message || response.statusText;
            error.status = response.status;
            // error.statusCode =  typeof body.errors === 'number' ? body.errors : response.status;
            error.statusCode =  response.status;
            error.data = body;
            // error.error = {
            //   // name: 'HttpError',
            //   message: body.message || response.statusText
            // };

            // console.log('body: ', body);

          } else {
            error.message = await response.text();
          }
        }

        return error;
      },
    ],
    // afterResponse: [
    //   // @ts-ignore
    //   async (_input, _options, response) => {
    //     // You could do something with the response, for example, logging.
    //     // const jsonResponse = await response.json();

    //     console.log('afterResponse response: ', response);
    //     // console.log('afterResponse jsonResponse: ', jsonResponse);

    //     // successNotification: {
    //     //     message: response.data.message || "Registration Successful",
    //     //     description: "You have successfully registered",
    //     //   },

    //     const jsonResponse = await response.json();

    //     console.log('afterResponse jsonResponse: ', jsonResponse);

    //     // Or return a `Response` instance to overwrite the response.
    //     // return new Response('A different response', {status: 200});
    //     // @ts-ignore
    //     // return {
    //     //   // @ts-ignore
    //     //   ...jsonResponse,
    //     //   successNotification: {
    //     //     // @ts-ignore
    //     //     message: jsonResponse?.message,
    //     //   }
    //     // };

    //   },

    //   // Or retry with a fresh token on a 403 error
    //   // async (input, options, response) => {
    //   //   if (response.status === 403) {
    //   //     // Get a fresh token
    //   //     const token = await ky('https://example.com/token').text();

    //   //     // Retry with the token
    //   //     options.headers.set('Authorization', `token ${token}`);

    //   //     return ky(input, options);
    //   //   }
    //   // }
    // ],
  }
});

export const httpRequest = api.extend({
  credentials: "include",
	hooks: {
		beforeRequest: [
			request => {
        // console.log('request: ', request);

        let token = getToken();
        token && request.headers.set('Authorization', 'Bearer ' + token);
			}
		],
	},
});