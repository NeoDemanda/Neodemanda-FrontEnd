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
    const partes = doc.splitTextToSize(texto, W - 2 * M - 4);
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

  // ---------- 3. Fórmula ----------
  secao(3, "Fórmula e regra aplicada");
  paragrafo("Conversão da demanda ativa para a demanda aparente:", { depois: 0.5 });
  paragrafo("Demanda (kVA) = Demanda ativa (kW) / FP", { negrito: true, cor: COR.verde, depois: 0.5 });
  paragrafo(`Demanda (kVA) = ${formatar(kw)} / ${fp.toFixed(2).replace(".", ",")} = ${formatar(kva)} kVA`, {
    negrito: true,
    cor: COR.verde,
    depois: 4,
  });

  // ---------- 4. Memorial ----------
  secao(4, "Memorial básico do cálculo");
  [
    `1) Foram consideradas ${project.unidades ?? "--"} unidade(s) consumidora(s).`,
    `2) A demanda consolidada para o projeto é de ${formatar(kva)} kVA.`,
    `3) A parcela ativa equivalente é de ${formatar(kw)} kW, obtida por kVA x FP.`,
    `4) O resultado é enquadrado conforme a faixa de demanda: ${categoria}.`,
    "5) O projetista deve conferir os dados de entrada e as regras normativas antes da submissão à Neoenergia.",
  ].forEach((t) => paragrafo(t));
  y += 3;

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
// Exportação de memorial de cálculo em PDF para a interface React.
// Não depende de biblioteca externa: gera um PDF A4 diretamente no navegador.

export function exportProjectPdf(project) {
  if (!project || typeof project.demandaCalculada !== 'number') {
    window.alert('Este projeto ainda não possui uma demanda calculada.');
    return;
  }

  const fp = Number(project.fatorPotencia) > 0 ? Number(project.fatorPotencia) : 0.92;
  const demandaKva = Number(project.demandaCalculada);
  const demandaKw = demandaKva * fp;
  const ligacao = ligacaoLabel(project.tipoLigacao);
  const geradoEm = new Date().toLocaleString('pt-BR');

  const lines = [];
  const add = (text = '', style = 'normal') => lines.push({ text: String(text), style });

  add('NEODEMANDA', 'title');
  add('MEMORIAL DE CALCULO DE DEMANDA ELETRICA', 'subtitle');
  add('');
  add('1. DADOS DE ENTRADA', 'section');
  add(`Projeto: ${project.nome || '--'}`);
  add(`Endereco / Localizacao: ${project.endereco || '--'}`);
  add(`Tipo de ligacao: ${ligacao}`);
  add(`Quantidade de unidades: ${project.unidades ?? '--'}`);
  add(`Potencia / demanda contratada: ${formatNumber(project.demandaContratada)} kVA`);
  add(`Fator de potencia (FP): ${fp.toFixed(2)}`);
  add(`Data de geracao: ${geradoEm}`);
  add('');
  add('2. RESULTADO', 'section');
  add(`Demanda calculada: ${formatNumber(demandaKva)} kVA`, 'result');
  add(`Demanda ativa equivalente: ${formatNumber(demandaKw)} kW`);
  add(`Categoria / enquadramento: ${categoryFor(demandaKva)}`);
  add(`Tipo de fornecimento: ${ligacao}`);
  add('');
  add('3. FORMULA E REGRA APLICADA', 'section');
  add('Conversao da demanda ativa para aparente:');
  add(`Demanda (kVA) = Demanda ativa (kW) / FP`);
  add(`Demanda (kVA) = ${formatNumber(demandaKw)} / ${fp.toFixed(2)} = ${formatNumber(demandaKva)} kVA`);
  add('');
  add('4. MEMORIAL BASICO DO CALCULO', 'section');
  add(`1) Foram considerados ${project.unidades ?? '--'} unidade(s) consumidoras.`);
  add(`2) A demanda consolidada informada/calculada para o projeto e ${formatNumber(demandaKva)} kVA.`);
  add(`3) Para o memorial, a parcela ativa equivalente e ${formatNumber(demandaKw)} kW, obtida por kVA x FP.`);
  add(`4) O resultado e enquadrado conforme a faixa de demanda: ${categoryFor(demandaKva)}.`);
  add('5) O projetista deve conferir os dados de entrada e as regras normativas antes da submissao a Neoenergia.');
  add('');
  add('5. OBSERVACAO TECNICA', 'section');
  add('Este documento e um memorial padronizado de apresentacao do resultado do calculo.');
  add('A verificacao final deve considerar o projeto eletrico, os dados declarados e a norma aplicavel.');

  const blob = createPdf(lines);
  downloadBlob(blob, `neodemanda_${sanitizeFilename(project.nome || project.id || 'calculo')}.pdf`);
}

function categoryFor(kva) {
  if (kva <= 10) return 'Categoria T1 (Monofasico)';
  if (kva <= 22) return 'Categoria T2 (Bifasico)';
  if (kva <= 75) return 'Categoria T3 (Trifasico)';
  return 'Subestacao Dedicada (> 75 kVA)';
}

function ligacaoLabel(value) {
  return ({ monofasico: 'Monofasico', bifasico: 'Bifasico', trifasico: 'Trifasico' }[value]) || '--';
}

function createPdf(lines) {
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 48;
  const TOP = 792;
  const BOTTOM = 48;
  const lineHeight = 15;
  const pages = [];
  let page = [];
  let y = TOP;

  const pushLine = (text, style = 'normal') => {
    const sizes = { title: 17, subtitle: 10, section: 11, result: 15, normal: 9 };
    const leading = style === 'title' ? 22 : style === 'result' ? 19 : 14;
    if (y - leading < BOTTOM) {
      pages.push(page);
      page = [];
      y = TOP;
    }
    page.push({ text, style, size: sizes[style] || 9, y });
    y -= leading;
  };

  for (const line of lines) {
    if (!line.text) {
      y -= 7;
      continue;
    }
    wrapText(line.text, 92).forEach((part, index) => {
      pushLine(part, index === 0 ? line.style : 'normal');
    });
  }
  if (page.length) pages.push(page);

  const objects = [];
  const addObj = (content) => { objects.push(content); return objects.length; };
  const catalogId = addObj('');
  const pagesId = addObj('');
  const fontRegularId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const fontBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pageIds = [];

  pages.forEach((pageLines) => {
    const commands = ['BT'];
    pageLines.forEach((item) => {
      let rgb = '0.12 0.16 0.22 rg';
      if (item.style === 'section') rgb = '0.00 0.42 0.65 rg';
      if (item.style === 'result') rgb = '0.00 0.60 0.32 rg';
      commands.push(rgb);
      commands.push(`/${item.style === 'normal' || item.style === 'subtitle' ? 'F1' : 'F2'} ${item.size} Tf`);
      commands.push(`1 0 0 1 ${MARGIN} ${item.y.toFixed(2)} Tm`);
      commands.push(`(${pdfEscape(item.text)}) Tj`);
    });
    commands.push('ET');
    const stream = commands.join('\n');
    const streamId = addObj(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pageId = addObj(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${streamId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n%NeoDemanda\n';
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets[index + 1] = byteLength(pdf);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([new TextEncoder().encode(pdf)], { type: 'application/pdf' });
}

function wrapText(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const result = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      result.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) result.push(line);
  return result;
}

function pdfEscape(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/×/g, 'x')
    .replace(/²/g, '2')
    .replace(/≥/g, '>=');
}

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

function formatNumber(value) {
  return Number(value || 0).toFixed(1).replace('.', ',');
}

function sanitizeFilename(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'calculo';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
