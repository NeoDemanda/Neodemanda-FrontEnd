import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Info,
  ListChecks,
  Sigma,
} from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import { exportProjectPdf } from "../services/pdfExportReact";
import PageBanner from "../components/PageBanner";
import { ligacaoMeta } from "../data/mockProjects";

const numberBR = (value, digits = 1) =>
  Number(value ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const labelLigacao = (value) =>
  ligacaoMeta[value]?.label ??
  ({ monofasico: "Monofásico", bifasico: "Bifásico", trifasico: "Trifásico" }[value] || "Não informado");

function categoryFor(kva) {
  if (kva <= 10) return "Categoria T1 (Monofásico)";
  if (kva <= 22) return "Categoria T2 (Bifásico)";
  if (kva <= 75) return "Categoria T3 (Trifásico)";
  return "Subestação Dedicada (> 75 kVA)";
}

function rangeFor(kva) {
  if (kva <= 10) return "até 10 kVA";
  if (kva <= 22) return "acima de 10 até 22 kVA";
  if (kva <= 75) return "acima de 22 até 75 kVA";
  return "acima de 75 kVA";
}

export default function CalculationMemorial() {
  const { id } = useParams();
  const { projects, loading } = useProjects();
  const project = projects.find((item) => String(item.id) === String(id));

  if (loading) {
    return (
      <div className="mx-auto max-w-shell px-5 py-12 sm:px-8">
        <div className="card p-8 text-center text-sm text-ink-soft">Carregando memorial...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-shell px-5 py-12 sm:px-8">
        <div className="card p-8">
          <h1 className="font-display text-xl font-extrabold text-ink">Projeto não encontrado</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Não foi possível localizar o projeto selecionado.
          </p>
          <Link to="/dashboard" className="btn-accent mt-5">
            <ArrowLeft size={16} />
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  const kva = Number(project.demandaCalculada);
  const fp = Number(project.fatorPotencia) > 0 ? Number(project.fatorPotencia) : 0.92;
  const kw = kva * fp;
  const category = categoryFor(kva);
  const range = rangeFor(kva);

  return (
    <>
      <PageBanner
        eyebrow="Neo Demanda · Rastreabilidade"
        title="Fórmula e memorial de cálculo"
        subtitle="Resultado, regra aplicada e principais condições utilizadas no cálculo"
        back={
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        }
      />

      <main className="mx-auto max-w-shell px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-ink-faint">Projeto</p>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-ink">
              {project.nome}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">{project.endereco || "Localização não informada"}</p>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => exportProjectPdf(project)} className="btn-ghost">
              <FileText size={15} />
              Exportar PDF
            </button>
          </div>
        </div>

        <section className="mt-7 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="card overflow-hidden">
            <div className="border-b border-line bg-brand-50/60 px-6 py-4">
              <p className="eyebrow text-brand-800">Resultado numérico</p>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-[13px] text-ink-soft">Demanda calculada</p>
                  <p className="mt-1 font-mono text-[42px] font-bold leading-none tracking-tight text-brand-800">
                    {numberBR(kva)} <span className="text-[20px] font-semibold">kVA</span>
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-[#FAFCFB] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Enquadramento
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">{category}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{range}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric icon={Gauge} label="Demanda ativa equivalente" value={`${numberBR(kw)} kW`} />
                <Metric icon={Info} label="Fator de potência" value={`FP = ${fp.toFixed(2)}`} />
                <Metric icon={ClipboardList} label="Unidades consideradas" value={project.unidades ?? "—"} />
              </div>
            </div>
          </article>

          <article className="card p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ok-soft text-ok">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <p className="eyebrow text-ink-faint">Condições de entrada</p>
                <h3 className="mt-0.5 font-display text-[16px] font-bold text-ink">Dados considerados</h3>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-line">
              <Row label="Tipo de ligação" value={labelLigacao(project.tipoLigacao)} />
              <Row label="Demanda contratada" value={`${numberBR(project.demandaContratada)} kVA`} />
              <Row label="Quantidade de unidades" value={project.unidades ?? "—"} />
              <Row label="Fator de potência" value={fp.toFixed(2)} />
            </dl>
          </article>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="card p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-soft text-info">
                <Sigma size={18} />
              </span>
              <div>
                <p className="eyebrow text-ink-faint">Fórmula aplicada</p>
                <h3 className="mt-0.5 font-display text-[18px] font-bold text-ink">
                  Conversão de kW para kVA
                </h3>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-line bg-[#F7FAF8] p-5">
              <p className="font-mono text-sm font-semibold text-ink">
                Demanda (kVA) = Demanda ativa (kW) ÷ FP
              </p>
              <div className="my-4 h-px bg-line" />
              <p className="font-mono text-[15px] font-bold text-brand-800">
                {numberBR(kva)} = {numberBR(kw)} ÷ {fp.toFixed(2)}
              </p>
            </div>

            <p className="mt-4 text-[12.5px] leading-relaxed text-ink-soft">
              O valor em kVA é apresentado a partir da demanda ativa equivalente e do fator de
              potência informado para o projeto.
            </p>
          </article>

          <article className="card p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <ListChecks size={18} />
              </span>
              <div>
                <p className="eyebrow text-ink-faint">Regra de enquadramento</p>
                <h3 className="mt-0.5 font-display text-[18px] font-bold text-ink">
                  Faixa usada no resultado
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Range active={kva <= 10} title="T1 · Monofásico" text="até 10 kVA" />
              <Range active={kva > 10 && kva <= 22} title="T2 · Bifásico" text="acima de 10 até 22 kVA" />
              <Range active={kva > 22 && kva <= 75} title="T3 · Trifásico" text="acima de 22 até 75 kVA" />
              <Range active={kva > 75} title="Subestação dedicada" text="acima de 75 kVA" />
            </div>
          </article>
        </section>

        <section className="card mt-5 p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ok-soft text-ok">
              <ListChecks size={18} />
            </span>
            <div>
              <p className="eyebrow text-ink-faint">Memorial simplificado</p>
              <h3 className="mt-0.5 font-display text-[18px] font-bold text-ink">
                Principais passos e condições
              </h3>
            </div>
          </div>

          <ol className="mt-6 grid gap-3 md:grid-cols-2">
            <Step n="01" text={`Foram consideradas ${project.unidades ?? "—"} unidade(s) consumidoras no projeto.`} />
            <Step n="02" text={`A demanda consolidada do projeto resulta em ${numberBR(kva)} kVA.`} />
            <Step n="03" text={`A parcela ativa equivalente é ${numberBR(kw)} kW, calculada por kVA × FP.`} />
            <Step n="04" text={`O resultado foi enquadrado na faixa ${range}, correspondente a ${category}.`} />
          </ol>

          <div className="mt-6 flex gap-3 rounded-xl border border-info/20 bg-info-soft px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-soft">
            <Info size={16} className="mt-0.5 shrink-0 text-info" />
            <p>
              Este memorial apresenta as regras e os dados disponíveis na interface. Quando o
              backend fornecer detalhamento adicional das parcelas do cálculo, esses dados podem
              ser exibidos nesta mesma seção sem alterar o fluxo do projetista.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-[#FAFCFB] p-3.5">
      <div className="flex items-center gap-2 text-ink-faint">
        <Icon size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-mono text-[15px] font-bold text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-[12.5px] text-ink-soft">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Range({ active, title, text }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
        active ? "border-ok/30 bg-ok-soft" : "border-line bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {active ? <CheckCircle2 size={15} className="text-ok" /> : <span className="h-1.5 w-1.5 rounded-full bg-line" />}
        <span className={`text-[13px] font-semibold ${active ? "text-ok" : "text-ink"}`}>{title}</span>
      </div>
      <span className="font-mono text-[11px] text-ink-faint">{text}</span>
    </div>
  );
}

function Step({ n, text }) {
  return (
    <li className="flex gap-3 rounded-xl border border-line bg-[#FAFCFB] p-4">
      <span className="font-mono text-[11px] font-bold text-brand-800">{n}</span>
      <p className="text-[13px] leading-relaxed text-ink-soft">{text}</p>
    </li>
  );
}
