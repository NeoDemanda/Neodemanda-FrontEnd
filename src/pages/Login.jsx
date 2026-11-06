import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileText,
  Repeat,
  Info,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "../store/AuthContext";
import BrandMark from "../components/BrandMark";

const destaques = [
  { icon: Repeat, texto: "Motor de cálculo determinístico" },
  { icon: ShieldCheck, texto: "Resultado auditável, pronto para revisão" },
  { icon: FileText, texto: "Memorial em PDF com projetista e datas" },
];

function mensagemDoErro(error) {
  const status = error?.response?.status;
  const dados = error?.response?.data;

  if (!error?.response) {
    return "Não foi possível conectar ao servidor. Confira se o backend está em execução.";
  }
  if (status === 401) return "E-mail ou senha inválidos.";
  if (status === 400) {
    return dados?.fields?.email || dados?.fields?.senha || dados?.message ||
      "Confira o e-mail e a senha informados.";
  }
  return dados?.message || "Ocorreu um erro ao entrar. Tente novamente.";
}

export default function Login() {
  const { autenticar, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event) {
    event.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Informe seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);
    try {
      await autenticar({ email, senha });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErro(mensagemDoErro(error));
    } finally {
      setCarregando(false);
    }
  }

  function entrarDemo() {
    loginDemo({ nome: "Artur Rocha", cargo: "Projetista Sênior" });
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
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
            Entre com o e-mail e a senha cadastrados no NeoDemanda.
          </p>

          <form onSubmit={entrar} className="card mt-7 p-6" noValidate>
            <label className="field-label" htmlFor="email">
              E-mail <span className="text-accent">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="field"
              placeholder="seu.email@exemplo.com"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              disabled={carregando}
              onChange={(event) => {
                setEmail(event.target.value);
                setErro("");
              }}
            />

            <label className="field-label mt-4" htmlFor="senha">
              Senha <span className="text-accent">*</span>
            </label>
            <input
              id="senha"
              type="password"
              className="field"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
              value={senha}
              disabled={carregando}
              onChange={(event) => {
                setSenha(event.target.value);
                setErro("");
              }}
            />

            {erro && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-bad">
                {erro}
              </p>
            )}

            <button type="submit" disabled={carregando} className="btn-accent mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
              {carregando ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={16} strokeWidth={2.4} />
                </>
              )}
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-faint">
              <span className="h-px flex-1 bg-line" />
              ou
              <span className="h-px flex-1 bg-line" />
            </div>

            <button type="button" onClick={entrarDemo} disabled={carregando} className="btn-ghost w-full justify-center disabled:opacity-60">
              Acessar conta de demonstração
            </button>
          </form>

          <p className="mt-5 flex items-start gap-2 rounded-lg bg-info-soft px-3.5 py-3 text-[12px] leading-relaxed text-info">
            <Info size={14} className="mt-px shrink-0" />
            O acesso principal valida suas credenciais na API Java. A conta de demonstração não consulta o backend.
          </p>
        </div>
      </main>
    </div>
  );
}
