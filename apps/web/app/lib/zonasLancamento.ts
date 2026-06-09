/**
 * Estado de formulário e helpers para zonas de lançamento (serviço / evento).
 */

import type { ServicoZonaLancamentoInput } from "./servicosApi";

export type ZonaLinhaForm = {
  key: string;
  id?: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  produtoId: string;
  quantidade: string;
};

export type ZonaForm = {
  key: string;
  id?: number;
  designacao: string;
  coordenadasLat: string;
  coordenadasLng: string;
  raioPublico: string;
  responsavelPirotecnicoId: string;
  observacoes: string;
  linhas: ZonaLinhaForm[];
};

export type ItemEncomendaForm = {
  produtoId: number;
  produtoNome: string;
  quantidadePedida: number;
};

function newKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatHoraApi(v: unknown): string {
  if (v == null || v === "") return "";
  const s = String(v);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

/** Converte hora do formulário (HH:mm) para o formato aceite pela API (HH:mm:ss). */
function formatHoraParaApi(v: string): string | undefined {
  const t = v.trim();
  if (!t) return undefined;
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{1,2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

/** Quantidade de unidades — apenas inteiros positivos no formulário. */
export function sanitizeQuantidadeInput(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  const match = trimmed.match(/^(\d+)/);
  if (!match) return "";
  const n = parseInt(match[1], 10);
  return n > 0 ? String(n) : "";
}

export function parseQuantidadeInteira(raw: string): number | null {
  const s = sanitizeQuantidadeInput(raw);
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

export function formatQuantidadeDisplay(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toLocaleString("pt-PT", { maximumFractionDigits: 2 });
}

/** Converte itens da API (create/edit) para o modelo do editor. */
export function parseItensEncomenda(raw: Array<Record<string, unknown>>): ItemEncomendaForm[] {
  return raw
    .map((i) => {
      const produtoId = Number(i.produtoId ?? i.ProdutoId ?? 0);
      const prod = (i.produto ?? i.Produto) as Record<string, unknown> | undefined;
      const nome = prod
        ? String(prod.nome ?? prod.Nome ?? i.produtoNome ?? i.ProdutoNome ?? "")
        : String(i.produtoNome ?? i.ProdutoNome ?? "");
      const q = Number(i.quantidadePedida ?? i.QuantidadePedida ?? 0);
      if (!produtoId || q <= 0) return null;
      return { produtoId, produtoNome: nome || `Produto #${produtoId}`, quantidadePedida: q };
    })
    .filter((x): x is ItemEncomendaForm => x != null);
}

export function createEmptyLinha(dataServico: string, produtoId?: number): ZonaLinhaForm {
  return {
    key: newKey("l"),
    data: dataServico,
    horaInicio: "",
    horaFim: "",
    produtoId: produtoId != null ? String(produtoId) : "",
    quantidade: "",
  };
}

export function createEmptyZona(dataServico: string): ZonaForm {
  return {
    key: newKey("z"),
    designacao: "",
    coordenadasLat: "",
    coordenadasLng: "",
    raioPublico: "",
    responsavelPirotecnicoId: "",
    observacoes: "",
    linhas: [createEmptyLinha(dataServico)],
  };
}

/** Uma zona com todo o material da encomenda (valor inicial ao escolher encomenda). */
export function createDefaultZonasFromItens(itens: ItemEncomendaForm[], dataServico: string): ZonaForm[] {
  if (itens.length === 0) return [createEmptyZona(dataServico)];
  return [
    {
      key: newKey("z"),
      designacao: "Zona principal",
      coordenadasLat: "",
      coordenadasLng: "",
      raioPublico: "",
      responsavelPirotecnicoId: "",
      observacoes: "",
      linhas: itens.map((item) => ({
        key: newKey("l"),
        data: dataServico,
        horaInicio: "",
        horaFim: "",
        produtoId: String(item.produtoId),
        quantidade: String(Math.max(1, Math.round(item.quantidadePedida))),
      })),
    },
  ];
}

/** Carrega zonas existentes da API (editar serviço). */
export function zonasFromApi(
  raw: Array<Record<string, unknown>> | undefined,
  fallbackDataServico: string
): ZonaForm[] {
  if (!raw?.length) return [];
  return raw.map((z) => {
    const linhasRaw = (z.linhas ?? z.Linhas) as Array<Record<string, unknown>> | undefined;
    return {
      key: newKey("z"),
      id: (z.id ?? z.Id) as number | undefined,
      designacao: String(z.designacao ?? z.Designacao ?? ""),
      coordenadasLat:
        (z.coordenadasLat ?? z.CoordenadasLat) != null ? String(z.coordenadasLat ?? z.CoordenadasLat) : "",
      coordenadasLng:
        (z.coordenadasLng ?? z.CoordenadasLng) != null ? String(z.coordenadasLng ?? z.CoordenadasLng) : "",
      raioPublico: (z.raioPublico ?? z.RaioPublico) != null ? String(z.raioPublico ?? z.RaioPublico) : "",
      responsavelPirotecnicoId:
        (z.responsavelPirotecnicoId ?? z.ResponsavelPirotecnicoId) != null
          ? String(z.responsavelPirotecnicoId ?? z.ResponsavelPirotecnicoId)
          : "",
      observacoes: String(z.observacoes ?? z.Observacoes ?? ""),
      linhas: (linhasRaw ?? []).map((l) => ({
        key: newKey("l"),
        id: (l.id ?? l.Id) as number | undefined,
        data: String(l.data ?? l.Data ?? fallbackDataServico).slice(0, 10),
        horaInicio: formatHoraApi(l.horaInicio ?? l.HoraInicio),
        horaFim: formatHoraApi(l.horaFim ?? l.HoraFim),
        produtoId: String(l.produtoId ?? l.ProdutoId ?? ""),
        quantidade:
          (l.quantidade ?? l.Quantidade) != null
            ? String(Math.max(1, Math.round(Number(l.quantidade ?? l.Quantidade))))
            : "",
      })),
    };
  });
}

export type AllocacaoMaterial = {
  alocadoPorProduto: Map<number, number>;
  restantePorProduto: Map<number, number>;
  excede: boolean;
};

export function calcularAllocacao(zonas: ZonaForm[], itens: ItemEncomendaForm[]): AllocacaoMaterial {
  const pedido = new Map(itens.map((i) => [i.produtoId, i.quantidadePedida]));
  const alocado = new Map<number, number>();
  for (const z of zonas) {
    for (const l of z.linhas) {
      const pid = parseInt(l.produtoId, 10);
      const q = parseQuantidadeInteira(l.quantidade);
      if (Number.isNaN(pid) || q == null) continue;
      alocado.set(pid, (alocado.get(pid) ?? 0) + q);
    }
  }
  const restante = new Map<number, number>();
  let excede = false;
  for (const [pid, max] of pedido) {
    const a = alocado.get(pid) ?? 0;
    restante.set(pid, Math.max(0, max - a));
    if (a > max) excede = true;
  }
  for (const [pid, a] of alocado) {
    if (!pedido.has(pid)) excede = true;
  }
  return { alocadoPorProduto: alocado, restantePorProduto: restante, excede };
}

export function validarZonasForm(zonas: ZonaForm[], itens: ItemEncomendaForm[]): string | null {
  if (zonas.length === 0) return "Adicione pelo menos uma zona de lançamento.";
  const produtosEncomenda = new Set(itens.map((i) => i.produtoId));

  for (let i = 0; i < zonas.length; i++) {
    const z = zonas[i];
    const nomeZona = z.designacao.trim() || `Zona ${i + 1}`;
    const lat = parseFloat(z.coordenadasLat);
    const lng = parseFloat(z.coordenadasLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return `A zona «${nomeZona}» deve ter coordenadas no mapa.`;
    }
    const linhasValidas = z.linhas.filter((l) => {
      const pid = parseInt(l.produtoId, 10);
      return !Number.isNaN(pid) && parseQuantidadeInteira(l.quantidade) != null;
    });
    if (linhasValidas.length === 0) {
      return `A zona «${nomeZona}» deve ter pelo menos uma linha com produto e quantidade.`;
    }
    for (const l of linhasValidas) {
      const pid = parseInt(l.produtoId, 10);
      if (!produtosEncomenda.has(pid)) {
        return "Só pode alocar produtos que fazem parte da encomenda.";
      }
      if (l.horaInicio && l.horaFim && l.horaFim <= l.horaInicio) {
        return "A hora de fim deve ser posterior à hora de início em cada linha de lançamento.";
      }
    }
  }

  const { excede } = calcularAllocacao(zonas, itens);
  if (excede) {
    return "A quantidade alocada por zona excede a quantidade pedida na encomenda para um ou mais produtos.";
  }
  return null;
}

export function zonasToApiInput(zonas: ZonaForm[]): ServicoZonaLancamentoInput[] {
  return zonas.map((z) => {
    const lat = parseFloat(z.coordenadasLat);
    const lng = parseFloat(z.coordenadasLng);
    const raio = z.raioPublico.trim() ? parseInt(z.raioPublico, 10) : undefined;
    const respId = z.responsavelPirotecnicoId.trim()
      ? parseInt(z.responsavelPirotecnicoId, 10)
      : undefined;
    return {
      id: z.id,
      designacao: z.designacao.trim() || undefined,
      coordenadasLat: lat,
      coordenadasLng: lng,
      raioPublico: raio != null && !Number.isNaN(raio) ? raio : undefined,
      responsavelPirotecnicoId: respId != null && !Number.isNaN(respId) ? respId : undefined,
      observacoes: z.observacoes.trim() || undefined,
      linhas: z.linhas
        .map((l) => {
          const produtoId = parseInt(l.produtoId, 10);
          const quantidade = parseQuantidadeInteira(l.quantidade);
          if (Number.isNaN(produtoId) || quantidade == null) return null;
          return {
            id: l.id,
            data: l.data,
            horaInicio: formatHoraParaApi(l.horaInicio),
            horaFim: formatHoraParaApi(l.horaFim),
            produtoId,
            quantidade,
          };
        })
        .filter((l): l is NonNullable<typeof l> => l != null),
    };
  });
}
