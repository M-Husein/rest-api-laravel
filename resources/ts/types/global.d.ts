interface AppConfig {
  api: string,
  timeout: number,
  locales: {
    [string]: string
  }
}

/**
 * App Config
 * @var api : "http://localhost:8000/api/v1"
 * @var timeout : 30000
 * @var locales : { id:"Indonesia", en:"English" }
 */
declare const APP: Readonly<AppConfig>;

/**
 * @NOTE : For setup or app config in global window object
 */
// declare global {
//   interface Window {
//     APP: {
//       api: string,
//       api2: string,
//       ws: string,
//       timeout: number,
//     };
//   }
// }

// // Laravel Starter kit
// import type { route as routeFn } from 'ziggy-js';

// declare global {
//     const route: typeof routeFn;
// }
