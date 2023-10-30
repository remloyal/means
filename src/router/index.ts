import React, { lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  useRoutes,
  Navigate,
} from "react-router-dom";

const Home = lazy(() => import("../views/Home/Home"));
const Summary = lazy(() => import("../views/Home/Summary"));

const router = createBrowserRouter([
  {
    path: "/",
    Component: Summary,
  },
  {
    path: "/page2",
    Component: Home,
  },
  {
    path: "/page3",
    Component: Home,
  },
]);

export default router;
