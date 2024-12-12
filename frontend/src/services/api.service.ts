const API_BASE_URL = import.meta.env.VITE_SHORTENER_API_URL || 'http://localhost:3010';

export interface ShortenUrlResponse {
  shortCode: string;
  originalUrl: string;
}

export class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      let errorMessage = error?.message || 'Request failed';

      if (error?.errors) {
        errorMessage = error?.errors.join(', ');
      } else if (Array.isArray(error?.message)) {
        errorMessage = error?.message.join(', ');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async shortenUrl(url: string) {
    return this.request<{ shortCode: string }>('/shorten', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }
}
