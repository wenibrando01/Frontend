
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";  // just import App
import "./index.css";      // optional global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />  {/* App handles routing, layout, pages */}
  </React.StrictMode>
);