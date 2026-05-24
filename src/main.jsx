import React from "react";
import ReactDOM from "react-dom/client";

import "./rtl.css";
import "./toolbar-rtl.css";
import "./index.css";

import App from "./App";
import "./i18n";

import { ContextProvider } from "./store/ContextApi";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </React.StrictMode>
);