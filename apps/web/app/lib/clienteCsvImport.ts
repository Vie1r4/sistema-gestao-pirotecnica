/** Cabeçalho e exemplo para importação simples. */
export const CLIENTE_CSV_TEMPLATE = `nome,tipo,nif,email,telefone,morada,codigo_postal,localidade,notas
"Empresa XYZ Lda",Empresa,123456789,contacto@xyz.pt,+351912345678,"Rua Exemplo 1",1000-001,Lisboa,"Cliente importado"
"João Silva",Particular,,joao@email.pt,,,,,
`;

export type ClienteCsvPreviewRow = {
  numeroLinha: number;
  nome: string;
  tipoCliente: string;
  nif: string;
  email: string;
  telefone: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  notas: string;
};

export type ClienteImportLinhaResult = {
  numeroLinha: number;
  estado: "importado" | "atualizado" | "ignorado" | "erro" | string;
  nome?: string;
  clienteId?: number;
  mensagem?: string;
};

export type ClienteImportResult = {
  totalLinhas: number;
  importados: number;
  atualizados: number;
  ignorados: number;
  erros: number;
  linhas: ClienteImportLinhaResult[];
};

export type ModoDuplicadoNif = "ignorar" | "atualizar" | "criar";

type RowField =
  | "nome"
  | "nomeComercial"
  | "tipoCliente"
  | "nif"
  | "email"
  | "telefone"
  | "morada"
  | "codigoPostal"
  | "localidade"
  | "notas"
  | "inactivo"
  | "pais";

const HEADER_ALIASES: Record<string, RowField> = {
  nome: "nome",
  name: "nome",
  designacao: "nome",
  designação: "nome",
  "nome cliente": "nome",
  cliente: "nome",
  "razao social": "nome",
  "razão social": "nome",
  "nome comercial": "nomeComercial",
  tipo: "tipoCliente",
  tipo_cliente: "tipoCliente",
  nif: "nif",
  contribuinte: "nif",
  email: "email",
  "e-mail": "email",
  telefone: "telefone",
  telefones: "telefone",
  telemovel: "telefone",
  telemóvel: "telefone",
  morada: "morada",
  endereco: "morada",
  endereço: "morada",
  codigo_postal: "codigoPostal",
  "codigo postal": "codigoPostal",
  "cód. postal": "codigoPostal",
  "cod. postal": "codigoPostal",
  cp: "codigoPostal",
  localidade: "localidade",
  país: "pais",
  pais: "pais",
  notas: "notas",
  observacoes: "notas",
  observações: "notas",
  "inactivo?": "inactivo",
  "inativo?": "inactivo",
  inactivo: "inactivo",
  inativo: "inactivo",
};

const CANDIDATE_DELIMITERS = [",", ";", "\t"] as const;
type CsvDelimiter = (typeof CANDIDATE_DELIMITERS)[number];

function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/^"|"$/g, "")
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/\s+/g, " ");
}

function countDelimiterOutsideQuotes(text: string, delimiter: string): number {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') i++;
      else inQuotes = !inQuotes;
    } else if (c === delimiter && !inQuotes) count++;
  }
  return count;
}

function rankDelimiters(text: string): CsvDelimiter[] {
  const sample = text.slice(0, 8000);
  return [...CANDIDATE_DELIMITERS]
    .map((d) => ({ d, count: countDelimiterOutsideQuotes(sample, d) }))
    .sort((a, b) => b.count - a.count)
    .map((x) => x.d);
}

function parseRecords(text: string, delimiter: CsvDelimiter): string[][] {
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentField += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (c === delimiter && !inQuotes) {
      currentRecord.push(currentField);
      currentField = "";
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      currentRecord.push(currentField);
      currentField = "";
      if (currentRecord.some((f) => f.trim())) records.push(currentRecord);
      currentRecord = [];
    } else currentField += c;
  }

  currentRecord.push(currentField);
  if (currentRecord.some((f) => f.trim())) records.push(currentRecord);
  return records;
}

function findHeaderStartOffset(text: string): number {
  const patterns = [
    /"C[ÓO]DIGO"\s*[,;\t]\s*"NOME"/i,
    /"CODIGO"\s*[,;\t]\s*"NOME"/i,
    /\bC[ÓO]DIGO\s*[,;\t]\s*"?NOME"?/i,
    /(?:^|\r?\n)\s*"NOME"\s*[,;\t]\s*"NOME COMERCIAL"/im,
    /(?:^|\r?\n)\s*NOME\s*[,;\t]\s*"?NOME COMERCIAL"?/im,
    /(?:^|\r?\n)\s*"?nome"?\s*[,;\t]\s*"?tipo"?/im,
    /(?:^|\r?\n)\s*nome\s*[,;\t]\s*tipo/im,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.index != null) {
      let start = match.index;
      while (start > 0 && text[start - 1] !== "\n" && text[start - 1] !== "\r") start--;
      return start;
    }
  }
  return 0;
}

