/// <reference types="vite/client" />

declare global {
  interface Window {
    // no-op: keep window types extendable
  }
}

interface ImportMetaEnv {
  // browser env stays minimal when Massive is proxied server-side
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
