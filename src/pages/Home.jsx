import { Link } from "react-router-dom";
import { ArrowRight, FileWarning, GitBranch, Sigma, ShieldCheck, Repeat, Workflow } from "lucide-react";
import { statusMeta, statusOrder } from "../data/mockProjects";
import StatusBadge from "../components/StatusBadge";

const causas = [
  {
    icon: FileWarning,
    titulo: "Critérios complexos",
    texto:
      "Várias tabelas normativas e fatores de demanda mudam conforme o tipo de unidade consumidora.",
  },
  {
    icon: GitBranch,
    titulo: "Processo manual",
    texto:
      "Sem uma ferramenta oficial, cada analista aplica as regras à sua maneira e chega a resultados diferentes.",
  },
  {
    icon: Sigma,
    titulo: "Sem padronização",
    texto:
      "Acima de 50 kVA, cada cálculo pode virar uma nova rodada de revisão, retrabalho e inconsistência.",
  },
];

const pilares = [
  {
    icon: Repeat,
    titulo: "Motor determinístico",
    texto: "As mesmas entradas sempre produzem a mesma demanda calculada.",
  },
  {
    icon: ShieldCheck,
    titulo: "Cálculo auditável",
    texto: "Cada resultado guarda o caminho normativo percorrido, pronto para revisão.",
  },
  {
    icon: Workflow,
    titulo: "Integrado ao fluxo real",
    texto: "O status do projeto reflete exatamente onde ele está no processo.",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-brand-950 bg-banner">
        <div className="mx-auto max-w-shell px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow text-white/45">Neo Demanda · Neoenergia Pernambuco</p>
          <h1 className="mt-3 max-w-2xl font-display text-[36px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[48px]">
            Cálculo de demanda elétrica com um resultado só.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
            Padronização, rastreabilidade e consistência para projetos acima de 50 kVA — do
            rascunho à submissão.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/dashboard" className="btn-accent">
              Abrir dashboard
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
            <Link
              to="/novo-projeto"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-[11px] text-sm font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white"
            >
              Cadastrar projeto
            </Link>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 border-t border-white/10">
            {[
              ["50 kVA", "Limite de aplicação"],
              ["5", "Status de acompanhamento"],
              ["1", "Resultado por entrada"],
            ].map(([valor, rotulo], i) => (
              <div
                key={rotulo}
                className={`border-white/10 pb-1 pt-5 ${i > 0 ? "border-l px-5" : "pr-5"}`}
              >
                <dd className="font-display text-[26px] font-extrabold leading-none text-white">
                  {valor}
                </dd>
                <dt className="eyebrow mt-2.5 text-white/45">{rotulo}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-xl">
          <p className="eyebrow text-ink-faint">O problema</p>
          <h2 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[30px]">
            A causa raiz não está nas pessoas
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Está na ausência de uma ferramenta que aplique os critérios normativos de forma
            sistêmica.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {causas.map((causa) => (
            <article key={causa.titulo} className="card p-6">
              <causa.icon size={20} className="text-accent" strokeWidth={2} />
              <h3 className="mt-4 font-display text-[16px] font-bold text-ink">{causa.titulo}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{causa.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-shell gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div>
            <p className="eyebrow text-ink-faint">A solução</p>
            <h2 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[30px]">
              Um motor de cálculo único
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Uma lógica só transforma as entradas normativas em resultados consistentes e
              auditáveis por toda a equipe.
            </p>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {pilares.map((pilar) => (
              <li key={pilar.titulo} className="flex gap-4 py-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ok-soft text-ok">
                  <pilar.icon size={18} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">{pilar.titulo}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{pilar.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow text-ink-faint">Ciclo de vida do projeto</p>
        <h2 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[30px]">
          Do rascunho à submissão
        </h2>
        <ol className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-4">
          {statusOrder.map((chave, i) => (
            <li key={chave} className="flex items-center gap-3">
              <StatusBadge status={chave} />
              {i < statusOrder.length - 1 && <ArrowRight size={14} className="text-ink-faint" />}
              <span className="sr-only">{statusMeta[chave].label}</span>
            </li>
          ))}
        </ol>

        <div className="card mt-10 flex flex-wrap items-center justify-between gap-5 p-7">
          <div>
            <h3 className="font-display text-[19px] font-extrabold tracking-tight text-ink">
              Veja os projetos em andamento
            </h3>
            <p className="mt-1.5 text-[14px] text-ink-soft">
              Demanda, status e utilização em uma única visão.
            </p>
          </div>
          <Link to="/dashboard" className="btn-accent">
            Ir para o dashboard
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>
      </section>
    </>
  );
}
