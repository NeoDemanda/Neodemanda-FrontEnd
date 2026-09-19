// Arco de 270° aberto na base, usado para mostrar a utilização da demanda
// contratada. `pct` vai de 0 a 1 (valores acima de 1 saturam o arco).
const R = 34;
const CX = 50;
const CY = 50;

const ponto = (grau) => {
  const rad = (grau * Math.PI) / 180;
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
};

const [x0, y0] = ponto(135);
const [x1, y1] = ponto(45);
const ARCO = `M ${x0} ${y0} A ${R} ${R} 0 1 1 ${x1} ${y1}`;

export default function DemandGauge({ pct = 0, color = "#16A34A", size = 72 }) {
  const preenchido = Math.max(0, Math.min(pct, 1));

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d={ARCO} fill="none" stroke="#E8EDEA" strokeWidth="8" strokeLinecap="round" />
      {preenchido > 0 && (
        <path
          d={ARCO}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - preenchido * 100}
        />
      )}
    </svg>
  );
}
