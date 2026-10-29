/**
 * Faixa verde que abre as telas: rótulo, título, subtítulo e, à direita,
 * uma ação opcional. `children` recebe blocos extras (ex.: indicadores).
 */
export default function PageBanner({ back, eyebrow, title, subtitle, action, children }) {
  return (
    <div className="relative overflow-hidden bg-brand-950 bg-banner">
      {/* Decoração: brilho laranja e arcos concêntricos discretos */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="blob absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-accent/20 blur-[90px]" />
        <div className="blob absolute -bottom-40 left-1/4 h-[300px] w-[300px] rounded-full bg-ok-bright/10 blur-[90px]" />
        <svg className="absolute right-0 top-0 h-full w-[520px] max-w-full opacity-[0.07]" viewBox="0 0 520 300" fill="none">
          {[60, 110, 160, 210, 260].map((r) => (
            <circle key={r} cx="470" cy="40" r={r} stroke="#fff" strokeWidth="1" />
          ))}
        </svg>
      </div>

      <div className="relative mx-auto max-w-shell px-5 py-10 sm:px-8 sm:py-12">
        {back}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow inline-flex items-center gap-2 text-accent">
              <span className="h-px w-6 bg-accent" />
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[32px] font-extrabold leading-none tracking-tight text-white sm:text-[38px]">
              {title}
            </h1>
            {subtitle && <p className="mt-3 max-w-xl text-[14.5px] text-white/60">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
