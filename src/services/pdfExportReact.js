// Exportação do memorial de cálculo em PDF (A4) para a interface React.
// Usa jsPDF carregado sob demanda, então só pesa no bundle quando alguém
// realmente exporta.
//
// O cabeçalho traz: logo da Neoenergia, data de submissão, data de exportação
// (momento em que o PDF foi gerado) e nome do projetista.

const LOGO_URL = "/assets/logo_neoenergia.png";

// A logo original é um quadrado 900x900 com muita margem branca. Esta área
// recorta só o símbolo, para que ele fique proporcional no cabeçalho.
const LOGO_CROP = { x: 150, y: 175, w: 610, h: 560 };

const COR = {
  verde: [0, 61, 26],
  verdeClaro: [230, 246, 236],
  laranja: [247, 148, 29],
  texto: [17, 36, 26],
  suave: [93, 114, 103],
  linha: [227, 233, 228],
  fundo: [245, 248, 246],
};

const LIGACAO = { monofasico: "Monofásico", bifasico: "Bifásico", trifasico: "Trifásico" };

const STATUS = {
  rascunho: "Rascunho",
  em_analise: "Em análise",
  validado: "Validado",
  inconsistente: "Inconsistente",
  submetido: "Submetido",
  arquivado: "Arquivado",
};

