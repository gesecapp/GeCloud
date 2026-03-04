/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORE_URL: string;
  readonly VITE_RUN_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
