import { Archive, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import DemandGauge from "./DemandGauge";
import { ligacaoMeta } from "../data/mockProjects";

const siglaTone = { ok: "bg-ok-soft text-ok", info: "bg-info-soft text-info" };

const dataBR = (iso) => {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

export default function ProjectCard({ project, onArchive, onDelete }) {
  const calculado = typeof project.demandaCalculada === "number";
  const pct = calculado ? project.demandaCalculada / project.demandaContratada : 0;
  // Verde até 80% da demanda contratada; laranja daí para cima.
  const alerta = pct >= 0.8;
  const cor = alerta ? "#E5861A" : "#16A34A";
  const ligacao = ligacaoMeta[project.tipoLigacao] ?? ligacaoMeta.monofasico;

  return (
    <article className="card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-cardHover">
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink">
              {project.nome}
            </h3>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-faint">{project.endereco}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <DemandGauge pct={pct} color={calculado ? cor : "#E8EDEA"} />
          <div className="text-right">
            <span
              className="font-mono text-[28px] font-bold leading-none tracking-tight"
              style={{ color: calculado ? cor : "#C3CEC7" }}
            >
              {calculado ? project.demandaCalculada.toFixed(1) : "—"}
            </span>
            <p className="mt-1 text-[12px] text-ink-faint">/ {project.demandaContratada} kVA</p>
            <p
              className="mt-0.5 font-mono text-[11px]"
              style={{ color: calculado ? cor : "#94A69B" }}
            >
              {calculado ? `${Math.round(pct * 100)}% utilização` : "Não calculado"}
            </p>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line bg-[#FAFCFB] px-5 py-3">
        <div className="flex items-center gap-2 text-[12px] text-ink-faint">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${siglaTone[ligacao.tone]}`}
          >
            {ligacao.sigla}
          </span>
          <span className="font-mono">· {project.unidades} unid.</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 font-mono text-[11px] text-ink-faint">
            {dataBR(project.atualizadoEm)}
          </span>
          <button
            type="button"
            onClick={() => onArchive?.(project.id)}
            title="Arquivar projeto"
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-line/60 hover:text-ink"
          >
            <Archive size={14} />
          </button>
          {project.status === "rascunho" && (
            <button
              type="button"
              onClick={() => onDelete?.(project.id)}
              title="Excluir rascunho"
              className="rounded-md p-1.5 text-bad-bright transition-colors hover:bg-bad-soft hover:text-bad"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
