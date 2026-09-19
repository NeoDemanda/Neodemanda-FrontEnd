import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { endpoints } from "../lib/api";
import { mockProjects } from "../data/mockProjects";

/**
 * Fonte única de verdade dos projetos na interface.
 *
 * Tenta carregar da API Java. Enquanto ela não existir, cai nos dados
 * mockados e marca `usingMock: true` — assim o dashboard, o arquivo e o
 * formulário de cadastro funcionam de ponta a ponta na demonstração.
 *
 * As mutações abaixo (criar, arquivar, restaurar, excluir) alteram apenas o
 * estado local quando estamos em modo mock. Quando o backend entrar, basta
 * trocar o corpo de cada função por uma chamada em `endpoints`.
 */
const ProjectsContext = createContext(null);

const slug = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoints.projects);
      const lista = Array.isArray(data) ? data : data?.content;
      // Sem uma lista válida (backend fora do ar, HTML de fallback, etc.)
      // seguimos com os dados de demonstração em vez de mostrar tela vazia.
      if (!Array.isArray(lista) || lista.length === 0) throw new Error("resposta inválida");
      setProjects(lista);
      setUsingMock(false);
    } catch {
      setProjects(mockProjects);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = useCallback((form) => {
    const novo = {
      id: `${slug(form.nome)}-${Date.now().toString(36)}`,
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      status: "rascunho",
      demandaCalculada: null,
      demandaContratada: Number(form.potenciaMaxima),
      tipoLigacao: form.tipoLigacao,
      fatorPotencia: Number(form.fatorPotencia),
      unidades: Number(form.unidades),
      protocolo: null,
      atualizadoEm: new Date().toISOString().slice(0, 10),
      arquivado: false,
    };
    setProjects((atuais) => [novo, ...atuais]);
    return novo;
  }, []);

  const archiveProject = useCallback((id) => {
    setProjects((atuais) =>
      atuais.map((p) => (p.id === id ? { ...p, arquivado: true, status: "arquivado" } : p))
    );
  }, []);

  const restoreProject = useCallback((id) => {
    setProjects((atuais) =>
      atuais.map((p) => (p.id === id ? { ...p, arquivado: false, status: "rascunho" } : p))
    );
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects((atuais) => atuais.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(() => {
    const ativos = projects.filter((p) => !p.arquivado);
    const arquivados = projects.filter((p) => p.arquivado);
    return {
      projects,
      ativos,
      arquivados,
      loading,
      usingMock,
      reload: load,
      createProject,
      archiveProject,
      restoreProject,
      deleteProject,
    };
  }, [projects, loading, usingMock, load, createProject, archiveProject, restoreProject, deleteProject]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects precisa estar dentro de <ProjectsProvider>.");
  return ctx;
}
