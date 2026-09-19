import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const RADIUS = 84;
const CIRC = 2 * Math.PI * RADIUS;
const CASES = [
  { label: "Edifício misto", kva: 412.8, contracted: 500, phase: "3F" },
  { label: "Condomínio residencial", kva: 87.4, contracted: 150, phase: "3F" },
  { label: "Galpão comercial", kva: 201.5, contracted: 300, phase: "3F" },
];

export default function DemandMeter() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [phase, setPhase] = useState("calculating");
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const current = CASES[caseIndex];
  const pct = Math.min(displayValue / current.contracted, 1);
  const offset = CIRC - pct * CIRC;

  useEffect(() => {
    setPhase("calculating");
    let start = null;
    const duration = 1200;
    function tick(ts) {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setDisplayValue(current.kva * (1 - Math.pow(1 - t, 3)));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setPhase("settled");
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [caseIndex, current.kva]);

  useEffect(() => {
    if (phase !== "settled") return undefined;
    const timer = setTimeout(() => setCaseIndex((i) => (i + 1) % CASES.length), 2600);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(0,130,124,.26)_0%,transparent_68%)] blur-2xl" />
      <div className="relative flex h-[390px] w-[390px] items-center justify-center rounded-full border border-liquid-mist/10 bg-[radial-gradient(circle_at_50%_45%,rgba(0,130,124,.18),rgba(0,55,52,.04)_58%,transparent_70%)] sm:h-[440px] sm:w-[440px]">
        <svg viewBox="0 0 200 200" className="absolute h-[330px] w-[330px] -rotate-90 sm:h-[370px] sm:w-[370px]">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#707777" strokeOpacity=".24" strokeWidth="1.5" />
          <motion.circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#fde9ff" strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRC} animate={{ strokeDashoffset: offset }} transition={{ duration: .15 }} />
        </svg>
        <div className="relative flex flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[.15em] text-silver-mist">{phase === "calculating" ? "calculando" : "demanda validada"}</span>
          <span className="mt-2 text-6xl font-medium leading-none tabular-nums text-platinum sm:text-7xl">{displayValue.toFixed(1)}</span>
          <span className="mt-3 font-mono text-[11px] text-silver-mist">kVA / {current.contracted} kVA</span>
        </div>
      </div>
      <div className="mt-5 font-mono text-[10px] uppercase tracking-[.12em] text-silver-mist">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-lavender-phosphor" />{current.label} · {current.phase}
      </div>
    </div>
  );
}
