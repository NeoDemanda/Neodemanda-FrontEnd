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
