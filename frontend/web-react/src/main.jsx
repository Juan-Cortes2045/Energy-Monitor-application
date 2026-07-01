import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";

import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </ThemeProvider>
  </React.StrictMode>,
);