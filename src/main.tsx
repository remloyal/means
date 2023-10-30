import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import EventEmitter from "events";
import "@/utils/detectDevice";
import { BrowserRouter } from "react-router-dom";
window.eventBus = new EventEmitter();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
