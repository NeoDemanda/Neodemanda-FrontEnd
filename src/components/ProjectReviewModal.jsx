import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, ShieldAlert, Check, Zap } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { ligacaoMeta } from "../data/mockProjects";
import { montarMemorial } from "../services/memorial";

const fmt = (v, d = 1) =>
  Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * Detalhe de um projeto para o analista: cálculos feitos pelo projetista,
 * verificações e as ações de aprovar ou rejeitar.
 */
export default function ProjectReviewModal({ project, onClose, onApprove, onReject }) {
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const memorial = montarMemorial(project);
  const ligacao = ligacaoMeta[project.tipoLigacao] ?? ligacaoMeta.monofasico;
  const decidido = project.status === "validado" || project.status === "inconsistente";

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revisao-titulo"
        className="card flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none shadow-pop sm:rounded-b-[14px]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="revisao-titulo" className="font-display text-[19px] font-extrabold text-ink">
                {project.nome}
              </h2>
              <StatusBadge status={project.status} papel="analista" />
            </div>
            <p className="mt-1 text-[13px] text-ink-faint">{project.endereco}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-line/60 hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-4">
            {[
              ["Projetista", project.projetista ?? "Não informado"],
              ["Protocolo", project.protocolo ?? "—"],
              ["Ligação", `${ligacao.label} (${ligacao.sigla})`],
              ["Unidades", project.unidades],
            ].map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt className="text-ink-faint">{rotulo}</dt>
                <dd className="mt-0.5 font-semibold text-ink">{valor}</dd>
              </div>
            ))}
          </dl>

          {!memorial ? (
            <p className="rounded-lg bg-warn-soft px-4 py-3 text-[13px] text-warn">
              Este projeto não tem demanda calculada para revisar.
            </p>
          ) : (
            <>
              <section>
                <h3 className="font-display text-[14px] font-bold text-ink">Cálculos realizados</h3>
                <ol className="mt-3 divide-y divide-line rounded-xl border border-line">
                  {memorial.etapas.map((etapa) => (
                    <li
                      key={etapa.titulo}
                      className={`flex items-center justify-between gap-4 px-4 py-3 ${
                        etapa.destaque ? "bg-ok-soft" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink">{etapa.titulo}</p>
                        <p className="mt-0.5 font-mono text-[11.5px] text-ink-faint">{etapa.formula}</p>
                      </div>
                      <p className="shrink-0 font-mono text-[15px] font-bold text-ink">
                        {etapa.resultado}
                        {etapa.unidade && (
                          <span className="ml-1 text-[11px] font-medium text-ink-faint">{etapa.unidade}</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Demanda calculada", `${fmt(memorial.kva)} kVA`],
                  ["Demanda contratada", `${fmt(memorial.contratada, 0)} kVA`],
                  [
                    "Utilização",
                    memorial.utilizacao == null ? "—" : `${fmt(memorial.utilizacao * 100, 0)}%`,
                  ],
                ].map(([rotulo, valor]) => (
                  <div key={rotulo} className="rounded-xl bg-[#F6F9F7] px-4 py-3">
                    <p className="text-[12px] text-ink-faint">{rotulo}</p>
                    <p className="mt-1 font-mono text-[20px] font-bold text-ink">{valor}</p>
                  </div>
                ))}
              </section>

              <section>
                <h3 className="font-display text-[14px] font-bold text-ink">Verificações</h3>
                <ul className="mt-3 space-y-2">
                  {memorial.verificacoes.map((v) => (
                    <li key={v.titulo} className="flex items-start gap-2.5 text-[13px]">
                      {v.ok ? (
                        <Check size={16} className="mt-0.5 shrink-0 text-ok" strokeWidth={2.6} />
                      ) : (
                        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-bad" />
                      )}
                      <span>
                        <span className="font-semibold text-ink">{v.titulo}.</span>{" "}
                        <span className="text-ink-soft">{v.detalhe}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {project.status === "inconsistente" && project.motivoRejeicao && (
            <p className="rounded-lg bg-bad-soft px-4 py-3 text-[13px] text-bad">
              <span className="font-semibold">Motivo da rejeição:</span> {project.motivoRejeicao}
            </p>
          )}

          {rejeitando && (
            <div>
              <label htmlFor="motivo" className="field-label">
                Motivo da rejeição (opcional)
              </label>
              <textarea
                id="motivo"
                rows={3}
                className="field"
                placeholder="Explique ao projetista o que precisa ser corrigido."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-[#FAFCFB] px-6 py-4">
          {decidido && !rejeitando ? (
            <p className="mr-auto flex items-center gap-2 text-[13px] text-ink-soft">
              <Zap size={14} className="text-ink-faint" />
              Decisão já registrada. Você pode alterá-la abaixo.
            </p>
          ) : null}

          {rejeitando ? (
            <>
              <button type="button" className="btn-ghost" onClick={() => setRejeitando(false)}>
                Voltar
              </button>
              <button
                type="button"
                onClick={() => onReject(project.id, motivo)}
                className="inline-flex items-center gap-2 rounded-lg bg-bad px-4 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-red-700"
              >
                <XCircle size={16} />
                Confirmar rejeição
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRejeitando(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-bad/30 bg-white px-4 py-2.5 text-[13.5px] font-bold text-bad transition-colors hover:bg-bad-soft"
              >
                <XCircle size={16} />
                Rejeitar projeto
              </button>
              <button
                type="button"
                onClick={() => onApprove(project.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-ok px-4 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-green-700"
              >
                <CheckCircle2 size={16} />
                Aprovar projeto
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
