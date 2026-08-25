import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";

import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { HomeProvider } from "./context/HomeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <HomeProvider>
        <App />
      </HomeProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
