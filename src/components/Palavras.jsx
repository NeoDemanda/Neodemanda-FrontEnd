import { Fragment } from "react";

/** Quebra o texto em palavras que sobem uma a uma (efeito de título do hero). */
export default function Palavras({ children, start = 0 }) {
  return String(children)
    .split(" ")
    .map((p, i) => (
      <Fragment key={i}>
        <span className="word">
          <span style={{ "--i": start + i }}>{p}</span>
        </span>{" "}
      </Fragment>
    ));
}
