import React from "react";
import ReactDOM from "react-dom/client";
import "./storage.js"; // doit être importé avant App pour définir window.storage
import "./index.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
