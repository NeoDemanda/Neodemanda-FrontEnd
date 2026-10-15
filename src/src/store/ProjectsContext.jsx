import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { mockProjects } from "../data/mockProjects";

/**
 * Fonte única de verdade dos projetos no frontend.
 *
 * O projeto roda 100% local, sem depender de API/backend.
 * Os dados iniciais vêm de mockProjects e as alterações são persistidas
 * no localStorage para continuarem disponíveis após recarregar a página.
 */
const ProjectsContext = createContext(null);

const STORAGE_KEY = "neodemanda:projects";

const slug = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

function readStoredProjects() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockProjects;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : mockProjects;
  } catch {
    return mockProjects;
  }
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => readStoredProjects());

  // Persiste qualquer alteração local. Nenhuma requisição HTTP é feita.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // A interface continua funcionando mesmo se o storage estiver indisponível.
    }
  }, [projects]);

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
      atuais.map((p) =>
        p.id === id ? { ...p, arquivado: true, status: "arquivado" } : p
      )
    );
  }, []);

  const restoreProject = useCallback((id) => {
    setProjects((atuais) =>
      atuais.map((p) =>
        p.id === id ? { ...p, arquivado: false, status: "rascunho" } : p
      )
    );
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects((atuais) => atuais.filter((p) => p.id !== id));
  }, []);

  const reload = useCallback(() => {
    // Mantém o mesmo contrato usado pela interface, mas sem backend.
    setProjects(readStoredProjects());
  }, []);

  const value = useMemo(() => {
    const ativos = projects.filter((p) => !p.arquivado);
    const arquivados = projects.filter((p) => p.arquivado);

    return {
      projects,
      ativos,
      arquivados,
      loading: false,
      usingMock: true,
      reload,
      createProject,
      archiveProject,
      restoreProject,
      deleteProject,
    };
  }, [projects, reload, createProject, archiveProject, restoreProject, deleteProject]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects precisa estar dentro de <ProjectsProvider>.");
  return ctx;
}
