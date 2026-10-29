import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="bg-brand-950">
      <div className="h-[3px] bg-gradient-to-r from-ok via-[#00AEEF] to-accent" />
      <div className="mx-auto flex max-w-shell flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3.5">
          <BrandMark size={34} />
          <div>
            <p className="font-display text-[14px] font-bold text-white">
              Neo<span className="text-accent">Demanda</span>
            </p>
            <p className="text-[12px] text-white/45">
              Padronização para projetos elétricos acima de 50 kVA
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[12px] text-white/50">Neoenergia Pernambuco · CESAR School</p>
          <p className="mt-0.5 font-mono text-[11px] text-white/30">Grupo 2 · Projeto 3</p>
        </div>
      </div>
    </footer>
  );
}
