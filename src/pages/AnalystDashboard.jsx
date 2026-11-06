import { useMemo, useState } from "react";
import { WifiOff, Inbox, CalendarCheck2, UserRound, ChevronRight } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import PageBanner from "../components/PageBanner";
import StatusBadge from "../components/StatusBadge";
import DemandGauge from "../components/DemandGauge";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import ProjectReviewModal from "../components/ProjectReviewModal";

const faixa = {
  submetido: "bg-info",
  em_analise: "bg-warn",
  validado: "bg-ok",
  inconsistente: "bg-bad",
};

const abas = [
  { key: "pendentes", label: "Pendentes", status: ["submetido", "em_analise"] },
  { key: "validado", label: "Aprovados", status: ["validado"] },
  { key: "inconsistente", label: "Rejeitados", status: ["inconsistente"] },
];

const dataBR = (iso) => {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

export default function AnalystDashboard() {
  const { ativos, loading, usingMock, startReview, approveProject, rejectProject } = useProjects();
  const [filtro, setFiltro] = useState("pendentes");
  const [abertoId, setAbertoId] = useState(null);

  // Rascunhos não chegam ao analista: só o que foi submetido pelo projetista.
  const doFluxo = useMemo(
    () => ativos.filter((p) => ["submetido", "em_analise", "validado", "inconsistente"].includes(p.status)),
    [ativos]
  );

  const contagem = useMemo(
    () => ({
      submetido: doFluxo.filter((p) => p.status === "submetido").length,
      em_analise: doFluxo.filter((p) => p.status === "em_analise").length,
      validado: doFluxo.filter((p) => p.status === "validado").length,
      inconsistente: doFluxo.filter((p) => p.status === "inconsistente").length,
    }),
    [doFluxo]
  );

  const abaAtual = abas.find((a) => a.key === filtro);
  const lista = doFluxo.filter((p) => abaAtual.status.includes(p.status));
  const aberto = doFluxo.find((p) => p.id === abertoId) ?? null;

  const abrir = (projeto) => {
    // O card só passa a "Em análise" quando o analista clica nele.
    if (projeto.status === "submetido") startReview(projeto.id);
    setAbertoId(projeto.id);
  };

  const stats = [
    { label: "Novos", valor: contagem.submetido, color: "text-sky-300" },
    { label: "Em análise", valor: contagem.em_analise, color: "text-accent" },
    { label: "Aprovados", valor: contagem.validado, color: "text-ok-bright" },
    { label: "Rejeitados", valor: contagem.inconsistente, color: "text-bad-bright" },
  ];

  return (
    <>
      <PageBanner
        eyebrow="Área do analista"
        title="Dashboard"
        subtitle="Abra um projeto para conferir os cálculos e decidir se ele é aprovado."
      >
        <dl className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ label, valor, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-sm"
            >
              <dd className={`font-display text-[32px] font-extrabold leading-none ${color}`}>
                <CountUp to={valor} />
              </dd>
              <dt className="eyebrow mt-2.5 text-white/50">{label}</dt>
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
            const total = doFluxo.filter((p) => aba.status.includes(p.status)).length;
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
                  {total}
                </span>
              </button>
            );
          })}
          <span className="ml-auto font-mono text-[12px] text-ink-faint">{lista.length} projeto(s)</span>
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
              <Inbox size={26} className="text-ink-faint" />
              <p className="font-display text-[15px] font-bold text-ink">Nada por aqui</p>
              <p className="max-w-xs text-[13px] text-ink-soft">
                Projetos submetidos pelos projetistas aparecem nesta lista.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lista.map((p, i) => {
                const pct = p.demandaContratada ? p.demandaCalculada / p.demandaContratada : 0;
                const cor = pct >= 0.8 ? "#E5861A" : "#16A34A";
                return (
                  <Reveal key={p.id} delay={i % 4} className="h-full">
                    <button
                      type="button"
                      onClick={() => abrir(p)}
                      className="card group relative flex h-full w-full flex-col overflow-hidden text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <div className={`h-1 w-full ${faixa[p.status] ?? "bg-ink-faint/40"}`} />
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink">
                              {p.nome}
                            </h3>
                            <p className="mt-0.5 truncate text-[12.5px] text-ink-faint">{p.endereco}</p>
                          </div>
                          <StatusBadge status={p.status} papel="analista" />
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[#F6F9F7] px-4 py-3">
                          <DemandGauge pct={pct} color={cor} />
                          <div className="text-right">
                            <span className="font-mono text-[28px] font-bold leading-none" style={{ color: cor }}>
                              {Number(p.demandaCalculada).toFixed(1)}
                            </span>
                            <p className="mt-1 text-[12px] text-ink-faint">/ {p.demandaContratada} kVA</p>
                          </div>
                        </div>

                        <dl className="mt-4 space-y-1.5 text-[12px]">
                          <div className="flex items-center gap-2 text-ink-soft">
                            <UserRound size={13} className="shrink-0 text-ink-faint" />
                            <dt className="sr-only">Projetista</dt>
                            <dd className="truncate font-medium">{p.projetista ?? "Projetista não informado"}</dd>
                          </div>
                          <div className="flex items-center gap-2 text-ink-soft">
                            <CalendarCheck2 size={13} className="shrink-0 text-ink-faint" />
                            <dt className="text-ink-faint">Submissão</dt>
                            <dd className="font-mono font-medium">{dataBR(p.dataSubmissao)}</dd>
                          </div>
                        </dl>
                      </div>
                      <footer className="flex items-center justify-between border-t border-line bg-[#FAFCFB] px-5 py-3 text-[12.5px] font-semibold text-ink-soft group-hover:text-ink">
                        {p.status === "submetido" ? "Abrir para analisar" : "Ver cálculos"}
                        <ChevronRight size={15} />
                      </footer>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {aberto && (
        <ProjectReviewModal
          project={aberto}
          onClose={() => setAbertoId(null)}
          onApprove={(id) => {
            approveProject(id);
            setAbertoId(null);
          }}
          onReject={(id, motivo) => {
            rejectProject(id, motivo);
            setAbertoId(null);
          }}
        />
      )}
    </>
  );
}
