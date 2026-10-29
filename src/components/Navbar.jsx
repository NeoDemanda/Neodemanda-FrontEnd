import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutGrid, Archive, LogIn, LogOut, Plus, Sun, Moon } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import { useAuth } from "../store/AuthContext";
import BrandMark from "./BrandMark";
import { useScroll } from "../hooks/useScroll";
import { useEffect, useState } from "react";

function Aba({ to, icon: Icon, children, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
          isActive
            ? "bg-white/[0.14] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]"
            : "text-white/60 hover:bg-white/[0.07] hover:text-white",
        ].join(" ")
      }
    >
      <Icon size={15} strokeWidth={2.2} />
      <span className="hidden sm:inline">{children}</span>
      {badge > 0 && (
        <span className="rounded-full bg-accent px-1.5 font-mono text-[10px] font-bold leading-[18px] text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { arquivados } = useProjects();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { progress, scrolled } = useScroll();
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" && (
      localStorage.getItem("neodemanda-theme") === "dark" ||
      (!localStorage.getItem("neodemanda-theme") && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
    )
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("neodemanda-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-900/95 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-[3px] w-full origin-left bg-gradient-to-r from-ok via-[#00AEEF] to-accent"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div
        className={`mx-auto flex max-w-shell items-center gap-3 px-5 transition-[height] duration-300 sm:px-8 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link to="/" className="mr-1 flex shrink-0 items-center gap-3 sm:mr-4">
          <BrandMark size={36} />
          <span className="leading-none">
            <span className="block whitespace-nowrap font-display text-[16px] font-extrabold tracking-tight text-white">
              Neo<span className="text-accent">Demanda</span>
            </span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.14em] text-white/45 sm:block">
              Neoenergia Pernambuco
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Aba to="/dashboard" icon={LayoutGrid}>
            Dashboard
          </Aba>
          <Aba to="/arquivados" icon={Archive} badge={arquivados.length}>
            Arquivados
          </Aba>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            title={dark ? "Ativar tema claro" : "Ativar modo escuro"}
            aria-label={dark ? "Ativar tema claro" : "Ativar modo escuro"}
            aria-pressed={dark}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {usuario ? (
            <>
              <Link
                to="/novo-projeto"
                className="hidden items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#e58207] md:inline-flex"
              >
                <Plus size={14} strokeWidth={2.8} />
                Novo projeto
              </Link>
              <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] py-1 pl-1 pr-1 sm:pr-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ok-bright font-display text-[11px] font-bold text-brand-900">
                  {usuario.iniciais}
                </span>
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-[12.5px] font-semibold text-white">{usuario.nome}</p>
                  <p className="text-[10.5px] text-white/50">{usuario.cargo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                title="Sair"
                aria-label="Sair"
                className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(247,148,29,.9)] transition-all hover:bg-[#e58207] hover:shadow-[0_10px_24px_-10px_rgba(247,148,29,1)]"
            >
              <LogIn size={15} strokeWidth={2.4} />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
