import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, WifiOff, FolderOpen } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import { statusMeta, statusOrder } from "../data/mockProjects";
import PageBanner from "../components/PageBanner";
import ProjectCard from "../components/ProjectCard";

const stats = [
  { key: "todos", label: "Projetos", color: "text-white" },
  { key: "validado", label: "Validados", color: "text-ok-bright" },
  { key: "em_analise", label: "Em análise", color: "text-accent" },
  { key: "inconsistente", label: "Inconsistentes", color: "text-bad-bright" },
];

export default function Dashboard() {
  const { ativos, loading, usingMock, archiveProject, deleteProject } = useProjects();
  const [filtro, setFiltro] = useState("todos");

  const contagem = useMemo(() => {
    const base = { todos: ativos.length };
    for (const chave of statusOrder) base[chave] = ativos.filter((p) => p.status === chave).length;
    return base;
  }, [ativos]);

  const lista = useMemo(
    () => (filtro === "todos" ? ativos : ativos.filter((p) => p.status === filtro)),
    [ativos, filtro]
  );

  const abas = [{ key: "todos", label: "Todos" }, ...statusOrder.map((k) => ({ key: k, label: statusMeta[k].label }))];

  return (
    <>
      <PageBanner
        eyebrow="Projetos elétricos"
        title="Dashboard"
        action={
          <Link to="/novo-projeto" className="btn-accent">
            <Plus size={16} strokeWidth={2.6} />
            Novo Projeto
          </Link>
        }
      >
        <dl className="mt-9 grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
          {stats.map(({ key, label, color }, i) => (
            <div
              key={key}
              className={[
                "border-white/10 px-5 pb-1 pt-5",
                i === 1 || i === 3 ? "border-l" : "",
                i > 1 ? "border-t sm:border-t-0" : "",
                i > 0 ? "sm:border-l" : "",
              ].join(" ")}
            >
              <dd className={`font-display text-[32px] font-extrabold leading-none ${color}`}>
                {contagem[key] ?? 0}
              </dd>
              <dt className="eyebrow mt-2.5 text-white/45">{label}</dt>
            </div>
          ))}
        </dl>
      </PageBanner>

      <div className="mx-auto max-w-shell px-5 py-8 sm:px-8">
        {usingMock && (
          <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-warn/25 bg-warn-soft px-3 py-2 text-[12.5px] font-medium text-warn">
            <WifiOff size={14} />
            API Java indisponível — exibindo dados de demonstração.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {abas.map((aba) => {
            const ativo = filtro === aba.key;
            return (
              <button
                key={aba.key}
                type="button"
                onClick={() => setFiltro(aba.key)}
                className={[
                  "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                  ativo
                    ? "border-brand-800 bg-brand-800 text-white"
                    : "border-line bg-white text-ink-soft hover:border-ink-faint hover:text-ink",
                ].join(" ")}
              >
                {aba.label}
                <span
                  className={`rounded px-1.5 font-mono text-[10px] ${
                    ativo ? "bg-white/15 text-white/80" : "bg-line/70 text-ink-faint"
                  }`}
                >
                  {contagem[aba.key] ?? 0}
                </span>
              </button>
            );
          })}
          <span className="ml-auto font-mono text-[12px] text-ink-faint">
            {lista.length} projeto(s)
          </span>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[218px] animate-pulse rounded-[14px] border border-line bg-white/70" />
              ))}
            </div>
          ) : lista.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
              <FolderOpen size={26} className="text-ink-faint" />
              <p className="font-display text-[15px] font-bold text-ink">
                Nenhum projeto neste filtro
              </p>
              <p className="max-w-xs text-[13px] text-ink-soft">
                Cadastre um projeto para começar o cálculo de demanda.
              </p>
              <Link to="/novo-projeto" className="btn-accent mt-1">
                <Plus size={16} strokeWidth={2.6} />
                Novo Projeto
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lista.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onArchive={archiveProject}
                  onDelete={deleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
