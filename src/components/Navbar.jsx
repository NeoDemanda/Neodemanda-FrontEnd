import { NavLink, Link } from "react-router-dom";
import { Zap, LayoutGrid, Archive } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";

// Usuário da demonstração — sai daqui quando existir autenticação de verdade.
const usuario = { nome: "Artur Rocha", cargo: "Projetista Sênior", iniciais: "AR" };

function Aba({ to, icon: Icon, children, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
          isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white/90",
        ].join(" ")
      }
    >
      <Icon size={15} strokeWidth={2.2} />
      <span className="hidden sm:inline">{children}</span>
      {badge > 0 && (
        <span className="rounded bg-white/15 px-1.5 py-px font-mono text-[10px] leading-4 text-white/80">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { arquivados } = useProjects();

  return (
    <header className="sticky top-0 z-50 bg-brand-800">
      <div className="mx-auto flex h-14 max-w-shell items-center gap-2 px-5 sm:px-8">
        <Link to="/" className="mr-2 flex shrink-0 items-center gap-2.5 sm:mr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <Zap size={15} className="fill-white text-white" strokeWidth={2} />
          </span>
          <span className="whitespace-nowrap font-display text-[15px] font-extrabold tracking-tight text-white">
            Neo Demanda
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Aba to="/dashboard" icon={LayoutGrid}>
            Dashboard
          </Aba>
          <Aba to="/arquivados" icon={Archive} badge={arquivados.length}>
            Arquivados
          </Aba>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-[13px] font-semibold text-white">{usuario.nome}</p>
            <p className="text-[11px] text-white/55">{usuario.cargo}</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ok-bright font-display text-[11px] font-bold text-brand-900">
            {usuario.iniciais}
          </span>
        </div>
      </div>
    </header>
  );
}
