/**
 * @FROM : https://github.com/refinedev/refine/blob/master/packages/simple-rest/src/utils/axios.ts
 */
import { HttpError } from "@refinedev/core";
import axios from "axios";

// axiosInstance
// {
//   headers: {
//     "X-Requested-With": "XMLHttpRequest", // DEV_OPTION
//   }
// }
const httpRequest = axios.create();

httpRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    // console.log('err: ', err)
    // console.log('message: ', err.message)
    // console.log('type: ', err.type)
    // console.log('response: ', err.response)
    // console.log('cause: ', err.cause)

    const customError: HttpError = {
      ...err,
      message: err.response?.data?.message || err.message,
      statusCode: err.response?.status,
    };

    return Promise.reject(customError);
  },
);

export { httpRequest }; // { axiosInstance }
