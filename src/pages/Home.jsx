import { Link } from "react-router-dom";
import { ArrowRight, FileWarning, GitBranch, Sigma, ShieldCheck, Repeat, Workflow, Check } from "lucide-react";
import { statusMeta, statusOrder } from "../data/mockProjects";
import StatusBadge from "../components/StatusBadge";
import DemandGauge from "../components/DemandGauge";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import TiltCard from "../components/TiltCard";
import Palavras from "../components/Palavras";
import Simulador from "../components/Simulador";
import BrandMark from "../components/BrandMark";
import { useInView } from "../hooks/useScroll";

const causas = [
  { icon: FileWarning, titulo: "Critérios complexos", texto: "Várias tabelas normativas e fatores de demanda mudam conforme o tipo de unidade consumidora." },
  { icon: GitBranch, titulo: "Processo manual", texto: "Sem uma ferramenta oficial, cada analista aplica as regras à sua maneira e chega a resultados diferentes." },
  { icon: Sigma, titulo: "Sem padronização", texto: "Acima de 50 kVA, cada cálculo pode virar uma nova rodada de revisão, retrabalho e inconsistência." },
];

const pilares = [
  { icon: Repeat, titulo: "Motor determinístico", texto: "As mesmas entradas sempre produzem a mesma demanda calculada." },
  { icon: ShieldCheck, titulo: "Cálculo auditável", texto: "Cada resultado guarda o caminho normativo percorrido, pronto para revisão." },
  { icon: Workflow, titulo: "Integrado ao fluxo real", texto: "O status do projeto reflete exatamente onde ele está no processo." },
];

const indicadores = [
  { to: 50, suffix: " kVA", rotulo: "Limite de aplicação" },
  { to: 5, rotulo: "Status de acompanhamento" },
  { to: 100, suffix: "%", rotulo: "Resultado reproduzível" },
  { to: 1, rotulo: "Motor de cálculo único" },
];

const Titulo = ({ eyebrow, children, texto }) => (
  <Reveal className="mb-11 max-w-xl">
    <p className="eyebrow inline-flex items-center gap-2.5 text-accent">
      <span className="h-px w-6 bg-accent" />
      {eyebrow}
    </p>
    <h2 className="mt-3 font-display text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[38px]">{children}</h2>
    {texto && <p className="mt-3.5 text-[15px] leading-relaxed text-ink-soft">{texto}</p>}
  </Reveal>
);

function Linha() {
  const [ref, visto] = useInView(0.4);
  return (
    <div ref={ref} className={`tl relative mt-6 grid gap-5 sm:grid-cols-5 ${visto ? "in" : ""}`}>
      <div className="absolute left-[10%] right-[10%] top-[19px] hidden h-[3px] rounded bg-line sm:block" />
      <div className="tl-line absolute left-[10%] top-[19px] hidden h-[3px] rounded bg-gradient-to-r from-ok to-accent sm:block" />
      {statusOrder.map((chave, i) => (
        <div key={chave} className="relative flex items-center gap-3 sm:flex-col sm:text-center" style={{ "--i": i }}>
          <span className="tl-dot flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-line bg-white font-mono text-[13px] font-bold text-ink-soft">
            {i + 1}
          </span>
          <span className="text-[13px] font-semibold text-ink">{statusMeta[chave].label}</span>
        </div>
      ))}
    </div>
  );
}