function findHeaderRowIndex(records: string[][]): number {
  for (let i = 0; i < records.length; i++) {
    const headers = records[i].map((h) => normalizeHeader(h).toLowerCase());
    if (headers.some((h) => HEADER_ALIASES[h] === "nome" || HEADER_ALIASES[h] === "nomeComercial"))
      return i;
  }
  return -1;
}

function getCell(cells: string[], map: Array<{ index: number; field: RowField }>, field: RowField): string {
  for (const { index, field: f } of map) {
    if (f === field && index < cells.length) return cells[index]?.trim() ?? "";
  }
  return "";
}

function resolveNome(raw: Record<RowField, string>): string {
  return raw.nome.trim() || raw.nomeComercial.trim();
}

function tryParsePayload(payload: string): { rows: ClienteCsvPreviewRow[] } | null {
  for (const delimiter of rankDelimiters(payload)) {
    const records = parseRecords(payload, delimiter);
    if (records.length === 0) continue;

    const headerIndex = findHeaderRowIndex(records);
    if (headerIndex < 0) continue;

    const map: Array<{ index: number; field: RowField }> = [];
    records[headerIndex].forEach((h, index) => {
      const field = HEADER_ALIASES[normalizeHeader(h).toLowerCase()];
      if (field) map.push({ index, field });
    });

    if (!map.some((m) => m.field === "nome" || m.field === "nomeComercial")) continue;

    const rows: ClienteCsvPreviewRow[] = [];
    for (let i = headerIndex + 1; i < records.length; i++) {
      const cells = records[i];
      if (cells.every((c) => !c.trim())) continue;

      const raw = {
        nome: getCell(cells, map, "nome"),
        nomeComercial: getCell(cells, map, "nomeComercial"),
        tipoCliente: getCell(cells, map, "tipoCliente"),
        nif: getCell(cells, map, "nif").replace(/\s/g, "").slice(0, 20),
        email: getCell(cells, map, "email"),
        telefone: getCell(cells, map, "telefone").split(/[;|]/)[0]?.trim() ?? "",
        morada: getCell(cells, map, "morada").replace(/\s+/g, " ").trim(),
        codigoPostal: getCell(cells, map, "codigoPostal"),
        localidade: getCell(cells, map, "localidade"),
        pais: getCell(cells, map, "pais"),
        notas: getCell(cells, map, "notas"),
        inactivo: getCell(cells, map, "inactivo"),
      };

      const inactivo = ["sim", "s", "yes", "1", "true", "x"].includes(raw.inactivo.toLowerCase());
      if (inactivo) continue;

      const nome = resolveNome(raw);
      if (!nome) continue;

      rows.push({
        numeroLinha: i + 1,
        nome,
        tipoCliente: raw.tipoCliente || (raw.nomeComercial ? "Empresa" : "Particular"),
        nif: raw.nif,
        email: raw.email,
        telefone: raw.telefone,
        morada: raw.morada,
        codigoPostal: raw.codigoPostal,
        localidade: raw.localidade || raw.pais,
        notas: raw.notas,
      });
    }

    return { rows };
  }

  return null;
}

/** Pré-visualização no browser (mesma lógica que o backend). */
export function parseClientesCsvText(text: string): {
  rows: ClienteCsvPreviewRow[];
  erro?: string;
} {
  const normalized = text.replace(/^\uFEFF/, "").trim();
  if (!normalized) return { rows: [], erro: "O ficheiro está vazio." };

  const headerOffset = findHeaderStartOffset(normalized);
  const payload = headerOffset > 0 ? normalized.slice(headerOffset) : normalized;

  const parsed = tryParsePayload(payload);
  if (parsed) return parsed;

  return {
    rows: [],
    erro: "Não foi encontrada linha de cabeçalho com coluna NOME (exportação ERP ou modelo simples).",
  };
}

export function downloadClienteCsvTemplate(): void {
  const blob = new Blob([CLIENTE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-clientes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function mapApiImportResult(raw: Record<string, unknown>): ClienteImportResult {
  const linhasRaw = (raw.linhas ?? raw.Linhas ?? []) as Record<string, unknown>[];
  return {
    totalLinhas: Number(raw.totalLinhas ?? raw.TotalLinhas ?? 0),
    importados: Number(raw.importados ?? raw.Importados ?? 0),
    atualizados: Number(raw.atualizados ?? raw.Atualizados ?? 0),
    ignorados: Number(raw.ignorados ?? raw.Ignorados ?? 0),
    erros: Number(raw.erros ?? raw.Erros ?? 0),
    linhas: linhasRaw.map((l) => ({
      numeroLinha: Number(l.numeroLinha ?? l.NumeroLinha ?? 0),
      estado: String(l.estado ?? l.Estado ?? ""),
      nome: (l.nome ?? l.Nome) as string | undefined,
      clienteId: (l.clienteId ?? l.ClienteId) as number | undefined,
      mensagem: (l.mensagem ?? l.Mensagem) as string | undefined,
    })),
  };
}
