import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import PageBanner from "../components/PageBanner";

const estadoInicial = {
  nome: "",
  endereco: "",
  tipoLigacao: "",
  potenciaMaxima: "",
  unidades: "1",
  fatorPotencia: "0.92",
};

export default function NewProject() {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [form, setForm] = useState(estadoInicial);
  const [erros, setErros] = useState({});

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe o nome do cliente.";
    if (!form.endereco.trim()) e.endereco = "Informe o endereço da unidade.";
    if (!form.tipoLigacao) e.tipoLigacao = "Selecione o tipo de ligação.";
    if (!(Number(form.potenciaMaxima) > 0)) e.potenciaMaxima = "A potência deve ser maior que zero.";
    if (!(Number(form.unidades) >= 1)) e.unidades = "Mínimo de 1 unidade.";
    const fp = Number(form.fatorPotencia);
    if (!(fp > 0 && fp <= 1)) e.fatorPotencia = "O fator deve ficar entre 0,0 e 1,0.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function salvar(evento) {
    evento.preventDefault();
    if (!validar()) return;
    createProject(form);
    navigate("/dashboard");
  }

  return (
    <>
      <PageBanner
        eyebrow="Neo Demanda · Novo projeto"
        title="Cadastrar Projeto"
        subtitle="Preencha os dados para iniciar o processo de cálculo de demanda"
        back={
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
        }
      />

      <form onSubmit={salvar} className="mx-auto max-w-[560px] px-5 py-8 sm:px-8">
        <fieldset className="card p-6">
          <legend className="sr-only">Dados do cliente</legend>
          <p className="eyebrow border-b border-line pb-3 text-ink-faint">Dados do cliente</p>

          <div className="mt-5">
            <label className="field-label" htmlFor="nome">
              Nome do Cliente <span className="text-accent">*</span>
            </label>
            <input
              id="nome"
              className="field"
              placeholder="Ex: Condomínio Solar das Américas"
              value={form.nome}
              onChange={set("nome")}
            />
            {erros.nome && <p className="mt-1.5 text-[12px] text-bad">{erros.nome}</p>}
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="endereco">
              Endereço / Localização <span className="text-accent">*</span>
            </label>
            <input
              id="endereco"
              className="field"
              placeholder="Ex: Av. das Américas, 3500 — Barra da Tijuca, RJ"
              value={form.endereco}
              onChange={set("endereco")}
            />
            {erros.endereco && <p className="mt-1.5 text-[12px] text-bad">{erros.endereco}</p>}
          </div>
        </fieldset>

        <fieldset className="card mt-5 p-6">
          <legend className="sr-only">Parâmetros elétricos</legend>
          <p className="eyebrow border-b border-line pb-3 text-ink-faint">Parâmetros elétricos</p>

          <div className="mt-5">
            <label className="field-label" htmlFor="tipoLigacao">
              Tipo de Ligação <span className="text-accent">*</span>
            </label>
            <select id="tipoLigacao" className="field" value={form.tipoLigacao} onChange={set("tipoLigacao")}>
              <option value="">Selecione o tipo</option>
              <option value="monofasico">Monofásico</option>
              <option value="bifasico">Bifásico</option>
              <option value="trifasico">Trifásico</option>
            </select>
            {erros.tipoLigacao && <p className="mt-1.5 text-[12px] text-bad">{erros.tipoLigacao}</p>}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="potenciaMaxima">
                Potência Máxima <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <input
                  id="potenciaMaxima"
                  type="number"
                  min="0"
                  step="0.1"
                  className="field pr-12"
                  placeholder="0"
                  value={form.potenciaMaxima}
                  onChange={set("potenciaMaxima")}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-faint">
                  kVA
                </span>
              </div>
              {erros.potenciaMaxima && (
                <p className="mt-1.5 text-[12px] text-bad">{erros.potenciaMaxima}</p>
              )}
            </div>

            <div>
              <label className="field-label" htmlFor="unidades">
                Qtd. de Unidades <span className="text-accent">*</span>
              </label>
              <input
                id="unidades"
                type="number"
                min="1"
                step="1"
                className="field"
                value={form.unidades}
                onChange={set("unidades")}
              />
              {erros.unidades && <p className="mt-1.5 text-[12px] text-bad">{erros.unidades}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="fatorPotencia">
              Fator de Potência Inicial <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <input
                id="fatorPotencia"
                type="number"
                min="0"
                max="1"
                step="0.01"
                className="field pr-28"
                value={form.fatorPotencia}
                onChange={set("fatorPotencia")}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">
                Entre 0,0 e 1,0
              </span>
            </div>
            {erros.fatorPotencia && (
              <p className="mt-1.5 text-[12px] text-bad">{erros.fatorPotencia}</p>
            )}
          </div>
        </fieldset>

        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3.5 text-[13px] leading-relaxed text-ink-soft">
          <Info size={15} className="mt-0.5 shrink-0 text-accent" />
          <span>
            O projeto será criado com status <strong className="font-semibold text-ok">Rascunho</strong>.
            As cargas elétricas serão cadastradas na etapa seguinte.
          </span>
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link to="/dashboard" className="btn-ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn-accent">
            Cadastrar projeto
          </button>
        </div>
      </form>
    </>
  );
}
