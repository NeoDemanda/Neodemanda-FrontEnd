import { useState } from "react";
import DemandGauge from "./DemandGauge";

/** Simulador de utilização: mexe nos sliders e o medidor muda de cor. */
export default function Simulador() {
  const [calc, setCalc] = useState(87);
  const [contr, setContr] = useState(150);
  const pct = calc / contr;
  const nivel =
    pct > 1
      ? { cor: "#DC2626", texto: "Inconsistente: acima do contratado", fundo: "bg-bad-soft" }
      : pct >= 0.8
      ? { cor: "#E5861A", texto: "Atenção: perto do limite", fundo: "bg-warn-soft" }
      : { cor: "#16A34A", texto: "Dentro do contratado", fundo: "bg-ok-soft" };

  return (
    <div className="card grid gap-8 p-6 sm:p-9 lg:grid-cols-2">
      <div className="flex flex-col justify-center">
        {[
          ["Demanda calculada", calc, setCalc, 5, 500, 1],
          ["Demanda contratada", contr, setContr, 10, 500, 5],
        ].map(([rotulo, valor, set, min, max, passo]) => (
          <div key={rotulo} className="mb-7">
            <label className="mb-2.5 flex justify-between text-[13px] font-semibold text-ink">
              {rotulo}
              <span className="font-mono text-accent-deep">{valor} kVA</span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={passo}
              value={valor}
              onChange={(e) => set(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-accent"
            />
          </div>
        ))}
        <p className="text-[12.5px] text-ink-soft">Fator de potência 0,92 · Ligação trifásica</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#F6F9F7] p-7">
        <DemandGauge pct={pct} color={nivel.cor} size={190} />
        <span className="font-mono text-[44px] font-bold leading-none transition-colors" style={{ color: nivel.cor }}>
          {Math.round(pct * 100)}%
        </span>
        <span className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${nivel.fundo}`} style={{ color: nivel.cor }}>
          {nivel.texto}
        </span>
      </div>
    </div>
  );
}
