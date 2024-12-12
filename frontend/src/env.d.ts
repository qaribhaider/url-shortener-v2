/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHORTENER_API_URL: string;
  readonly VITE_SHORTENER_REDIRECTOR_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
