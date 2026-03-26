/**
 * Módulo Serviços (frontend): operações no terreno ligadas a uma encomenda concluída (1:1).
 * Usa apenas a API do backend (api/servicos).
 */

import type { Cliente } from "@/app/lib/clientes";
import type { Funcionario } from "@/app/lib/funcionarios";
import type { Encomenda, EncomendaItem } from "@/app/lib/encomendas";
import type { Produto } from "@/app/lib/produtos";
import * as servicosApi from "@/app/lib/servicosApi";

// --- Tipos de licença e referência (espelho do backend) ---
export const TIPOS_LICENCA_SERVICO = [
  "LICENCA_PSP",
  "LER",
  "PARECER_BOMBEIROS",
  "SEGURO_RC",
  "PARECER_CAMARA",
  "LICENCA_RECINTOS",
  "AUTORIZACAO_IP",
  "OUTRO",
] as const;
export type TipoLicencaServico = (typeof TIPOS_LICENCA_SERVICO)[number];

export const TIPOS_REFERENCIA_DISTANCIA = [
  "HABITACAO",
  "ESTRADA_NACIONAL",
  "AUTOESTRADA",
  "LINHA_ALTA_TENSAO",
  "FLORESTA",
  "OUTRO",
] as const;
export type TipoReferenciaDistancia = (typeof TIPOS_REFERENCIA_DISTANCIA)[number];

export const PUBLICO_PRIVADO = ["Público", "Privado"] as const;
export type PublicoPrivado = (typeof PUBLICO_PRIVADO)[number];

// --- Constantes de licenças (obrigatoriedade por Público/Privado) ---
export const ConstantesServicoLicenca = {
  Nome(tipo: TipoLicencaServico): string {
    const nomes: Record<TipoLicencaServico, string> = {
      LICENCA_PSP: "Licença PSP de Espetáculo Pirotécnico",
      LER: "Licença Especial de Ruído (LER)",
      PARECER_BOMBEIROS: "Parecer dos Bombeiros / Proteção Civil",
      SEGURO_RC: "Seguro de Responsabilidade Civil do Evento",
      PARECER_CAMARA: "Parecer / Autorização da Câmara Municipal",
      LICENCA_RECINTOS: "Licença de Recintos Improvisados (IGAC)",
      AUTORIZACAO_IP: "Autorização de Infraestruturas de Portugal",
      OUTRO: "Outro documento específico",
    };
    return nomes[tipo] ?? tipo;
  },
  TiposObrigatoriosPara(publicoPrivado: string | undefined): TipoLicencaServico[] {
    if (publicoPrivado === "Público")
      return ["LICENCA_PSP", "LER", "PARECER_BOMBEIROS", "SEGURO_RC", "PARECER_CAMARA"];
    if (publicoPrivado === "Privado") return ["LICENCA_PSP", "SEGURO_RC"];
    return [];
  },
  TodosTiposPredefinidos(): TipoLicencaServico[] {
    return TIPOS_LICENCA_SERVICO.filter((t) => t !== "OUTRO");
  },
};

// --- Constantes de distâncias de segurança (m) ---
export const ConstantesDistanciaSeguranca = {
  HabitacaoMinimaMetros(divisaoDominante: string | undefined): number {
    if (!divisaoDominante) return 50;
    if (divisaoDominante === "1.1G") return 300;
    if (divisaoDominante === "1.3G") return 100;
    return 50;
  },
  EstradaNacional: 25,
  Autoestrada: 100,
  LinhaAltaTensao: 50,
  Floresta: 100,
  Nome(tipo: TipoReferenciaDistancia): string {
    const nomes: Record<TipoReferenciaDistancia, string> = {
      HABITACAO: "Habitações / edifícios",
      ESTRADA_NACIONAL: "Estradas nacionais",
      AUTOESTRADA: "Autoestradas / IC / IP",
      LINHA_ALTA_TENSAO: "Linhas de alta tensão",
      FLORESTA: "Florestas / matas",
      OUTRO: "Outro",
    };
    return nomes[tipo] ?? tipo;
  },
};

// --- Modelos ---
export type Servico = {
  id: string;
  encomendaId: string;
  clienteId: string;
  dataServico: string; // ISO date
  local?: string;
  moradaCompleta?: string;
  distrito?: string;
  cidade?: string;
  municipio?: string;
  coordenadasLat?: number;
  coordenadasLng?: number;
  raioPublico?: number;
  publicoPrivado?: PublicoPrivado;
  responsavelTecnicoId?: string;
  observacoes?: string;
};

