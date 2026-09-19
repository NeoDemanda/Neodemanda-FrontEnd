export default function CircuitField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-[48%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,130,124,.24)_0%,rgba(0,55,52,.08)_38%,transparent_70%)] blur-2xl" />
      <div className="absolute left-1/2 top-[57%] h-[390px] w-[390px] -translate-x-1/2 rounded-full border border-liquid-mist/10" />
      <div className="absolute left-1/2 top-[57%] h-[330px] w-[330px] -translate-x-1/2 rounded-full border border-liquid-mist/10" />
      <div className="absolute left-[12%] top-[26%] h-px w-28 bg-liquid-mist/10" />
      <div className="absolute right-[12%] top-[32%] h-px w-36 bg-liquid-mist/10" />
      <div className="absolute left-[12%] top-[26%] h-2 w-2 rounded-full bg-liquid-mist/50" />
      <div className="absolute right-[12%] top-[32%] h-2 w-2 rounded-full bg-lavender-phosphor" />
    </div>
  );
}
