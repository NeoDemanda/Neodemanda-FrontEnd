import { statusMeta } from "../data/mockProjects";

const tones = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  slate: "bg-line/70 text-ink-soft",
};

export default function StatusBadge({ status }) {
  const meta = statusMeta[status] ?? statusMeta.rascunho;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        tones[meta.tone]
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}
