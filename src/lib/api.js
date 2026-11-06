import axios from "axios";

/**
 * Em desenvolvimento, o Vite encaminha /api para o Spring Boot e remove
 * o prefixo /api, pois os controllers Java usam rotas como /auth/login.
 * Em produção, VITE_API_BASE_URL deve apontar diretamente para a origem da API.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : "/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    if (error?.response?.status === 401) {
      console.warn("[api] Credenciais inválidas ou sessão não autenticada.");
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

export const endpoints = {
  login: "/auth/login",
  projects: "/projetos",
  project: (id) => `/projetos/${id}`,
  calculate: (id) => `/projetos/${id}/calcular`,
  dashboardSummary: "/dashboard/resumo",
};

export default api;