export type ServicoEquipa = {
  servicoId: string;
  funcionarioId: string;
};

/** 0 = papelada/pedido gerado internamente; 1 = registo definitivo autorizado pelas entidades. */
export type OrigemRegistoServicoLicenca = 0 | 1;

export const ORIGEM_LICENCA_SERVICO = {
  pedidoGerado: 0 as const,
  autorizacaoDefinitiva: 1 as const,
};

export type ServicoLicenca = {
  id: string;
  servicoId: string;
  tipoLicenca: TipoLicencaServico;
  /** 0 pedido/papelada; 1 autorização definitiva (omissão na API antiga = 1). */
  origemRegisto?: OrigemRegistoServicoLicenca;
  nomePersonalizado?: string;
  numeroDocumento?: string;
  dataEmissao?: string;
  dataValidade?: string;
  ficheiroPath?: string; // fake: pode ser nome do ficheiro
  observacoes?: string;
};

export type ServicoDistanciaSeguranca = {
  id: string;
  servicoId: string;
  tipoReferencia: TipoReferenciaDistancia;
  descricaoReferencia: string;
  distanciaMinima_m: number;
  distanciaMedida_m?: number;
};

export type ServicoDocumentoExtra = {
  id: string;
  servicoId: string;
  nome: string;
  caminho?: string;
};

// ViewModels para a UI
export type ResumoMaterialServicoViewModel = {
  encomendaId: string;
  numeroProdutos: number;
  totalUnidades: number;
  mleTotalKg: number;
  pesoBrutoKg?: number;
  divisaoDominante?: string;
  corDivisaoDominante?: string;
  categoriasPresentes: string;
  temItens: boolean;
};

export type LicencaServicoLinhaViewModel = {
  tipo: TipoLicencaServico;
  obrigatorio: boolean;
  /** Compat: max(estadoPedido, estadoDefinitiva). */
  estado: number;
  estadoPedido: number;
  estadoDefinitiva: number;
  licencaPedido?: ServicoLicenca;
  licencaDefinitiva?: ServicoLicenca;
  /** Preferência: definitiva; compat com API antiga. */
  licenca?: ServicoLicenca;
  nomeExibicao: string;
};

// --- API ---