function FolhaPdf() {
  const agora = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-pop transition-transform duration-500 hover:rotate-0 hover:scale-[1.02] sm:-rotate-2">
      <div className="flex items-center gap-2.5 border-b-[3px] border-accent bg-brand-800 px-4 py-3.5">
        <BrandMark size={28} />
        <span className="font-display text-[14px] font-extrabold text-white">NeoDemanda · Memorial</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-[#F5F8F6] p-3 text-[9px]">
          {[["PROJETISTA", "Artur Rocha"], ["SUBMISSÃO", "08/08/2026"], ["EXPORTAÇÃO", agora]].map(([r, v]) => (
            <div key={r}>
              <span className="font-bold tracking-widest text-ink-soft">{r}</span>
              <b className="mt-0.5 block text-[11px] text-ink">{v}</b>
            </div>
          ))}
        </div>
        {[0.55, 1, 0.8, 0.9, 0.4].map((w, i) => (
          <div key={i} className="sheet-line my-2.5 h-[7px] rounded bg-[#E8EDEA]" style={{ "--i": i, "--w": w }} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-950 bg-banner pb-28 pt-16 sm:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0" />
          <div className="blob absolute -right-24 -top-32 h-[460px] w-[460px] rounded-full bg-accent/25 blur-[100px]" />
          <div className="blob absolute -bottom-44 left-1/3 h-[340px] w-[340px] rounded-full bg-ok-bright/15 blur-[100px] [animation-delay:-6s]" />
        </div>

        <div className="relative mx-auto grid max-w-shell items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow fade-in inline-flex items-center gap-2.5 text-accent [--d:.1s]">
              <span className="h-px w-6 bg-accent" />
              Neoenergia Pernambuco
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-[38px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[56px]">
              <Palavras>Cálculo de demanda elétrica com um</Palavras>
              <span className="text-accent">
                <Palavras start={6}>resultado só.</Palavras>
              </span>
            </h1>
            <p className="fade-in mt-5 max-w-lg text-[16px] leading-relaxed text-white/60 [--d:1s]">
              Padronização, rastreabilidade e consistência para projetos acima de 50 kVA, do rascunho à submissão.
            </p>
            <div className="fade-in mt-9 flex flex-wrap items-center gap-3 [--d:1.15s]">
              <Link to="/dashboard" className="btn-accent">
                Abrir dashboard
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
              <Link
                to="/novo-projeto"
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-[11px] text-sm font-semibold text-white/85 transition-colors hover:border-white/50 hover:bg-white/5 hover:text-white"
              >
                Cadastrar projeto
              </Link>
            </div>
          </div>

          {/* Cartão flutuante */}
          <div className="fade-in relative hidden lg:block [--d:.7s]" aria-hidden="true">
            <div className="float absolute -top-9 right-6 z-10 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-[12px] font-semibold text-ink shadow-card [animation-delay:-3.5s]">
              <span className="ping h-2 w-2 rounded-full bg-ok" />
              Validado pelo motor
            </div>
            <div className="float rounded-[20px] bg-white p-5 shadow-pop">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[15px] font-bold text-ink">Condomínio Solar das Américas</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-faint">Av. das Américas, 3500</p>
                </div>
                <StatusBadge status="validado" />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F6F9F7] px-4 py-3.5">
                <DemandGauge pct={0.58} color="#16A34A" size={84} />
                <div className="text-right">
                  <span className="font-mono text-[32px] font-bold leading-none text-ok">
                    <CountUp to={87.4} decimals={1} />
                  </span>
                  <p className="mt-1 text-[12px] text-ink-faint">/ 150 kVA</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[12px] text-ink-soft">
                <span className="font-medium">Artur Rocha · Projetista</span>
                <span className="rounded-md bg-brand-800 px-2 py-1 text-[11px] font-bold text-white">PDF</span>
              </div>
            </div>
            <div className="float absolute -bottom-7 -left-8 rounded-2xl bg-white px-3.5 py-2.5 text-[12px] font-semibold text-ink shadow-card [animation-delay:-2s]">
              ⚡ 58% de utilização
            </div>
          </div>
        </div>
      </section>

      {/* INDICADORES sobrepostos ao hero */}
      <div className="relative z-10 mx-auto -mt-14 grid max-w-shell grid-cols-2 gap-4 px-5 sm:px-8 lg:grid-cols-4">
        {indicadores.map((it, i) => (
          <Reveal key={it.rotulo} delay={i} className="card p-5 sm:p-6">
            <b className="block font-display text-[30px] font-extrabold leading-none tracking-tight text-ink sm:text-[38px]">
              <CountUp to={it.to} suffix={it.suffix} />
            </b>
            <span className="eyebrow mt-2.5 block !text-[10px] text-ink-soft">{it.rotulo}</span>
          </Reveal>
        ))}
      </div>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-shell px-5 py-20 sm:px-8 sm:py-24">
        <Titulo eyebrow="O problema" texto="Está na ausência de uma ferramenta que aplique os critérios normativos de forma sistêmica.">
          A causa raiz não está nas pessoas
        </Titulo>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {causas.map((c, i) => (
            <Reveal key={c.titulo} delay={i}>
              <TiltCard className="h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                  <c.icon size={20} strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-[17px] font-bold text-ink">{c.titulo}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{c.texto}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-shell px-5 py-20 sm:px-8 sm:py-24">
          <Titulo eyebrow="A solução" texto="Passe o mouse nos cartões: a luz acompanha o cursor e o cartão inclina em 3D.">
            Um motor, três garantias
          </Titulo>
          <div className="grid gap-4 lg:grid-cols-3">
            {pilares.map((p, i) => (
              <Reveal key={p.titulo} delay={i}>
                <TiltCard className="h-full p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ok-soft text-ok">
                    <p.icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-bold text-ink">{p.titulo}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{p.texto}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAIXA DE STATUS */}
      <div
        className="marquee overflow-hidden border-b border-line bg-white py-4"
        style={{ maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}
      >
        <div className="marquee-track flex w-max gap-3.5" aria-hidden="true">
          {Array.from({ length: 4 }).flatMap((_, r) => statusOrder.map((k) => <StatusBadge key={`${r}-${k}`} status={k} />))}
        </div>
      </div>

      {/* SIMULADOR */}
      <section className="mx-auto max-w-shell px-5 py-20 sm:px-8 sm:py-24">
        <Titulo eyebrow="Interativo" texto="O medidor fica verde até 80%, laranja daí para cima e vermelho quando passa do contratado.">
          Mexa nos valores e veja a utilização
        </Titulo>
        <Reveal>
          <Simulador />
        </Reveal>
      </section>

      {/* CICLO DE VIDA */}
      <section className="mx-auto max-w-shell px-5 pb-20 sm:px-8 sm:pb-24">
        <Titulo eyebrow="Ciclo de vida do projeto">Do rascunho à submissão</Titulo>
        <Linha />
      </section>

      {/* PDF */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-shell items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
          <Reveal>
            <FolhaPdf />
          </Reveal>
          <Reveal delay={1}>
            <p className="eyebrow inline-flex items-center gap-2.5 text-accent">
              <span className="h-px w-6 bg-accent" />
              Memorial em PDF
            </p>
            <h2 className="mt-3 font-display text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[38px]">
              Rastreável em cada página
            </h2>
            <ul className="mt-7 space-y-3.5">
              {["Logo da Neoenergia no cabeçalho", "Nome do projetista", "Data de submissão", "Data e hora da exportação"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px] text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ok-soft text-ok">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-shell px-5 py-20 sm:px-8">
        <Reveal className="card flex flex-wrap items-center justify-between gap-5 p-7 sm:p-9">
          <div>
            <h3 className="font-display text-[21px] font-extrabold tracking-tight text-ink">Veja os projetos em andamento</h3>
            <p className="mt-1.5 text-[14px] text-ink-soft">Demanda, status e utilização em uma única visão.</p>
          </div>
          <Link to="/dashboard" className="btn-accent">
            Ir para o dashboard
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
