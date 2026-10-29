import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck, FileText, Repeat, Info } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import BrandMark from "../components/BrandMark";

const destaques = [
  { icon: Repeat, texto: "Motor de cálculo determinístico" },
  { icon: ShieldCheck, texto: "Resultado auditável, pronto para revisão" },
  { icon: FileText, texto: "Memorial em PDF com projetista e datas" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("Projetista");
  const [erro, setErro] = useState("");

  function entrar(e) {
    e.preventDefault();
    if (nome.trim().length < 3) {
      setErro("Informe o nome completo do projetista.");
      return;
    }
    login({ nome, cargo });
    navigate("/dashboard");
  }

  function entrarDemo() {
    login({ nome: "Artur Rocha", cargo: "Projetista Sênior" });
    navigate("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Painel institucional */}
      <aside className="relative hidden overflow-hidden bg-brand-950 bg-banner lg:block">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-ok-bright/10 blur-[100px]" />
          <svg className="absolute bottom-0 right-0 h-[420px] w-[420px] opacity-[0.06]" viewBox="0 0 420 420" fill="none">
            {[70, 130, 190, 250, 310, 370].map((r) => (
              <circle key={r} cx="420" cy="420" r={r} stroke="#fff" strokeWidth="1" />
            ))}
          </svg>
        </div>

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="flex items-center gap-3.5">
            <BrandMark size={46} />
            <span className="leading-none">
              <span className="block font-display text-[20px] font-extrabold tracking-tight text-white">
                Neo<span className="text-accent">Demanda</span>
              </span>
              <span className="mt-1.5 block text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/45">
                Neoenergia Pernambuco
              </span>
            </span>
          </Link>

          <div>
            <h2 className="max-w-md font-display text-[38px] font-extrabold leading-[1.1] tracking-tight text-white">
              Cálculo de demanda com um resultado só.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
              Padronização, rastreabilidade e consistência para projetos acima de 50 kVA, do
              rascunho à submissão.
            </p>
            <ul className="mt-9 space-y-3.5">
              {destaques.map(({ icon: Icon, texto }) => (
                <li key={texto} className="flex items-center gap-3 text-[14px] text-white/80">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-accent">
                    <Icon size={15} strokeWidth={2.2} />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[12px] text-white/35">© 2026 Neoenergia Pernambuco · Grupo 2 · Projeto 3</p>
        </div>
      </aside>

      {/* Formulário */}
      <main className="flex items-center justify-center bg-page px-5 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} />
            Voltar ao início
          </Link>

          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
              <img src="/assets/logo_neoenergia.png" alt="Neoenergia" className="h-[70px] w-[70px] max-w-none" />
            </span>
            <span className="font-display text-[18px] font-extrabold text-brand-800">
              Neo<span className="text-accent">Demanda</span>
            </span>
          </div>

          <p className="eyebrow text-accent-deep">Acesso ao portal</p>
          <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-ink">
            Entrar como projetista
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            O nome informado aparece nos PDFs exportados e nos projetos que você cadastrar.
          </p>

          <form onSubmit={entrar} className="card mt-7 p-6" noValidate>
            <label className="field-label" htmlFor="nome">
              Nome do projetista <span className="text-accent">*</span>
            </label>
            <input
              id="nome"
              className="field"
              placeholder="Ex: Artur Rocha"
              autoComplete="name"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErro("");
              }}
            />
            {erro && <p className="mt-1.5 text-[12px] text-bad">{erro}</p>}

            <label className="field-label mt-4" htmlFor="cargo">
              Cargo
            </label>
            <select id="cargo" className="field" value={cargo} onChange={(e) => setCargo(e.target.value)}>
              <option>Projetista</option>
              <option>Projetista Sênior</option>
              <option>Engenheiro Eletricista</option>
              <option>Analista Neoenergia</option>
            </select>

            <button type="submit" className="btn-accent mt-6 w-full">
              Entrar
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-faint">
              <span className="h-px flex-1 bg-line" />
              ou
              <span className="h-px flex-1 bg-line" />
            </div>

            <button type="button" onClick={entrarDemo} className="btn-ghost w-full justify-center">
              Acessar conta de demonstração
            </button>
          </form>

          <p className="mt-5 flex items-start gap-2 rounded-lg bg-info-soft px-3.5 py-3 text-[12px] leading-relaxed text-info">
            <Info size={14} className="mt-px shrink-0" />
            Modo demonstração: ainda não há validação de senha. A autenticação real será ligada à API Java.
          </p>
        </div>
      </main>
    </div>
  );
}
