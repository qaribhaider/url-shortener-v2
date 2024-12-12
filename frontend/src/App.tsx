import { useState, useRef, useEffect } from 'react';
import { ApiService } from './services/api.service';
import { appTitle } from './utils/config';

function App() {
  const [url, setUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiService = new ApiService();

  useEffect(() => {
    // Auto-focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    document.title = appTitle;
  }, [appTitle]);

  const shortenUrl = async (urlToShorten: string) => {
    try {
      setLoading(true);
      setError(null);
      setShortCode('');
      const response = await apiService.shortenUrl(urlToShorten);
      setShortCode(response.shortCode);
    } catch (err: any) {
      if (err?.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    shortenUrl(url);
  };

  const shortUrl = shortCode ? `${import.meta.env.VITE_SHORTENER_REDIRECTOR_URL}/${shortCode}` : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 w-full max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{appTitle}</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your URL here"
            className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            data-autofocus
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full p-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!url || loading}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>

        {shortCode && (
          <div className="mt-6 p-4 bg-gray-800 rounded-md text-center">
            <span className="text-lg font-semibold">Your shortened URL:</span>
            <div className="flex items-center justify-center mt-2 bg-gray-700 p-2 rounded-md">
              <a href={shortUrl} target="_blank" className="text-blue-400 hover:underline">{shortUrl}</a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
