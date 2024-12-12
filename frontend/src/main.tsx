import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center p-4 w-full">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
);