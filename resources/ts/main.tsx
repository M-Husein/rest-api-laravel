import { StrictMode } from "react"; // Suspense
import { createRoot } from "react-dom/client";
import { App } from "@/App";

import './i18n'; // locale

// import "@refinedev/antd/dist/reset.css";
import "./style/style.scss";

// console.log('React version:', React.version);

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
