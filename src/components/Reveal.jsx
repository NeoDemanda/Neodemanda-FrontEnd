import { useInView } from "../hooks/useScroll";

/** Faz o conteúdo subir e aparecer ao entrar na tela. `delay` escalona irmãos. */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const [ref, visto] = useInView();
  return (
    <Tag ref={ref} style={{ "--i": delay }} className={`rv ${visto ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
