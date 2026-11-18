import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, MessageSquareText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useProjects } from "../store/ProjectsContext";
import { mensagemErro } from "../lib/api";

const fmt = (value) => value == null ? "—" : Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export default function ProjectReviewModal({ project, onClose, onEvaluated }) {
  const { getCalculation, loadEvaluations, evaluateProject } = useProjects();
  const [calculation, setCalculation] = useState(null);
  const [history, setHistory] = useState([]);
  const [parecer, setParecer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCalculation(project.id), loadEvaluations(project.id)])
      .then(([calc, evaluations]) => { if (active) { setCalculation(calc); setHistory(evaluations); } })
      .catch((err) => { if (active) setError(mensagemErro(err)); });
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { active = false; document.removeEventListener("keydown", onKey); document.body.style.overflow = previous; };
  }, [project.id, getCalculation, loadEvaluations, onClose]);

  async function decidir(decisao) {
    setError(""); setBusy(true);
    try { await evaluateProject(project.id, decisao, parecer); onEvaluated?.(); }
    catch (err) { setError(mensagemErro(err)); }
    finally { setBusy(false); }
  }

  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-labelledby="revisao-titulo" className="card flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none shadow-pop sm:rounded-b-[14px]">
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5"><div><div className="flex flex-wrap items-center gap-2"><h2 id="revisao-titulo" className="font-display text-xl font-bold">{project.nome}</h2><StatusBadge status={project.status} papel="analista"/></div><p className="mt-1 text-sm text-ink-faint">{project.responsavelTecnico || project.projetista} · CREA {project.creaResponsavel || "não informado"}</p></div><button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-ink-faint hover:bg-line"><X size={18}/></button></header>
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-lg bg-page p-3"><p className="text-xs text-ink-faint">Edificação</p><p className="font-semibold">{project.tipoEdificacao}</p></div><div className="rounded-lg bg-page p-3"><p className="text-xs text-ink-faint">Unidades consumidoras</p><p className="font-semibold">{project.unidades}</p></div><div className="rounded-lg bg-page p-3"><p className="text-xs text-ink-faint">Carga instalada</p><p className="font-semibold">{fmt(project.demandaContratada)} kVA</p></div></div>
        <section><h3 className="font-display font-bold">Resultado calculado pelo backend</h3>{calculation ? <><p className="mt-2 font-mono text-3xl font-bold text-brand-800">{fmt(calculation.resultado?.dproj)} kVA</p><div className="mt-3 divide-y divide-line rounded-lg border border-line">{(calculation.memorial || []).map((step) => <div key={`${step.ordem}-${step.idRegra}`} className="p-3"><p className="text-sm font-semibold">{step.ordem}. {step.descricao}</p><p className="mt-1 text-xs text-ink-soft">{step.formulaAplicada || step.formulaSimbolica}</p><p className="mt-1 text-xs">{step.resultadoTexto || `${fmt(step.valor)} ${step.unidade || ""}`}</p></div>)}</div></> : <p className="mt-2 text-sm text-ink-soft">{error || "Carregando memorial..."}</p>}</section>
        <section><h3 className="font-display font-bold">Histórico de avaliações</h3>{history.length ? <ul className="mt-2 space-y-2">{history.map((item, index) => <li key={`${item.avaliadoEm}-${index}`} className="rounded-lg bg-page p-3 text-sm"><strong>{item.decisao}</strong> · {item.avaliadoEm ? new Date(item.avaliadoEm).toLocaleString("pt-BR") : ""}<p className="text-ink-soft">{item.parecer || "Sem parecer"}</p></li>)}</ul> : <p className="mt-2 text-sm text-ink-soft">Nenhuma avaliação anterior.</p>}</section>
        {project.status === "em_analise" && <div><label htmlFor="parecer" className="field-label">Parecer (obrigatório para correção ou reprovação)</label><textarea id="parecer" rows={3} maxLength={2000} className="field" value={parecer} onChange={(e) => setParecer(e.target.value)} placeholder="Descreva a decisão técnica..." /></div>}
        {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-bad-soft p-3 text-sm text-bad">{error}</p>}
      </div>
      {project.status === "em_analise" && <footer className="flex flex-wrap justify-end gap-2 border-t border-line bg-[#FAFCFB] px-6 py-4"><button disabled={busy || !parecer.trim()} onClick={() => decidir("REPROVADO")} className="inline-flex items-center gap-2 rounded-lg border border-bad/30 px-3 py-2 text-sm font-semibold text-bad disabled:opacity-50"><XCircle size={15}/> Reprovar</button><button disabled={busy || !parecer.trim()} onClick={() => decidir("EM_CORRECAO")} className="inline-flex items-center gap-2 rounded-lg border border-warn/30 px-3 py-2 text-sm font-semibold text-warn disabled:opacity-50"><MessageSquareText size={15}/> Solicitar correção</button><button disabled={busy} onClick={() => decidir("APROVADO")} className="inline-flex items-center gap-2 rounded-lg bg-ok px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={15}/> Aprovar</button></footer>}
    </div>
  </div>;
}
