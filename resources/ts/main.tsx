import { StrictMode } from "react"; // , Suspense
import { createRoot } from "react-dom/client";
import { App } from "@/App";
// import { api } from "@/providers/dataProvider/utils/httpRequest";

import './i18n'; // locale

// import "@refinedev/antd/dist/reset.css";
import "./style/style.scss";

// console.log('React version:', React.version);

// (async () => {
//   try {
//     // Use base 'api' instance to hit the CSRF endpoint
//     // It uses 'credentials: "include"' from httpRequest.ts already
//     await api.get('sanctum/csrf-cookie', { retry: 2 });
//     // console.log('CSRF cookie fetched successfully.');
//   } catch (error) {
//     console.error('Failed to fetch CSRF cookie:', error);
//   }
// })();

createRoot(document.getElementById("app") as HTMLElement)
  .render(
    <StrictMode>
      <App />
    </StrictMode>
  );

/*
<Suspense 
  // fallback={<LoaderApp />}
  fallback=""
>
  <App />
</Suspense>
*/
