import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calculator, Send } from "lucide-react";
import PageBanner from "../components/PageBanner";
import { useProjects } from "../store/ProjectsContext";
import { mensagemErro } from "../lib/api";

const initial = {
  condominioSmartStudio: false,
  apartamentos: [{ areaUtilM2: "80", quantidade: "1" }],
  iluminacaoAreasComunsW: "0",
  tomadasAreasComunsW: "0",
  motores: [],
  cargaComercialKw: "0",
  condicionadoresAr: [],
  estacoesRecarga: [],
  clienteGrupoA: false,
};
const fmt = (value) => value == null ? "—" : Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export default function CalculationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, calculateProject, getCalculation, submitProject, reload } = useProjects();
  const project = projects.find((item) => String(item.id) === String(id));
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingResult, setLoadingResult] = useState(true);

  useEffect(() => {
    let active = true;
    getCalculation(id).then((data) => { if (active) setResult(data); }).catch(() => {}).finally(() => { if (active) setLoadingResult(false); });
    return () => { active = false; };
  }, [id, getCalculation]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateApartment = (index, key, value) => setForm((current) => ({ ...current, apartamentos: current.apartamentos.map((item, i) => i === index ? { ...item, [key]: value } : item) }));

  async function calcular(event) {
    event.preventDefault(); setError(""); setBusy(true);
    const payload = {
      ...form,
      apartamentos: ["RESIDENCIAL", "MISTO"].includes(project?.tipoEdificacao)
        ? form.apartamentos.filter((item) => Number(item.areaUtilM2) > 0 && Number(item.quantidade) > 0).map((item) => ({ areaUtilM2: Number(item.areaUtilM2), quantidade: Number(item.quantidade) }))
        : [],
      iluminacaoAreasComunsW: Number(form.iluminacaoAreasComunsW || 0),
      tomadasAreasComunsW: Number(form.tomadasAreasComunsW || 0),
      cargaComercialKw: Number(form.cargaComercialKw || 0),
      motores: form.motores,
      condicionadoresAr: form.condicionadoresAr,
      estacoesRecarga: form.estacoesRecarga,
    };
    try {
      const data = await calculateProject(id, payload);
      setResult(data);
    } catch (err) { setError(mensagemErro(err)); }
    finally { setBusy(false); }
  }

  async function submeter() {
    setError(""); setBusy(true);
    try { await submitProject(Number(id)); await reload(); navigate("/dashboard"); }
    catch (err) { setError(mensagemErro(err)); }
    finally { setBusy(false); }
  }

  if (!project && !projectsLoading && !loadingResult) return <div className="mx-auto max-w-3xl px-5 py-16"><div className="card p-6"><p className="font-semibold">Projeto não encontrado na lista carregada.</p><Link className="btn-ghost mt-4 inline-flex" to="/dashboard">Voltar ao dashboard</Link></div></div>;

  return <>
    <PageBanner eyebrow="Neo Demanda · Motor de cálculo" title="Cálculo de demanda" subtitle={project?.nome || `Projeto #${id}`} back={<Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white/80"><ArrowLeft size={14}/> Dashboard</Link>} />
    <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[1fr_0.9fr] sm:px-8">
      <form onSubmit={calcular} className="space-y-5">
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Entradas do cálculo</h2>
          <p className="text-sm text-ink-soft">Tipo de edificação, unidades consumidoras e carga instalada já vêm do cadastro do projeto. Informe os demais parâmetros exigidos pelo motor normativo.</p>
          {form.apartamentos.map((item, index) => <div key={index} className="grid grid-cols-2 gap-3"><div><label className="field-label">Área útil (m²)</label><input className="field" type="number" min="0.01" step="0.01" value={item.areaUtilM2} onChange={(e) => updateApartment(index, "areaUtilM2", e.target.value)} /></div><div><label className="field-label">Quantidade</label><input className="field" type="number" min="1" step="1" value={item.quantidade} onChange={(e) => updateApartment(index, "quantidade", e.target.value)} /></div></div>)}
          <button type="button" className="btn-ghost" onClick={() => update("apartamentos", [...form.apartamentos, { areaUtilM2: "", quantidade: "1" }])}>Adicionar faixa de apartamentos</button>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="field-label">Motor (CV), opcional</label><input className="field" type="number" min="0" step="0.01" placeholder="Potência em CV" value={form.motores[0]?.potenciaCv || ""} onChange={(e) => update("motores", e.target.value ? [{ potenciaCv: Number(e.target.value), quantidade: Number(form.motores[0]?.quantidade || 1) }] : [])} /></div>
            <div><label className="field-label">Quantidade de motores</label><input className="field" type="number" min="1" step="1" value={form.motores[0]?.quantidade || "1"} onChange={(e) => update("motores", form.motores.length ? [{ ...form.motores[0], quantidade: Number(e.target.value) }] : [])} /></div>
            <div><label className="field-label">Ar-condicionado (BTU/h), opcional</label><input className="field" type="number" min="0" step="1" placeholder="Potência em BTU/h" value={form.condicionadoresAr[0]?.potencia || ""} onChange={(e) => update("condicionadoresAr", e.target.value ? [{ potencia: Number(e.target.value), unidadePotencia: "BTU_H", quantidade: Number(form.condicionadoresAr[0]?.quantidade || 1) }] : [])} /></div>
            <div><label className="field-label">Quantidade de aparelhos</label><input className="field" type="number" min="1" step="1" value={form.condicionadoresAr[0]?.quantidade || "1"} onChange={(e) => update("condicionadoresAr", form.condicionadoresAr.length ? [{ ...form.condicionadoresAr[0], quantidade: Number(e.target.value) }] : [])} /></div>
            <div><label className="field-label">Estação de recarga (kW), opcional</label><input className="field" type="number" min="0" step="0.01" placeholder="Potência em kW" value={form.estacoesRecarga[0]?.potenciaKw || ""} onChange={(e) => update("estacoesRecarga", e.target.value ? [{ potenciaKw: Number(e.target.value), quantidade: Number(form.estacoesRecarga[0]?.quantidade || 1), tipoConexao: "MEDIDOR_INDIVIDUAL_APARTAMENTO" }] : [])} /></div>
            <div><label className="field-label">Quantidade de estações</label><input className="field" type="number" min="1" step="1" value={form.estacoesRecarga[0]?.quantidade || "1"} onChange={(e) => update("estacoesRecarga", form.estacoesRecarga.length ? [{ ...form.estacoesRecarga[0], quantidade: Number(e.target.value) }] : [])} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="field-label">Iluminação áreas comuns (W)</label><input className="field" type="number" min="0" step="0.01" value={form.iluminacaoAreasComunsW} onChange={(e) => update("iluminacaoAreasComunsW", e.target.value)} /></div>
            <div><label className="field-label">Tomadas áreas comuns (W)</label><input className="field" type="number" min="0" step="0.01" value={form.tomadasAreasComunsW} onChange={(e) => update("tomadasAreasComunsW", e.target.value)} /></div>
            <div><label className="field-label">Carga comercial (kW)</label><input className="field" type="number" min="0" step="0.01" value={form.cargaComercialKw} onChange={(e) => update("cargaComercialKw", e.target.value)} /></div>
            <div className="flex flex-col justify-end gap-2"><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.clienteGrupoA} onChange={(e) => update("clienteGrupoA", e.target.checked)} /> Cliente Grupo A</label><label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.condominioSmartStudio} onChange={(e) => update("condominioSmartStudio", e.target.checked)} /> Condomínio Smart Studio</label></div>
          </div>
        </section>
        {error && <p role="alert" className="whitespace-pre-line rounded-lg bg-bad-soft p-3 text-sm text-bad">{error}</p>}
        <button disabled={busy} type="submit" className="btn-accent"><Calculator size={16}/>{busy ? "Calculando..." : "Calcular no backend"}</button>
      </form>
      <aside className="space-y-5">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">Resultado do motor Java</h2>
          {!result ? <p className="mt-3 text-sm text-ink-soft">{loadingResult ? "Consultando cálculo anterior..." : "Ainda não existe cálculo salvo para este projeto."}</p> : <>
            <p className="mt-4 text-xs text-ink-faint">Demanda de projeto (Dproj)</p>
            <p className="font-mono text-4xl font-bold text-brand-800">{fmt(result.resultado?.dproj)} <span className="text-base">kVA</span></p>
            <p className="mt-2 text-xs text-ink-faint">Calculado em: {result.calculadoEm ? new Date(result.calculadoEm).toLocaleString("pt-BR") : "—"}</p>
            <div className="mt-5 space-y-2"><h3 className="font-semibold text-sm">Memorial de cálculo</h3>{(result.memorial || []).map((step) => <div key={`${step.ordem}-${step.idRegra}`} className="border-t border-line py-2"><p className="text-sm font-medium">{step.ordem}. {step.descricao}</p><p className="mt-1 text-xs text-ink-soft">{step.formulaAplicada || step.formulaSimbolica}</p><p className="mt-1 text-xs font-semibold">{step.resultadoTexto || `${fmt(step.valor)} ${step.unidade || ""}`}</p></div>)}</div>
            <button type="button" disabled={busy || !["rascunho", "em_correcao"].includes(project?.status)} onClick={submeter} className="btn-accent mt-5 w-full"><Send size={15}/>Enviar para análise</button>
          </>}
        </section>
      </aside>
    </div>
  </>;
}
