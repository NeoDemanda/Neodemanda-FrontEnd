// Memorial de cálculo derivado dos dados do projeto, sem depender do estado
// global do cálculo antigo. Usado pelo analista para conferir o resultado.
// Regras: NDU-001 / SM04.2-PE (mesmas faixas usadas no PDF).

export function fatorSimultaneidade(n) {
  if (n <= 1) return 1.0;
  if (n === 2) return 0.82;
  if (n === 3) return 0.75;
  if (n === 4) return 0.7;
  if (n === 5) return 0.65;
  if (n <= 7) return 0.6;
  if (n <= 10) return 0.52;
  if (n <= 15) return 0.48;
  if (n <= 20) return 0.44;
  if (n <= 25) return 0.41;
  if (n <= 30) return 0.38;
  if (n <= 40) return 0.34;
  if (n <= 50) return 0.31;
  return 0.28;
}

export function categoriaPara(kva) {
  if (kva <= 10) return { sigla: "T1", label: "Categoria T1 (Monofásico)", ligacao: "monofasico" };
  if (kva <= 22) return { sigla: "T2", label: "Categoria T2 (Bifásico)", ligacao: "bifasico" };
  if (kva <= 75) return { sigla: "T3", label: "Categoria T3 (Trifásico)", ligacao: "trifasico" };
  return { sigla: "SE", label: "Subestação dedicada (> 75 kVA)", ligacao: "trifasico" };
}

const fmt = (v, d = 1) =>
  Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * Retorna as etapas do cálculo e as verificações de conformidade.
 * Se a API devolver `project.calculo.etapas`, elas têm prioridade.
 */
export function montarMemorial(project) {
  if (!project || typeof project.demandaCalculada !== "number") return null;

  const kva = project.demandaCalculada;
  const fp = Number(project.fatorPotencia) > 0 ? Number(project.fatorPotencia) : 0.92;
  const kw = kva * fp;
  const contratada = Number(project.demandaContratada);
  const unidades = Math.max(1, Number(project.unidades) || 1);
  const fs = fatorSimultaneidade(unidades);
  const cargaInstaladaKw = kw / fs;
  const utilizacao = contratada > 0 ? kva / contratada : null;
  const folga = contratada - kva;
  const categoria = categoriaPara(kva);

  const etapas = project.calculo?.etapas ?? [
    {
      titulo: "Unidades consumidoras",
      formula: `${unidades} unidade(s)`,
      resultado: `${unidades}`,
      unidade: "un.",
    },
    {
      titulo: "Fator de simultaneidade (f_s)",
      formula: `f_s para ${unidades} unidade(s) — NDU-001`,
      resultado: fmt(fs, 2),
      unidade: "",
    },
    {
      titulo: "Carga instalada estimada",
      formula: `${fmt(kw)} kW ÷ ${fmt(fs, 2)}`,
      resultado: fmt(cargaInstaladaKw),
      unidade: "kW",
    },
    {
      titulo: "Demanda ativa",
      formula: `${fmt(cargaInstaladaKw)} kW × ${fmt(fs, 2)}`,
      resultado: fmt(kw),
      unidade: "kW",
    },
    {
      titulo: "Fator de potência (FP)",
      formula: "Informado no cadastro",
      resultado: fmt(fp, 2),
      unidade: "",
    },
    {
      titulo: "Demanda calculada",
      formula: `${fmt(kw)} kW ÷ ${fmt(fp, 2)}`,
      resultado: fmt(kva),
      unidade: "kVA",
      destaque: true,
    },
  ];

  const ligacaoOk = project.tipoLigacao ? categoria.ligacao === project.tipoLigacao ||
    // Ligação trifásica atende qualquer categoria menor.
    project.tipoLigacao === "trifasico" : true;

  const verificacoes = [
    {
      ok: kva <= contratada,
      titulo: "Demanda calculada dentro da contratada",
      detalhe:
        kva <= contratada
          ? `Folga de ${fmt(folga)} kVA (${fmt((1 - utilizacao) * 100, 0)}%).`
          : `Excede a contratada em ${fmt(-folga)} kVA.`,
    },
    {
      ok: ligacaoOk,
      titulo: "Tipo de ligação compatível com a categoria",
      detalhe: `Enquadramento: ${categoria.label}.`,
    },
    {
      ok: fp >= 0.92,
      titulo: "Fator de potência mínimo (0,92)",
      detalhe: `FP informado: ${fmt(fp, 2)}.`,
    },
  ];

  return { kva, kw, fp, contratada, utilizacao, folga, categoria, etapas, verificacoes };
}
