/**
 * @FROM : https://github.com/refinedev/refine/blob/master/packages/simple-rest/src/utils/axios.ts
 */
// import { HttpError } from "@refinedev/core";
import ky from 'ky';
import { getCsrfToken, getToken } from '@/utils/authToken'; // , clearToken
// import { useNotificationProvider } from '@/providers/notificationProvider';

// const notif = useNotificationProvider();

export const api = ky.create({
  prefixUrl: APP.api, // import.meta.env.VITE_API
  retry: 0,
  // Default = 10000 (10 seconds)
  timeout: APP.timeout,
  hooks: {
    beforeError: [
      async (error: any) => {
        const { response } = error;

        // console.log('response: ', response);
        // console.log('error: ', error);
        // console.log('error.name: ', error.name);

        if (response) {
          const contentType = response.headers.get('content-type');

          if (contentType?.includes('application/json')) {
            const body = await response.json();
            // error.name = 'HttpError';
            error.message = body.message || response.statusText;
            error.status = response.status;
            error.statusCode =  body.errors || response.status;
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

    //     // Example: show success or error based on response
    //     // if (response.ok && data?.message) {
    //     //   notificationProvider.open?.({
    //     //     type: 'success',
    //     //     message: data.message,
    //     //     description: data.details || '',
    //     //   });
    //     // } else if (!response.ok) {
    //     //   notificationProvider.open?.({
    //     //     type: 'error',
    //     //     message: data?.error || 'Request failed',
    //     //     description: data?.details || '',
    //     //   });
    //     // }

    //     // if(response){
    //     //   notif.open?.({
    //     //     type: "success", // @ts-ignore
    //     //     message: jsonResponse?.message,
    //     //   });
    //     // }

    //     // console.log('useNotificationProvider: ', useNotificationProvider);

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