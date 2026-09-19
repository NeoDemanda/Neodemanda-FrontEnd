import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-900">
      <div className="mx-auto flex max-w-shell flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <Zap size={13} className="fill-white text-white" />
          </span>
          <div>
            <p className="font-display text-[13px] font-bold text-white">Neo Demanda</p>
            <p className="text-[12px] text-white/45">
              Padronização para projetos elétricos acima de 50 kVA
            </p>
          </div>
        </div>
        <p className="font-mono text-[11px] text-white/35">Grupo 2 · Projeto 3</p>
      </div>
    </footer>
  );
}
