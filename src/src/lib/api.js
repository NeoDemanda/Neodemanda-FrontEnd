import axios from "axios";

/**
 * Base URL resolution:
 * - In dev, requests to `/api/**` are proxied by Vite to VITE_API_PROXY_TARGET
 *   (see vite.config.js), so we can just call relative paths.
 * - In production, set VITE_API_BASE_URL to the deployed Java API origin,
 *   e.g. https://api.neodemanda.neoenergia.com.br
 */
const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach an auth token automatically if one is present.
// Swap this for whatever auth scheme the Java backend (Spring Security /
// JWT / OAuth2) expects once it's defined.
api.interceptors.request.use((config) => {
  const token = localStorageSafeGet("neodemanda:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Session expired / not authenticated — hook up redirect-to-login here.
      console.warn("[api] 401 recebido — sessão inválida ou expirada.");
    }
    return Promise.reject(error);
  }
);

function localStorageSafeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Endpoint map. Keeping every route in one place makes it a one-line change
 * to point the frontend at the real Java controllers once they exist.
 * Suggested Spring Boot mapping on the other side:
 *
 *   GET    /api/projetos
 *   GET    /api/projetos/{id}
 *   POST   /api/projetos
 *   PUT    /api/projetos/{id}
 *   DELETE /api/projetos/{id}
 *   POST   /api/projetos/{id}/calcular   -> roda o motor de cálculo de demanda
 *   GET    /api/dashboard/resumo         -> contadores do topo do dashboard
 */
export const endpoints = {
  projects: "/projetos",
  project: (id) => `/projetos/${id}`,
  calculate: (id) => `/projetos/${id}/calcular`,
  dashboardSummary: "/dashboard/resumo",
};

export default api;
