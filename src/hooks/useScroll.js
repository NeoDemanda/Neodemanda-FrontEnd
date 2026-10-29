import { useEffect, useRef, useState } from "react";

/** Progresso de rolagem da página (0 a 1) e se já rolou além do topo. */
export function useScroll() {
  const [state, setState] = useState({ progress: 0, scrolled: false });
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({ progress: max > 0 ? window.scrollY / max : 0, scrolled: window.scrollY > 40 });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return state;
}

/** Dispara uma vez quando o elemento entra na tela. */
export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return setVisto(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visto];
}
