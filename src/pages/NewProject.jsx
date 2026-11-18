import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import PageBanner from "../components/PageBanner";
import { mensagemErro } from "../lib/api";

const inicial = {
  nomeProjeto: "",
  responsavelTecnico: "",
  creaResponsavel: "",
  quantidadeUnidadesConsumidoras: "1",
  cargaInstaladaKva: "",
  tipoEdificacao: "RESIDENCIAL",
};

export default function NewProject() {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    if (!form.nomeProjeto.trim() || !form.responsavelTecnico.trim() || !form.creaResponsavel.trim() || Number(form.quantidadeUnidadesConsumidoras) < 1 || Number(form.cargaInstaladaKva) <= 0) {
      setErro("Preencha todos os campos obrigatórios com valores válidos.");
      return;
    }
    setSaving(true);
    try {
      const projeto = await createProject(form);
      navigate(`/projetos/${projeto.id}/calculo`);
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setSaving(false);
    }
  }

  return <>
    <PageBanner eyebrow="Neo Demanda · Novo projeto" title="Cadastrar Projeto" subtitle="Os dados serão enviados ao backend e o projeto será criado como rascunho." back={<Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white/80"><ArrowLeft size={14}/> Dashboard</Link>} />
    <form onSubmit={salvar} className="mx-auto max-w-[620px] space-y-5 px-5 py-8 sm:px-8">
      <fieldset className="card space-y-4 p-6">
        <p className="eyebrow border-b border-line pb-3 text-ink-faint">Identificação do projeto</p>
        <div><label className="field-label" htmlFor="nomeProjeto">Nome do projeto *</label><input id="nomeProjeto" className="field" maxLength={150} value={form.nomeProjeto} onChange={set("nomeProjeto")} placeholder="Ex.: Edifício Solar" required /></div>
        <div><label className="field-label" htmlFor="responsavelTecnico">Responsável técnico *</label><input id="responsavelTecnico" className="field" maxLength={150} value={form.responsavelTecnico} onChange={set("responsavelTecnico")} required /></div>
        <div><label className="field-label" htmlFor="creaResponsavel">CREA do responsável *</label><input id="creaResponsavel" className="field" maxLength={30} value={form.creaResponsavel} onChange={set("creaResponsavel")} placeholder="Registro profissional" required /></div>
      </fieldset>
      <fieldset className="card space-y-4 p-6">
        <p className="eyebrow border-b border-line pb-3 text-ink-faint">Características da edificação</p>
        <div><label className="field-label" htmlFor="tipoEdificacao">Tipo de edificação *</label><select id="tipoEdificacao" className="field" value={form.tipoEdificacao} onChange={set("tipoEdificacao")}><option value="RESIDENCIAL">Residencial</option><option value="COMERCIAL">Comercial</option><option value="MISTO">Misto</option><option value="INDUSTRIAL">Industrial</option></select></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="field-label" htmlFor="quantidadeUnidadesConsumidoras">Unidades consumidoras *</label><input id="quantidadeUnidadesConsumidoras" type="number" min="1" step="1" className="field" value={form.quantidadeUnidadesConsumidoras} onChange={set("quantidadeUnidadesConsumidoras")} required /></div>
          <div><label className="field-label" htmlFor="cargaInstaladaKva">Carga instalada (kVA) *</label><input id="cargaInstaladaKva" type="number" min="0.001" step="0.001" className="field" value={form.cargaInstaladaKva} onChange={set("cargaInstaladaKva")} required /></div>
        </div>
      </fieldset>
      <p className="flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3.5 text-[13px] leading-relaxed text-ink-soft"><Info size={15} className="mt-0.5 shrink-0 text-accent"/><span>Os campos seguem o <strong>ProjetoRequestDTO</strong> do backend. Após o cadastro, você será encaminhado para informar as cargas e executar o cálculo no Java.</span></p>
      {erro && <p role="alert" className="whitespace-pre-line rounded-lg bg-bad-soft p-3 text-sm text-bad">{erro}</p>}
      <div className="flex justify-end gap-3"><Link to="/dashboard" className="btn-ghost">Cancelar</Link><button disabled={saving} type="submit" className="btn-accent">{saving ? "Cadastrando..." : "Cadastrar e calcular"}</button></div>
    </form>
  </>;
}
