import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg mt-4">
        The page you are looking for doesn't exist or you don't have permission to access it.
      </p>
      <button className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded" onClick={() => navigate('/')}>
        Take me back to home page
      </button>
    </div>
  );
}
