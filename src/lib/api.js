import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : "/api";

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// O backend atual autentica por sessão de login, mas ainda não emite JWT.
// Não enviamos um Bearer fictício.
export const endpoints = {
  login: "/auth/login",
  projects: "/projetos",
  project: (id) => `/projetos/${id}`,
  calculate: (id) => `/projetos/${id}/calculo`,
  submit: (id) => `/projetos/${id}/submissao`,
  evaluate: (id) => `/projetos/${id}/avaliacao`,
  evaluations: (id) => `/projetos/${id}/avaliacoes`,
  archive: (id) => `/projetos/${id}/arquivar`,
  health: "/health",
};

export function mensagemErro(error) {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (data?.fields && typeof data.fields === "object") {
    return Object.entries(data.fields).map(([campo, msg]) => `${campo}: ${msg}`).join("\n");
  }
  if (error?.response?.status === 404) return "Registro ou endpoint não encontrado (404).";
  if (error?.response?.status === 409) return data?.error || "A operação não é permitida para o status atual do projeto.";
  if (error?.code === "ERR_NETWORK") return "Não foi possível conectar à API. Verifique se o backend está rodando.";
  return data?.error || error?.message || "Ocorreu um erro ao comunicar com o servidor.";
}

export default api;
