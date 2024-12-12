import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { NotFound } from './pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);
