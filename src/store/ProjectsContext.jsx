import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { endpoints } from "../lib/api";

const ProjectsContext = createContext(null);

const statusMap = {
  RASCUNHO: "rascunho",
  EM_ANALISE: "em_analise",
  EM_CORRECAO: "em_correcao",
  APROVADO: "validado",
  REPROVADO: "inconsistente",
  ARQUIVADO: "arquivado",
};

export function normalizarProjeto(dto) {
  return {
    ...dto,
    id: dto.id,
    nome: dto.nomeProjeto,
    endereco: "",
    status: statusMap[dto.status] || String(dto.status || "RASCUNHO").toLowerCase(),
    demandaContratada: Number(dto.cargaInstaladaKva ?? 0),
    demandaCalculada: null,
    unidades: Number(dto.quantidadeUnidadesConsumidoras ?? 0),
    tipoEdificacao: dto.tipoEdificacao,
    projetista: dto.responsavelTecnico,
    creaResponsavel: dto.creaResponsavel,
    arquivado: dto.status === "ARQUIVADO",
  };
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(endpoints.projects);
      if (!Array.isArray(data)) throw new Error("A API retornou uma lista de projetos inválida.");
      const normalizados = data.map(normalizarProjeto);
      const comCalculos = await Promise.all(normalizados.map(async (projeto) => {
        try {
          const calculo = await api.get(endpoints.calculate(projeto.id));
          const demanda = Number(calculo.data?.resultado?.dproj);
          const memorial = Array.isArray(calculo.data?.memorial) ? calculo.data.memorial : null;
          return { ...projeto, demandaCalculada: Number.isFinite(demanda) ? demanda : null, memorial };
        } catch {
          return projeto;
        }
      }));
      setProjects(comCalculos);
      try {
        const archivedResponse = await api.get(endpoints.projects, { params: { status: "ARQUIVADO" } });
        setArchivedProjects(Array.isArray(archivedResponse.data) ? archivedResponse.data.map(normalizarProjeto) : []);
      } catch {
        setArchivedProjects([]);
      }
    } catch (err) {
      setProjects([]);
      setArchivedProjects([]);
      setError(err?.response ? (err.response.data?.message || "Falha ao carregar projetos da API.") : "Não foi possível conectar ao backend. Nenhum dado demonstrativo será exibido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createProject = useCallback(async (form) => {
    const payload = {
      nomeProjeto: form.nomeProjeto.trim(),
      responsavelTecnico: form.responsavelTecnico.trim(),
      creaResponsavel: form.creaResponsavel.trim(),
      quantidadeUnidadesConsumidoras: Number(form.quantidadeUnidadesConsumidoras),
      cargaInstaladaKva: Number(form.cargaInstaladaKva),
      tipoEdificacao: form.tipoEdificacao,
    };
    const { data } = await api.post(endpoints.projects, payload);
    const projeto = normalizarProjeto(data);
    setProjects((current) => [projeto, ...current]);
    return projeto;
  }, []);

  const getProject = useCallback(async (id) => {
    const { data } = await api.get(endpoints.project(id));
    return normalizarProjeto(data);
  }, []);

  const updateProject = useCallback(async (id, form) => {
    const payload = {
      nomeProjeto: form.nomeProjeto.trim(),
      responsavelTecnico: form.responsavelTecnico.trim(),
      creaResponsavel: form.creaResponsavel.trim(),
      quantidadeUnidadesConsumidoras: Number(form.quantidadeUnidadesConsumidoras),
      cargaInstaladaKva: Number(form.cargaInstaladaKva),
      tipoEdificacao: form.tipoEdificacao,
    };
    const { data } = await api.put(endpoints.project(id), payload);
    const projeto = normalizarProjeto(data);
    setProjects((current) => current.map((p) => p.id === Number(id) ? projeto : p));
    return projeto;
  }, []);

  const calculateProject = useCallback(async (id, payload) => {
    const { data } = await api.post(endpoints.calculate(id), payload);
    setProjects((current) => current.map((p) => p.id === Number(id) ? { ...p, demandaCalculada: Number(data?.resultado?.dproj ?? NaN), memorial: Array.isArray(data?.memorial) ? data.memorial : null } : p));
    return data;
  }, []);

  const getCalculation = useCallback(async (id) => {
    const { data } = await api.get(endpoints.calculate(id));
    return data;
  }, []);

  const submitProject = useCallback(async (id) => {
    const { data } = await api.post(endpoints.submit(id));
    const projeto = normalizarProjeto(data);
    setProjects((current) => current.map((p) => p.id === id ? { ...p, ...projeto } : p));
    return projeto;
  }, []);

  const archiveProject = useCallback(async (id) => {
    const { data } = await api.patch(endpoints.archive(id));
    const projeto = normalizarProjeto(data);
    setProjects((current) => current.filter((p) => p.id !== id));
    setArchivedProjects((current) => [projeto, ...current.filter((p) => p.id !== id)]);
    return projeto;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await api.delete(endpoints.project(id));
    setProjects((current) => current.filter((p) => p.id !== id));
  }, []);

  const evaluateProject = useCallback(async (id, decisao, parecer) => {
    const { data } = await api.post(endpoints.evaluate(id), { decisao, parecer: parecer?.trim() || null });
    await load();
    return data;
  }, [load]);

  const loadEvaluations = useCallback(async (id) => {
    const { data } = await api.get(endpoints.evaluations(id));
    return data;
  }, []);

  const ativos = projects;
  const arquivados = archivedProjects;
  const value = useMemo(() => ({
    projects, ativos, arquivados, loading, error, usingMock: false,
    reload: load, createProject, getProject, updateProject, calculateProject, getCalculation,
    submitProject, archiveProject, deleteProject, evaluateProject, loadEvaluations,
  }), [projects, ativos, arquivados, loading, error, load, createProject, getProject, updateProject, calculateProject, getCalculation, submitProject, archiveProject, deleteProject, evaluateProject, loadEvaluations]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects precisa estar dentro de <ProjectsProvider>.");
  return ctx;
}
