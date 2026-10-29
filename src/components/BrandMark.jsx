/** Logo da Neoenergia dentro de um chip branco (a imagem original tem fundo branco). */
export default function BrandMark({ size = 36, className = "" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,.35)] ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/assets/logo_neoenergia.png"
        alt="Neoenergia"
        className="max-w-none"
        style={{ width: size * 1.55, height: size * 1.55 }}
        draggable="false"
      />
    </span>
  );
}