export async function exportProjectPdf(project, { projetista } = {}) {
  if (!project || typeof project.demandaCalculada !== "number") {
    window.alert("Este projeto ainda não possui uma demanda calculada.");
    return;
  }
  if (!Array.isArray(project.memorial) || project.memorial.length === 0) {
    window.alert("O memorial de cálculo deste projeto não foi carregado do servidor. Recalcule o projeto e tente exportar novamente.");
    return;
  }

  const { jsPDF } = await import("jspdf");
  const logo = await carregarLogo();

  const exportadoEm = new Date();
  const nomeProjetista = project.projetista || projetista || "Não informado";
  const dataSubmissao = project.dataSubmissao ? dataBR(project.dataSubmissao) : "Ainda não submetido";
  const dataExportacao = exportadoEm.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fp = Number(project.fatorPotencia) > 0 ? Number(project.fatorPotencia) : 0.92;
  const kva = Number(project.demandaCalculada);
  const kw = kva * fp;
  const ligacao = LIGACAO[project.tipoLigacao] ?? "--";
  const categoria = categoriaPara(kva);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16; // margem lateral
  const RODAPE = 16;
  let y = 0;

  const cor = (c) => doc.setTextColor(...c);
  const preenche = (c) => doc.setFillColor(...c);
  const traco = (c) => doc.setDrawColor(...c);

  // ---------- Cabeçalho (primeira página) ----------
  preenche(COR.verde);
  doc.rect(0, 0, W, 34, "F");
  preenche(COR.laranja);
  doc.rect(0, 34, W, 1.4, "F");

  // Moldura branca atrás da logo: ela tem fundo branco e fica limpa sobre o verde.
  preenche([255, 255, 255]);
  doc.roundedRect(M, 7, 20, 20, 2.5, 2.5, "F");
  if (logo) doc.addImage(logo.dataUrl, "PNG", M + 1.6, 8.6 + (16.8 - 16.8 * logo.ratio) / 2, 16.8, 16.8 * logo.ratio);

  cor([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("NeoDemanda", M + 26, 16.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  cor([205, 225, 213]);
  doc.text("Neoenergia Pernambuco", M + 26, 22);
  doc.text("Memorial de cálculo de demanda elétrica", M + 26, 26.5);

  if (project.protocolo) {
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    cor([255, 255, 255]);
    doc.text(project.protocolo, W - M, 16.5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cor([205, 225, 213]);
    doc.text("PROTOCOLO", W - M, 12, { align: "right" });
  }

  y = 44;

  // ---------- Bloco de identificação: projetista + datas ----------
  const colW = (W - 2 * M) / 3;
  preenche(COR.fundo);
  traco(COR.linha);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, W - 2 * M, 20, 2, 2, "FD");

  const campos = [
    ["PROJETISTA", nomeProjetista],
    ["DATA DE SUBMISSÃO", dataSubmissao],
    ["DATA DE EXPORTAÇÃO", dataExportacao],
  ];
  campos.forEach(([rotulo, valor], i) => {
    const x = M + i * colW + 5;
    if (i > 0) {
      traco(COR.linha);
      doc.line(M + i * colW, y + 4, M + i * colW, y + 16);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    cor(COR.suave);
    doc.text(rotulo, x, y + 7.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    cor(COR.texto);
    doc.text(doc.splitTextToSize(valor, colW - 8)[0], x, y + 14);
  });
  y += 28;

  // ---------- Título do projeto ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  cor(COR.texto);
  const titulo = doc.splitTextToSize(project.nome || "--", W - 2 * M);
  doc.text(titulo, M, y);
  y += titulo.length * 6.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  cor(COR.suave);
  doc.text(project.endereco || "--", M, y);
  y += 10;

  // ---------- Helpers de layout ----------
  const garantirEspaco = (altura) => {
    if (y + altura > H - RODAPE - 4) {
      doc.addPage();
      y = 20;
    }
  };

  const secao = (numero, texto) => {
    garantirEspaco(14);
    preenche(COR.laranja);
    doc.rect(M, y - 4.2, 1.4, 5.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    cor(COR.verde);
    doc.text(`${numero}. ${texto.toUpperCase()}`, M + 4, y);
    y += 6;
  };

  const linhaDado = (rotulo, valor, zebra) => {
    garantirEspaco(7.5);
    if (zebra) {
      preenche(COR.fundo);
      doc.rect(M, y - 4.6, W - 2 * M, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    cor(COR.suave);
    doc.text(rotulo, M + 3, y);
    doc.setFont("helvetica", "bold");
    cor(COR.texto);
    doc.text(String(valor), W - M - 3, y, { align: "right" });
    y += 7;
  };

  const paragrafo = (texto, opcoes = {}) => {
    doc.setFont("helvetica", opcoes.negrito ? "bold" : "normal");
    doc.setFontSize(9.5);
    cor(opcoes.cor ?? COR.texto);
    const partes = doc.splitTextToSize(paraPdf(texto), W - 2 * M - 4);
    partes.forEach((parte) => {
      garantirEspaco(5.6);
      doc.text(parte, M + 2, y);
      y += 5.2;
    });
    y += opcoes.depois ?? 1.2;
  };

  // ---------- 1. Dados de entrada ----------
  secao(1, "Dados de entrada");
  [
    ["Status do projeto", STATUS[project.status] ?? "--"],
    ["Tipo de ligação", ligacao],
    ["Quantidade de unidades", project.unidades ?? "--"],
    ["Demanda contratada", `${formatar(project.demandaContratada)} kVA`],
    ["Fator de potência (FP)", fp.toFixed(2).replace(".", ",")],
  ].forEach(([r, v], i) => linhaDado(r, v, i % 2 === 0));
  y += 5;

  // ---------- 2. Resultado ----------
  secao(2, "Resultado");
  garantirEspaco(34);
  preenche(COR.verdeClaro);
  traco([186, 224, 200]);
  doc.roundedRect(M, y - 1, W - 2 * M, 26, 2.5, 2.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  cor(COR.suave);
  doc.text("DEMANDA CALCULADA", M + 6, y + 6);
  doc.setFontSize(24);
  cor(COR.verde);
  doc.text(`${formatar(kva)} kVA`, M + 6, y + 18);
  doc.setFontSize(7.5);
  cor(COR.suave);
  doc.text("DEMANDA ATIVA EQUIVALENTE", W / 2 + 6, y + 6);
  doc.setFontSize(14);
  cor(COR.texto);
  doc.text(`${formatar(kw)} kW`, W / 2 + 6, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  cor(COR.suave);
  doc.text(categoria, W / 2 + 6, y + 20);
  y += 34;

  // ---------- 3. Fórmula e regra aplicada ----------
  // Etapas da demanda residencial exatamente como o motor de cálculo (backend)
  // as produziu: área útil (Quadro 35) → coincidência (Quadro 36) →
  // segurança (Quadro 37) → demanda residencial final.
  const passos = [...project.memorial].sort((a, b) => a.ordem - b.ordem);
  const porId = (id) => passos.find((p) => p.idRegra === id);

  const etapa = (passo, titulo) => {
    garantirEspaco(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    cor(COR.verde);
    doc.text(paraPdf(titulo), M + 2, y);
    y += 5.4;
    paragrafo(`Fórmula: ${passo.formulaSimbolica}`, { cor: COR.suave, depois: 0.2 });
    paragrafo(passo.formulaAplicada, { depois: 0.2 });
    if (passo.condicao) paragrafo(passo.condicao, { cor: COR.suave, depois: 0.2 });
    paragrafo(`Resultado: ${resultadoDoPasso(passo)}`, { negrito: true, cor: COR.verde, depois: 0.2 });
    const refs = (passo.referencias || []).map(referenciaTexto).filter(Boolean);
    if (refs.length) paragrafo(`Referência: ${refs.join("; ")}`, { cor: COR.suave, depois: 0.2 });
    y += 3;
  };

  const ETAPAS_RESIDENCIAIS = [
    ["DR", "3.1 Demanda residencial inicial (obtida pela área útil)"],
    ["FC", "3.2 Fator de coincidência aplicado"],
    ["DTR", "3.3 Demanda residencial com coincidência"],
    ["FR", "3.4 Fator de segurança aplicado"],
    ["DRF", "3.5 Demanda residencial final"],
  ];
  secao(3, "Fórmula e regra aplicada");
  const idsResidenciais = new Set();
  ETAPAS_RESIDENCIAIS.forEach(([id, titulo]) => {
    const passo = porId(id);
    if (!passo) return;
    idsResidenciais.add(id);
    etapa(passo, titulo);
  });
  if (idsResidenciais.size === 0) {
    paragrafo("Projeto sem unidades residenciais: não há etapas de demanda residencial a apresentar.", { cor: COR.suave });
  }
  y += 2;

  // ---------- 4. Memorial do cálculo ----------
  // Demais etapas do motor (áreas comuns, motores, ar-condicionado, recarga,
  // enquadramento etc.), na ordem em que foram executadas.
  secao(4, "Memorial do cálculo");
  passos
    .filter((p) => !idsResidenciais.has(p.idRegra))
    .forEach((p) => etapa(p, `${p.ordem}. ${p.descricao}`));
  paragrafo(
    `Demanda de projeto: ${formatar(kva)} kVA (${formatar(kw)} kW com FP ${fp.toFixed(2).replace(".", ",")}) — ${categoria}.`,
    { negrito: true, cor: COR.verde, depois: 4 }
  );

  // ---------- 5. Observação ----------
  secao(5, "Observação técnica");
  paragrafo(
    "Este documento é um memorial padronizado de apresentação do resultado do cálculo. A verificação final deve considerar o projeto elétrico, os dados declarados e a norma aplicável.",
    { cor: COR.suave }
  );

  // ---------- Rodapé em todas as páginas ----------
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    traco(COR.linha);
    doc.setLineWidth(0.3);
    doc.line(M, H - RODAPE, W - M, H - RODAPE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cor(COR.suave);
    doc.text(`NeoDemanda · Neoenergia Pernambuco · Projetista: ${nomeProjetista}`, M, H - RODAPE + 5);
    doc.text(`Exportado em ${dataExportacao}`, M, H - RODAPE + 9);
    doc.text(`Página ${i} de ${total}`, W - M, H - RODAPE + 5, { align: "right" });
  }

  doc.save(`neodemanda_${arquivoSeguro(project.nome || project.id || "calculo")}.pdf`);
}

// ---------------------------------------------------------------------------

function categoriaPara(kva) {
  if (kva <= 10) return "Categoria T1 (Monofásico)";
  if (kva <= 22) return "Categoria T2 (Bifásico)";
  if (kva <= 75) return "Categoria T3 (Trifásico)";
  return "Subestação dedicada (> 75 kVA)";
}

const UNIDADES = { KVA: "kVA", KW: "kW", W: "W", A: "A", MM2: "mm²", M2: "m²", CV: "cv", PERCENTUAL: "%", ADIMENSIONAL: "" };

// A fonte padrão do jsPDF (Helvetica/WinAnsi) não tem alguns símbolos que o
// memorial do backend usa (∑, →, ≤, ≥); troca por equivalentes legíveis.
function paraPdf(texto) {
  return String(texto ?? "")
    .replace(/∑/g, "soma")
    .replace(/→/g, "->")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/−/g, "-");
}

function resultadoDoPasso(passo) {
  if (passo.resultadoTexto) return passo.resultadoTexto;
  const valor = Number(passo.valor);
  const texto = Number.isFinite(valor) ? valor.toLocaleString("pt-BR", { maximumFractionDigits: 4 }) : "--";
  return `${texto} ${UNIDADES[passo.unidade] ?? ""}`.trim();
}

function referenciaTexto(ref) {
  if (!ref) return "";
  return [ref.norma, ref.revisao && `rev. ${ref.revisao}`, ref.item].filter(Boolean).join(", ");
}

function dataBR(iso) {
  const [a, m, d] = String(iso).slice(0, 10).split("-");
  return a && m && d ? `${d}/${m}/${a}` : "--";
}

function formatar(valor) {
  return Number(valor || 0).toFixed(1).replace(".", ",");
}

function arquivoSeguro(valor) {
  return (
    String(valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "calculo"
  );
}

// Carrega a logo, recorta a margem branca e devolve data URL + proporção h/w.
// Se falhar (offline, arquivo ausente), o PDF sai sem a logo em vez de quebrar.
async function carregarLogo() {
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = LOGO_URL;
    });
    const { x, y, w, h } = LOGO_CROP;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    return { dataUrl: canvas.toDataURL("image/png"), ratio: h / w };
  } catch {
    return null;
  }
}
