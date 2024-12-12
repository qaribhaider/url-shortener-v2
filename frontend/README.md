# URL Shortener Frontend

A modern, responsive web interface for the URL Shortener service built with Vite.

## Development

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Docker Support

Build and run with Docker:

```bash
docker build -t url-shortener-frontend .
docker run -p 5173:5173 url-shortener-frontend
```

Or use docker-compose from the root directory:

```bash
docker-compose up
```

## Environment Variables

- `VITE_SHORTENER_API_URL`: URL of the backend API (default: http://localhost:3010)
- `VITE_SHORTENER_REDIRECTOR_URL`: URL of the redirector (default: http://localhost:8080)