function mapId(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

/** Mapeia um item da lista da API para o tipo do frontend (id como string). */
function mapApiServicoToList(s: Record<string, unknown>): Servico & { cliente?: Cliente | null; encomenda?: Encomenda | null; responsavelTecnico?: Funcionario | null } {
  const id = mapId(s.id ?? s.Id);
  const cliente = (s.cliente ?? s.Cliente) as Record<string, unknown> | undefined;
  const encomenda = (s.encomenda ?? s.Encomenda) as Record<string, unknown> | undefined;
  const resp = (s.responsavelTecnico ?? s.ResponsavelTecnico) as Record<string, unknown> | undefined;
  return {
    id,
    encomendaId: mapId(s.encomendaId ?? s.EncomendaId),
    clienteId: mapId(s.clienteId ?? s.ClienteId),
    dataServico: (s.dataServico ?? s.DataServico) as string,
    local: (s.local ?? s.Local) as string | undefined,
    moradaCompleta: (s.moradaCompleta ?? s.MoradaCompleta) as string | undefined,
    distrito: (s.distrito ?? s.Distrito) as string | undefined,
    cidade: (s.cidade ?? s.Cidade) as string | undefined,
    municipio: (s.municipio ?? s.Municipio) as string | undefined,
    coordenadasLat: (s.coordenadasLat ?? s.CoordenadasLat) != null ? Number(s.coordenadasLat ?? s.CoordenadasLat) : undefined,
    coordenadasLng: (s.coordenadasLng ?? s.CoordenadasLng) != null ? Number(s.coordenadasLng ?? s.CoordenadasLng) : undefined,
    raioPublico: (s.raioPublico ?? s.RaioPublico) != null ? Number(s.raioPublico ?? s.RaioPublico) : undefined,
    publicoPrivado: (s.publicoPrivado ?? s.PublicoPrivado) as PublicoPrivado | undefined,
    responsavelTecnicoId: resp != null ? mapId(resp.id ?? resp.Id) : undefined,
    observacoes: (s.observacoes ?? s.Observacoes) as string | undefined,
    cliente: cliente ? { id: mapId(cliente.id ?? cliente.Id), nome: String(cliente.nome ?? cliente.Nome ?? "") } as Cliente : null,
    encomenda: encomenda ? { id: mapId(encomenda.id ?? encomenda.Id), estado: (encomenda.estado ?? encomenda.Estado) as string } as Encomenda : null,
    responsavelTecnico: resp ? { id: mapId(resp.id ?? resp.Id), nomeCompleto: String(resp.nomeCompleto ?? resp.NomeCompleto ?? "") } as Funcionario : null,
  };
}

/** Lista serviços da API (usar quando há token). */
export async function fetchServicosFromApi(
  token: string,
  filters: { clienteId?: string; dataDesde?: string; dataAte?: string } | undefined,
  pagina: number,
  itensPorPagina: number
): Promise<{
  lista: (Servico & { cliente?: Cliente | null; encomenda?: Encomenda | null; responsavelTecnico?: Funcionario | null })[];
  total: number;
  clientes: Array<{ id: number; nome: string }>;
}> {
  const f: servicosApi.ServicosListFilters = {};
  if (filters?.clienteId) f.clienteId = filters.clienteId;
  if (filters?.dataDesde) f.dataDesde = filters.dataDesde;
  if (filters?.dataAte) f.dataAte = filters.dataAte;
  const res = await servicosApi.fetchServicos(token, f, pagina, itensPorPagina);
  const lista = (res.lista ?? []).map((s: Record<string, unknown>) => mapApiServicoToList(s));
  return {
    lista,
    total: res.totalRegistos ?? 0,
    clientes: res.clientes ?? [],
  };
}

/** Detalhe do serviço da API (usar quando há token). */
export async function fetchServicoDetalheFromApi(token: string, id: string): Promise<ServicoDetalhe | null> {
  try {
    const data = await servicosApi.fetchServicoById(token, id);
    return mapApiDetalheToServicoDetalhe(data);
  } catch (e) {
    if ((e as Error).message === "NOT_FOUND") return null;
    throw e;
  }
}

function mapApiDetalheToServicoDetalhe(data: {
  servico: Record<string, unknown>;
  resumoMaterial: Record<string, unknown> | null;
  itensEncomenda: Array<Record<string, unknown>>;
  distanciasSeguranca: Array<Record<string, unknown>>;
  licencasEvento: Array<Record<string, unknown>>;
  licencasObrigatoriasTotal: number;
  licencasObrigatoriasEntregues: number;
}): ServicoDetalhe {
  const s = data.servico;
  const id = mapId(s.id ?? s.Id);
  const cliente = (s.cliente ?? s.Cliente) as Record<string, unknown> | undefined;
  const encomenda = (s.encomenda ?? s.Encomenda) as Record<string, unknown> | undefined;
  const resp = (s.responsavelTecnico ?? s.ResponsavelTecnico) as Record<string, unknown> | undefined;
  const equipa = (s.equipa ?? s.Equipa) as Array<Record<string, unknown>> | undefined;
  const documentosExtras = (s.documentosExtras ?? s.DocumentosExtras) as Array<Record<string, unknown>> | undefined;
  const licencas = (s.licencas ?? s.Licencas) as Array<Record<string, unknown>> | undefined;

  const encomendaIdStr = mapId(s.encomendaId ?? s.EncomendaId);
  const itensEncomenda = (data.itensEncomenda ?? []).map((i: Record<string, unknown>) => {
    const prod = (i.produto ?? i.Produto) as Record<string, unknown> | undefined;
    const g = (o: Record<string, unknown>, k: string) => o[k] ?? o[k.charAt(0).toUpperCase() + k.slice(1)];
    const produtoFromApi = prod
      ? ({
          id: mapId(prod.id ?? prod.Id),
          nome: String(g(prod, "nome") ?? g(prod, "Nome") ?? ""),
          nemPorUnidade: Number(g(prod, "nemPorUnidade") ?? g(prod, "NemPorUnidade") ?? 0),
          familiaRisco: (g(prod, "familiaRisco") ?? g(prod, "FamiliaRisco")) as string | undefined,
        } as Produto)
      : null;
    return {
      id: mapId(i.id ?? i.Id),
      encomendaId: mapId(i.encomendaId ?? i.EncomendaId) || encomendaIdStr,
      produtoId: mapId(i.produtoId ?? i.ProdutoId),
      quantidadePedida: Number(i.quantidadePedida ?? i.QuantidadePedida ?? 0),
      produto: produtoFromApi,
    };
  });

  const mapVmLic = (raw: unknown): ServicoLicenca | undefined => {
    if (!raw || typeof raw !== "object") return undefined;
    const x = raw as Record<string, unknown>;
    return {
      id: mapId(x.id ?? x.Id),
      servicoId: mapId(x.servicoId ?? x.ServicoId),
      tipoLicenca: (x.tipoLicenca ?? x.TipoLicenca) as TipoLicencaServico,
      origemRegisto: (x.origemRegisto ?? x.OrigemRegisto) != null ? (Number(x.origemRegisto ?? x.OrigemRegisto) as OrigemRegistoServicoLicenca) : undefined,
      nomePersonalizado: (x.nomePersonalizado ?? x.NomePersonalizado) as string | undefined,
      numeroDocumento: (x.numeroDocumento ?? x.NumeroDocumento) as string | undefined,
      dataEmissao: (x.dataEmissao ?? x.DataEmissao) as string | undefined,
      dataValidade: (x.dataValidade ?? x.DataValidade) as string | undefined,
      observacoes: (x.observacoes ?? x.Observacoes) as string | undefined,
    };
  };

  const licencasEvento = (data.licencasEvento ?? []).map((l: Record<string, unknown>) => {
    const ped = mapVmLic(l.licencaPedido ?? l.LicencaPedido);
    const def = mapVmLic(l.licencaDefinitiva ?? l.LicencaDefinitiva);
    const estadoPedido = Number(l.estadoPedido ?? l.EstadoPedido ?? 0);
    const estadoDefinitiva = Number(l.estadoDefinitiva ?? l.EstadoDefinitiva ?? 0);
    const estadoLegacy = Number(l.estado ?? l.Estado ?? 0);
    const estado =
      l.estadoPedido != null || l.EstadoPedido != null || l.estadoDefinitiva != null || l.EstadoDefinitiva != null
        ? Math.max(estadoPedido, estadoDefinitiva)
        : estadoLegacy;
    return {
      tipo: (l.tipo ?? l.Tipo) as TipoLicencaServico,
      obrigatorio: Boolean(l.obrigatorio ?? l.Obrigatorio),
      estado,
      estadoPedido: l.estadoPedido != null || l.EstadoPedido != null ? estadoPedido : estadoLegacy,
      estadoDefinitiva: l.estadoDefinitiva != null || l.EstadoDefinitiva != null ? estadoDefinitiva : estadoLegacy,
      licencaPedido: ped,
      licencaDefinitiva: def,
      licenca: def ?? ped ?? mapVmLic(l.licenca ?? l.Licenca),
      nomeExibicao: String(
        (l as { nomeExibicao?: string; NomeExibicao?: string }).nomeExibicao ??
          (l as { nomeExibicao?: string; NomeExibicao?: string }).NomeExibicao ??
          ""
      ),
    } as LicencaServicoLinhaViewModel;
  });

  return {
    ...mapApiServicoToList(data.servico),
    id,
    cliente: cliente ? { id: mapId(cliente.id ?? cliente.Id), nome: String(cliente.nome ?? cliente.Nome ?? "") } as Cliente : null,
    encomenda: encomenda ? { id: mapId(encomenda.id ?? encomenda.Id), estado: (encomenda.estado ?? encomenda.Estado) as string } as Encomenda : null,
    responsavelTecnico: resp ? { id: mapId(resp.id ?? resp.Id), nomeCompleto: String(resp.nomeCompleto ?? resp.NomeCompleto ?? "") } as Funcionario : null,
    // API GET detalhe devolve Equipa como lista de FuncionarioResponseDto (id, nomeCompleto no topo),
    // não como { funcionarioId, funcionario }.
    equipa: (equipa ?? []).map((e: Record<string, unknown>) => {
      const nested = (e.funcionario ?? e.Funcionario) as Record<string, unknown> | undefined;
      const src = nested ?? e;
      const fid = mapId(e.funcionarioId ?? e.FuncionarioId) || mapId(src.id ?? src.Id);
      const nomeCompleto = String(
        (nested
          ? (nested.nomeCompleto ?? nested.NomeCompleto)
          : (e.nomeCompleto ?? e.NomeCompleto)) ?? ""
      );
      return {
        servicoId: id,
        funcionarioId: fid,
        funcionario: { id: fid, nomeCompleto } as Funcionario,
      };
    }),
    documentosExtras: (documentosExtras ?? []).map((d: Record<string, unknown>) => ({
      id: mapId(d.id ?? d.Id),
      servicoId: id,
      nome: String(d.nome ?? d.Nome ?? ""),
      caminho: (d.caminho ?? d.Caminho) as string | undefined,
    })),
    licencas: (licencas ?? []).map((l: Record<string, unknown>) => ({
      id: mapId(l.id ?? l.Id),
      servicoId: id,
      tipoLicenca: (l.tipoLicenca ?? l.TipoLicenca) as TipoLicencaServico,
      origemRegisto:
        (l.origemRegisto ?? l.OrigemRegisto) != null
          ? (Number(l.origemRegisto ?? l.OrigemRegisto) as OrigemRegistoServicoLicenca)
          : ORIGEM_LICENCA_SERVICO.autorizacaoDefinitiva,
      numeroDocumento: (l.numeroDocumento ?? l.NumeroDocumento) as string | undefined,
      dataEmissao: (l.dataEmissao ?? l.DataEmissao) as string | undefined,
      dataValidade: (l.dataValidade ?? l.DataValidade) as string | undefined,
      ficheiroPath: (l.ficheiroPath ?? l.FicheiroPath) as string | undefined,
      nomePersonalizado: (l.nomePersonalizado ?? l.NomePersonalizado) as string | undefined,
      observacoes: (l.observacoes ?? l.Observacoes) as string | undefined,
    })),
    distanciasSeguranca: (data.distanciasSeguranca ?? []).map((d: Record<string, unknown>) => ({
      id: mapId(d.id ?? d.Id),
      servicoId: id,
      tipoReferencia: (d.tipoReferencia ?? d.TipoReferencia) as TipoReferenciaDistancia,
      descricaoReferencia: String(d.descricaoReferencia ?? d.DescricaoReferencia ?? ""),
      distanciaMinima_m: Number(d.distanciaMinima_m ?? d.DistanciaMinima_m ?? 0),
      distanciaMedida_m: (d.distanciaMedida_m ?? d.DistanciaMedida_m) != null ? Number(d.distanciaMedida_m ?? d.DistanciaMedida_m) : undefined,
    })),
    resumoMaterial: data.resumoMaterial
      ? {
          encomendaId: mapId((data.resumoMaterial as Record<string, unknown>).encomendaId ?? (data.resumoMaterial as Record<string, unknown>).EncomendaId),
          numeroProdutos: Number((data.resumoMaterial as Record<string, unknown>).numeroProdutos ?? (data.resumoMaterial as Record<string, unknown>).NumeroProdutos ?? 0),
          totalUnidades: Number((data.resumoMaterial as Record<string, unknown>).totalUnidades ?? (data.resumoMaterial as Record<string, unknown>).TotalUnidades ?? 0),
          mleTotalKg: Number((data.resumoMaterial as Record<string, unknown>).mleTotalKg ?? (data.resumoMaterial as Record<string, unknown>).MleTotalKg ?? 0),
          divisaoDominante: ((data.resumoMaterial as Record<string, unknown>).divisaoDominante ?? (data.resumoMaterial as Record<string, unknown>).DivisaoDominante) as string | undefined,
          corDivisaoDominante: ((data.resumoMaterial as Record<string, unknown>).corDivisaoDominante ?? (data.resumoMaterial as Record<string, unknown>).CorDivisaoDominante) as string | undefined,
          categoriasPresentes: String((data.resumoMaterial as Record<string, unknown>).categoriasPresentes ?? (data.resumoMaterial as Record<string, unknown>).CategoriasPresentes ?? ""),
          temItens: Boolean((data.resumoMaterial as Record<string, unknown>).temItens ?? (data.resumoMaterial as Record<string, unknown>).TemItens),
        }
      : null,
    itensEncomenda,
    licencasEvento,
    licencasObrigatoriasTotal: data.licencasObrigatoriasTotal ?? 0,
    licencasObrigatoriasEntregues: data.licencasObrigatoriasEntregues ?? 0,
  };
}

/** Re-exportar API para criar/editar/eliminar/documentos/licenças */
export { servicosApi };

/** Detalhes do serviço com relações e listas (preenchido pela API). */
export type ServicoDetalhe = Servico & {
  cliente: Cliente | null;
  encomenda: Encomenda | null;
  responsavelTecnico: Funcionario | null;
  equipa: (ServicoEquipa & { funcionario: Funcionario | null })[];
  documentosExtras: ServicoDocumentoExtra[];
  licencas: ServicoLicenca[];
  distanciasSeguranca: ServicoDistanciaSeguranca[];
  resumoMaterial: ResumoMaterialServicoViewModel | null;
  itensEncomenda: (EncomendaItem & { produto: Produto | null })[];
  licencasEvento: LicencaServicoLinhaViewModel[];
  licencasObrigatoriasTotal: number;
  licencasObrigatoriasEntregues: number;
};
