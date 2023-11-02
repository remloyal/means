import React, { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

const Home = lazy(() => import('../views/Home/Home'));
const Summary = lazy(() => import('../views/Home/Summary'));
const Deploy = lazy(() => import('../views/Deploy/Deploy'));

const routeConfig = [
  {
    path: '/',
    element: <Summary />,
  },
  {
    path: '/deploy',
    element: <Deploy />,
  },
];

const Routes = () => {
  return useRoutes(routeConfig);
};
export default Routes;
