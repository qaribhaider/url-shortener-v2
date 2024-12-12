import axios, { AxiosInstance } from 'axios';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_SHORTENER_API_URL || 'http://localhost:3010';

export function useApi() {
  const navigate = useNavigate();

  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return instance;
  }, [navigate]);

  const get = useCallback(<T = any>(url: string) => {
    return api.get<T>(url);
  }, [api]);

  const post = useCallback(<T = any>(url: string, data?: any) => {
    return api.post<T>(url, data);
  }, [api]);

  const put = useCallback(<T = any>(url: string, data?: any) => {
    return api.put<T>(url, data);
  }, [api]);

  const del = useCallback(<T = any>(url: string) => {
    return api.delete<T>(url);
  }, [api]);

  return {
    get,
    post,
    put,
    delete: del,
  };
}
