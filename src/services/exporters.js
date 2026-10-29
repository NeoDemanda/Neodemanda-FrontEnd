// NeoDemanda - Serviço de Exportação (PDF, XML, CSV, Impressão)

import { currentProject } from '../state/project.js';
import { getSimultaneityFactor, getAcDemandFactor } from './calculations.js';

/**
 * Gera um PDF A4 diretamente no navegador, sem depender de janela de impressão.
 * O conteúdo usa os mesmos dados e fatores aplicados pelo motor de cálculo.
 */
export function exportPDF() {
    const project = currentProject;
    const calc = project.calculations;

    if (!calc || !Number.isFinite(calc.totalDemandKva) || calc.totalDemandKva <= 0) {
        alert('Execute o cálculo de demanda antes de exportar o PDF.');
        return;
    }

    const generatedAt = new Date();
    const lines = buildPdfLines(project, generatedAt);
    const pdf = createSimplePdf(lines);
    downloadBlob(pdf, `neodemanda_${sanitizeFilename(project.name || project.id || 'calculo')}.pdf`, 'application/pdf');
}

function buildPdfLines(project, generatedAt) {
    const calc = project.calculations;
    const totalUnits = project.units.reduce((sum, u) => sum + Number(u.qty || 0), 0);
    const fs = getSimultaneityFactor(totalUnits);
    const rawRes = project.units.reduce((sum, u) => sum + (Number(u.qty || 0) * Number(u.load || 0)), 0);
    const totalAc = project.units.reduce((sum, u) => sum + (Number(u.acQty || 0) * Number(u.qty || 0)), 0);
    const acRaw = totalAc * 1.5;
    const acFactor = getAcDemandFactor(totalAc);
    const fp = 0.92;

    const lines = [];
    const add = (text = '', style = 'body') => lines.push({ text: String(text), style });
    const section = (title) => { add(title, 'section'); };

    add('NEODEMANDA', 'brand');
    add('Memorial de Cálculo de Demanda Elétrica', 'title');
    add('Neoenergia Pernambuco | Norma de referência: SM04.2-PE', 'subtitle');
    add(`Emissão: ${generatedAt.toLocaleString('pt-BR')}`, 'muted');
    add('');

    section('1. DADOS DE ENTRADA DO PROJETO');
    add(`Projeto: ${project.name || '--'}`);
    add(`CEP: ${project.cep || '--'}`);
    add(`Área construída: ${formatNumber(project.area)} m²`);
    add(`Pavimentos: ${project.floors || '--'}`);
    add(`Uso: ${formatUse(project.use)}`);
    add(`Modo de cálculo: ${project.mode === 'completo' ? 'Completo' : 'Simplificado'}`);
    add('');

    section('2. UNIDADES CONSUMIDORAS');
    add('Grupo | Qtd. | Carga unit. | AC/unid. | Carga total');
    add('-'.repeat(88), 'rule');
    project.units.forEach((u) => {
        const qty = Number(u.qty || 0);
        const load = Number(u.load || 0);
        const ac = Number(u.acQty || 0);
        add(`${truncate(u.type, 34)} | ${qty} | ${formatNumber(load)} kW | ${ac} | ${formatNumber(qty * load)} kW`);
    });
    add(`Total de unidades: ${totalUnits}`);
    add('');

    section('3. FÓRMULAS E REGRAS APLICADAS');
    add('Unidades consumidoras: Demanda = carga instalada × fator de simultaneidade.');
    add(`Carga instalada residencial = ${formatNumber(rawRes)} kW`);
    add(`Fator de simultaneidade (${totalUnits} unidades) = ${formatPercent(fs)}`);
    add(`Demanda residencial = ${formatNumber(rawRes)} × ${formatPercent(fs)} = ${formatNumber(calc.resDemand)} kW`);
    add('');
    add('Ar condicionado: Demanda = quantidade de aparelhos × 1,5 kW × fator de demanda.');
    add(`Aparelhos de AC = ${totalAc} | carga bruta = ${formatNumber(acRaw)} kW`);
    add(`Fator de demanda de AC = ${formatPercent(acFactor)}`);
    add(`Demanda de AC = ${formatNumber(acRaw)} × ${formatPercent(acFactor)} = ${formatNumber(calc.acDemand)} kW`);
    add('');

    if (project.mode === 'completo') {
        const l = project.condoLoads || {};
        const elevFactor = Number(l.elevators || 0) >= 2 ? 0.85 : 1;
        const elevatorLoad = Number(l.elevators || 0) * Number(l.elevatorPower || 0) * elevFactor;
        add('Condomínio/serviços (modo completo): iluminação + elevadores com fator aplicável + bombas.');
        add(`Iluminação = ${formatNumber(l.lighting)} kW`);
        add(`Elevadores = ${l.elevators || 0} × ${formatNumber(l.elevatorPower)} kW × ${formatPercent(elevFactor)} = ${formatNumber(elevatorLoad)} kW`);
        add(`Bombas = ${formatNumber(l.pumps)} kW`);
    } else {
        add('Condomínio/serviços (modo simplificado): quantidade de grupos × 1,2 kW.');
        add(`Demanda de condomínio = ${project.units.length} × 1,2 = ${formatNumber(calc.condoDemand)} kW`);
    }
    add(`Demanda de condomínio/serviços = ${formatNumber(calc.condoDemand)} kW`);
    add('');

    section('4. MEMORIAL DO CÁLCULO');
    add(`Demanda ativa total = ${formatNumber(calc.resDemand)} + ${formatNumber(calc.acDemand)} + ${formatNumber(calc.condoDemand)} = ${formatNumber(calc.totalDemandKw)} kW`);
    add(`Fator de potência adotado (FP) = ${fp.toFixed(2)}`);
    add(`Demanda aparente = ${formatNumber(calc.totalDemandKw)} / ${fp.toFixed(2)} = ${formatNumber(calc.totalDemandKva)} kVA`, 'highlight');
    add(`Enquadramento: ${calc.category}`);
    add('');

    section('5. RESULTADO PARA ANÁLISE');
    add(`DEMANDA CALCULADA: ${formatNumber(calc.totalDemandKva)} kVA`, 'result');
    add(`Categoria de fornecimento: ${calc.category}`);
    add(`Demanda ativa: ${formatNumber(calc.totalDemandKw)} kW`);
    add('');
    add('Documento gerado automaticamente pelo NeoDemanda a partir dos dados informados pelo projetista.', 'muted');
    add('Este memorial apresenta as regras implementadas no sistema e deve ser conferido pelo responsável técnico antes da submissão.', 'muted');

    return lines;
}

