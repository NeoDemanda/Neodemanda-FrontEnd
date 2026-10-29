import { useEffect, useState } from "react";
import { useInView } from "../hooks/useScroll";

const reduzir = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Número que conta de 0 até `to` quando aparece na tela. */
export default function CountUp({ to, decimals = 0, suffix = "", duration = 1400 }) {
  const [ref, visto] = useInView(0.3);
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!visto) return;
    if (reduzir()) return setValor(to);
    let raf;
    const t0 = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      setValor(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [visto, to, duration]);

  return (
    <span ref={ref}>
      {valor.toFixed(decimals).replace(".", ",")}
      {suffix}
    </span>
  );
}
