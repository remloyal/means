import React, { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

const Summary = lazy(() => import('../views/Home/Summary'));
const Deploy = lazy(() => import('../views/Deploy/Deploy'));
const History = lazy(() => import('../views/History/History'));
const CfrHome = lazy(() => import('../views/Cfr/CfrHome'));

const routeConfig = [
  {
    path: '/',
    element: <Summary />,
  },
  {
    path: '/deploy',
    element: <Deploy />,
  },
  {
    path: '/history',
    element: <History />,
  },
  {
    path: '/cfrHome',
    element: <CfrHome />,
  },
];

const Routes = () => {
  return useRoutes(routeConfig);
};
export default Routes;