function createSimplePdf(lines) {
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 42;
    const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
    const lineHeight = 15;
    const pageBottom = 48;
    const pages = [];
    let page = [];
    let y = PAGE_HEIGHT - 48;

    const fontFor = (style) => style === 'brand' || style === 'title' || style === 'section' || style === 'result' ? 'F2' : 'F1';
    const sizeFor = (style) => ({ brand: 20, title: 14, subtitle: 9, section: 11, muted: 8, highlight: 9.5, result: 15, rule: 6, body: 9 }[style] || 9);
    const leadingFor = (style) => style === 'title' ? 20 : style === 'section' ? 18 : style === 'result' ? 21 : lineHeight;

    function pushLine(text, style) {
        const size = sizeFor(style);
        const leading = leadingFor(style);
        const chunks = wrapText(text, style === 'rule' ? 112 : 94);
        for (const chunk of chunks) {
            if (y < pageBottom) {
                pages.push(page);
                page = [];
                y = PAGE_HEIGHT - 48;
            }
            page.push({ text: chunk, style, font: fontFor(style), size, y });
            y -= leading;
        }
    }

    for (const line of lines) pushLine(line.text, line.style);
    if (page.length) pages.push(page);

    const objects = [];
    const addObj = (content) => { objects.push(content); return objects.length; };
    const catalogId = addObj('');
    const pagesId = addObj('');
    const fontRegularId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const fontBoldId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const pageIds = [];

    pages.forEach((pageLines) => {
        const commands = [];
        commands.push('0.12 0.16 0.22 rg');
        commands.push('BT');
        pageLines.forEach(item => {
            const rgb = item.style === 'section' ? '0.00 0.42 0.65 rg' : item.style === 'result' ? '0.00 0.65 0.34 rg' : '0.12 0.16 0.22 rg';
            commands.push(rgb);
            commands.push(`/${item.font} ${item.size} Tf`);
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
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

    let pdf = '%PDF-1.4\n%NeoDemanda\n';
    const offsets = [0];
    objects.forEach((obj, index) => {
        offsets[index + 1] = byteLength(pdf);
        pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const xrefOffset = byteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([new TextEncoder().encode(pdf)], { type: 'application/pdf' });
}

function wrapText(text, maxChars) {
    if (text.length <= maxChars) return [text];
    const words = text.split(' ');
    const result = [];
    let line = '';
    words.forEach(word => {
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

function formatPercent(value) {
    return `${(Number(value || 0) * 100).toFixed(0)}%`;
}

function formatUse(value) {
    return value === 'comercial' ? 'Comercial' : value === 'industrial' ? 'Industrial' : 'Residencial';
}

function truncate(value, max) {
    const text = String(value || '--');
    return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function sanitizeFilename(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'calculo';
}

export function printMemorial() {
    window.print();
}

export function exportXML() {
    const calc = currentProject.calculations;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NeoDemanda versao="1.0">
    <Cabecalho>
        <Sistema>NeoDemanda</Sistema>
        <Concessionaria>Neoenergia Pernambuco</Concessionaria>
        <NormaReferencia>SM04.2-PE</NormaReferencia>
        <DataGeracao>${new Date().toISOString()}</DataGeracao>
    </Cabecalho>
    <Projeto id="${currentProject.id}">
        <Nome>${currentProject.name}</Nome>
        <Localizacao>
            <CEP>${currentProject.cep}</CEP>
            <Estado>PE</Estado>
        </Localizacao>
        <ParametrosFisicos>
            <AreaConstruidaM2>${currentProject.area}</AreaConstruidaM2>
            <Pavimentos>${currentProject.floors}</Pavimentos>
            <TipoOcupacao>${currentProject.use}</TipoOcupacao>
        </ParametrosFisicos>
        <Resultados>
            <DemandaTotalkW>${calc.totalDemandKw.toFixed(2)}</DemandaTotalkW>
            <DemandaTotalKVA>${calc.totalDemandKva.toFixed(2)}</DemandaTotalKVA>
            <CategoriaEnquadramento>${calc.category}</CategoriaEnquadramento>
            <DemandaUnidadesConsumidoras>${calc.resDemand.toFixed(2)}</DemandaUnidadesConsumidoras>
            <DemandaArCondicionado>${calc.acDemand.toFixed(2)}</DemandaArCondicionado>
            <DemandaCondominio>${calc.condoDemand.toFixed(2)}</DemandaCondominio>
        </Resultados>
    </Projeto>
</NeoDemanda>`;

    downloadBlob(xml, `neodemanda_${currentProject.id}.xml`, 'text/xml');
}

export function exportCSV() {
    const calc = currentProject.calculations;
    let csv = "Categoria de Carga,Potencia Instalada (kW),Fator de Demanda,Demanda Calculada (kW)\n";

    const totalResQty = currentProject.units.reduce((sum, u) => sum + u.qty, 0);
    const resFs = getSimultaneityFactor(totalResQty);
    const rawResSum = currentProject.units.reduce((sum, u) => sum + (u.qty * u.load), 0);

    const totalAc = currentProject.units.reduce((sum, u) => sum + (u.acQty * u.qty), 0);
    const acFactor = getAcDemandFactor(totalAc);
    const rawAcSum = totalAc * 1.5;

    csv += `Unidades Consumidoras Residencial,${rawResSum.toFixed(1)},${(resFs * 100).toFixed(0)}%,${calc.resDemand.toFixed(1)}\n`;
    csv += `Sistemas de Climatizacao (Ar),${rawAcSum.toFixed(1)},${(acFactor * 100).toFixed(0)}%,${calc.acDemand.toFixed(1)}\n`;
    csv += `Servico Condominio,${calc.condoDemand.toFixed(1)},100%,${calc.condoDemand.toFixed(1)}\n\n`;

    csv += `Demanda Total Ativa (kW),,${calc.totalDemandKw.toFixed(2)}\n`;
    csv += `Fator de Potencia (FP),,0.92\n`;
    csv += `Demanda Total Aparente (kVA),,${calc.totalDemandKva.toFixed(2)}\n`;
    csv += `Enquadramento da Concessionaria,,${calc.category}\n`;

    downloadBlob(csv, `neodemanda_${currentProject.id}.csv`, 'text/csv');
}

function downloadBlob(content, filename, contentType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
