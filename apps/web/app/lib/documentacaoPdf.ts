import { jsPDF } from "jspdf";

export type DeclaracaoTesteData = {
  servicoId: string;
  dataServico?: string;
  clienteNome?: string;
  local?: string;
};

function safe(v: string | undefined): string {
  return v?.trim() ? v : "N/D";
}

function drawBrandHeader(doc: jsPDF, titulo: string, subtitulo: string, color: [number, number, number]): void {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PIROFAFE", 20, 11.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Modelo de teste", 165, 11.5);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titulo, 20, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitulo, 20, 34);
}

function drawQrPlaceholder(doc: jsPDF, x: number, y: number): void {
  doc.setDrawColor(120, 120, 120);
  doc.rect(x, y, 28, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("QR", x + 10, y + 15);
  doc.setFontSize(7);
  doc.text("placeholder", x + 4, y + 24);
}

export function gerarDeclaracaoTestePdf(data: DeclaracaoTesteData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const hoje = new Date();
  const nomeFicheiro = `declaracao-teste-servico-${data.servicoId}.pdf`;

  drawBrandHeader(
    doc,
    "DECLARACAO (TESTE)",
    "Documento de exemplo gerado automaticamente para validacao de fluxo.",
    [194, 65, 12]
  );

  doc.setDrawColor(220, 220, 220);
  doc.line(20, 38, 190, 38);

  doc.setFontSize(12);
  doc.text(`Servico: #${safe(data.servicoId)}`, 20, 50);
  doc.text(`Cliente: ${safe(data.clienteNome)}`, 20, 58);
  doc.text(`Data do servico: ${safe(data.dataServico)}`, 20, 66);
  doc.text(`Local: ${safe(data.local)}`, 20, 74);

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Gerado em: ${hoje.toLocaleDateString("pt-PT")} ${hoje.toLocaleTimeString("pt-PT")}`,
    20,
    90
  );
  doc.text("Nota: este PDF e apenas um modelo temporario de teste.", 20, 97);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text("Assinatura:", 20, 124);
  doc.line(45, 124, 120, 124);
  drawQrPlaceholder(doc, 158, 112);

  doc.save(nomeFicheiro);
}

export function gerarLicencaTestePdf(data: DeclaracaoTesteData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const hoje = new Date();
  const nomeFicheiro = `licenca-teste-servico-${data.servicoId}.pdf`;

  drawBrandHeader(
    doc,
    "LICENCA (MODELO DE TESTE)",
    "Documento provisório para validacao visual",
    [37, 99, 235]
  );

  doc.setDrawColor(180, 180, 180);
  doc.rect(20, 40, 170, 46);
  doc.setFontSize(11);
  doc.text(`Servico: #${safe(data.servicoId)}`, 24, 50);
  doc.text(`Cliente: ${safe(data.clienteNome)}`, 24, 58);
  doc.text(`Data do servico: ${safe(data.dataServico)}`, 24, 66);
  doc.text(`Local: ${safe(data.local)}`, 24, 74);

  doc.setFont("helvetica", "bold");
  doc.text("Termos (teste):", 20, 100);
  doc.setFont("helvetica", "normal");
  const termos = [
    "- Este documento nao substitui licencas oficiais.",
    "- Usar apenas para validar layout e fluxo de geracao.",
    "- Campos e texto serao ajustados quando existir modelo final.",
  ];
  termos.forEach((linha, i) => doc.text(linha, 24, 108 + i * 7));

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Gerado em ${hoje.toLocaleDateString("pt-PT")} ${hoje.toLocaleTimeString("pt-PT")}`, 20, 136);

  doc.setTextColor(0, 0, 0);
  doc.line(20, 164, 85, 164);
  doc.line(125, 164, 190, 164);
  doc.text("Responsavel", 20, 170);
  doc.text("Entidade", 125, 170);
  drawQrPlaceholder(doc, 158, 112);

  doc.save(nomeFicheiro);
}

export function gerarAutorizacaoTestePdf(data: DeclaracaoTesteData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const hoje = new Date();
  const nomeFicheiro = `autorizacao-teste-servico-${data.servicoId}.pdf`;

  drawBrandHeader(
    doc,
    "AUTORIZACAO DE EVENTO (TESTE)",
    "Modelo demonstrativo para validacao de processo",
    [22, 163, 74]
  );
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const texto1 =
    `Declara-se, para efeitos de teste de sistema, que o serviço #${safe(data.servicoId)} ` +
    `relativo ao cliente ${safe(data.clienteNome)} encontra-se registado para a data ${safe(data.dataServico)}.`;
  const texto2 =
    "Este modelo e meramente demonstrativo para validar o processo de geracao de PDFs e " +
    "a futura integracao com templates oficiais.";

  const linhas1 = doc.splitTextToSize(texto1, 170);
  const linhas2 = doc.splitTextToSize(texto2, 170);
  doc.text(linhas1, 20, 44);
  doc.text(linhas2, 20, 62);

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text("Referencia interna: AUT-TESTE", 20, 88);
  doc.text(`Emitido em: ${hoje.toLocaleDateString("pt-PT")}`, 20, 94);

  doc.setFont("times", "normal");
  doc.rect(20, 108, 170, 56);
  doc.text("Observacoes:", 24, 116);
  doc.text("- Campo reservado para texto legal definitivo.", 24, 124);
  doc.text("- Campo reservado para referencias normativas.", 24, 132);
  doc.text("- Campo reservado para assinatura digital/QR.", 24, 140);

  doc.line(120, 188, 190, 188);
  doc.text("Assinatura", 145, 194);
  drawQrPlaceholder(doc, 158, 70);

  doc.save(nomeFicheiro);
}
