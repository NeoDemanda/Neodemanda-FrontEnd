/** Card que inclina em 3D e ganha um brilho laranja que segue o cursor. */
export default function TiltCard({ className = "", children }) {
  const mover = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
  };
  const sair = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <article onPointerMove={mover} onPointerLeave={sair} className={`card tilt ${className}`}>
      {children}
    </article>
  );
}
