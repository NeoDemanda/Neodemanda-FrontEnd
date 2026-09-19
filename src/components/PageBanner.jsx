/**
 * Faixa verde que abre todas as telas: rótulo, título, subtítulo e, à direita,
 * uma ação opcional. O bloco `stats` é usado só no dashboard.
 */
export default function PageBanner({ back, eyebrow, title, subtitle, action, children }) {
  return (
    <div className="bg-brand-950 bg-banner">
      <div className="mx-auto max-w-shell px-5 py-9 sm:px-8 sm:py-11">
        {back}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow text-white/45">{eyebrow}</p>
            <h1 className="mt-1.5 font-display text-[30px] font-extrabold leading-none tracking-tight text-white sm:text-[34px]">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
