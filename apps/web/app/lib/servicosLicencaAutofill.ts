/**
 * Texto e metadados sugeridos para licenças de serviço, a partir do detalhe já carregado na API.
 * (Apenas lado cliente; o PDF/anexo continua a ser carregado pelo utilizador.)
 */

import type { ServicoDetalhe } from "@/app/lib/servicos";
import { ConstantesServicoLicenca, type TipoLicencaServico } from "@/app/lib/servicos";

function fmtData(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-PT");
}

function partesLocalizacao(s: ServicoDetalhe): string[] {
  return [s.local, s.moradaCompleta, s.municipio, s.cidade, s.distrito].filter(
    (x): x is string => Boolean(x && String(x).trim())
  );
}

/** Lista curta para pré-visualização na UI (assistente de preenchimento). */
export function resumoDadosParaAutofillLicenca(servico: ServicoDetalhe): { id: string; label: string; valor: string }[] {
  const itens: { id: string; label: string; valor: string }[] = [];

  itens.push({
    id: "ref",
    label: "Referência",
    valor: `Serviço #${servico.id} · Encomenda #${servico.encomendaId}`,
  });

  if (servico.cliente?.nome) {
    itens.push({ id: "cliente", label: "Cliente", valor: servico.cliente.nome });
  }

  itens.push({
    id: "data",
    label: "Data do evento",
    valor: fmtData(servico.dataServico),
  });

  if (servico.publicoPrivado) {
    itens.push({ id: "pp", label: "Tipo de evento", valor: servico.publicoPrivado });
  }

  const loc = partesLocalizacao(servico);
  if (loc.length) {
    itens.push({ id: "local", label: "Local / localização", valor: [...new Set(loc)].join(" · ") });
  }

  if (servico.coordenadasLat != null && servico.coordenadasLng != null) {
    itens.push({
      id: "coords",
      label: "Coordenadas",
      valor: `${Number(servico.coordenadasLat).toFixed(5)}, ${Number(servico.coordenadasLng).toFixed(5)}`,
    });
  }

  if (servico.raioPublico != null) {
    itens.push({ id: "raio", label: "Raio público", valor: `${servico.raioPublico} m` });
  }

  if (servico.responsavelTecnico?.nomeCompleto) {
    itens.push({
      id: "resp",
      label: "Responsável técnico",
      valor: servico.responsavelTecnico.nomeCompleto,
    });
  }

  const equipaNomes = servico.equipa
    .map((m) => m.funcionario?.nomeCompleto)
    .filter(Boolean) as string[];
  if (equipaNomes.length) {
    itens.push({ id: "equipa", label: "Equipa", valor: equipaNomes.join(", ") });
  }

  if (servico.resumoMaterial?.temItens) {
    const r = servico.resumoMaterial;
    itens.push({
      id: "mat",
      label: "Material (resumo)",
      valor: `${r.numeroProdutos} produtos · ${r.totalUnidades.toFixed(0)} u. · MLE ${r.mleTotalKg.toFixed(1)} kg${r.divisaoDominante ? ` · ${r.divisaoDominante}` : ""}`,
    });
  }

  if (servico.distanciasSeguranca.length > 0) {
    const amostra = servico.distanciasSeguranca
      .slice(0, 4)
      .map((d) => `${d.descricaoReferencia}: ${d.distanciaMinima_m} m`)
      .join(" · ");
    const extra =
      servico.distanciasSeguranca.length > 4 ? ` (+${servico.distanciasSeguranca.length - 4} referências)` : "";
    itens.push({ id: "dist", label: "Distâncias de segurança", valor: amostra + extra });
  }

  return itens;
}

/** Texto longo para o campo «Observações» do formulário de licença. */
export function buildObservacoesAutofillLicenca(servico: ServicoDetalhe, tipo: TipoLicencaServico): string {
  const nomeTipo = ConstantesServicoLicenca.Nome(tipo);
  const linhas: string[] = [];

  linhas.push(`Documento: ${nomeTipo}`);
  linhas.push(`Gerado a partir dos dados do serviço #${servico.id} (encomenda #${servico.encomendaId}).`);
  linhas.push("");

  if (servico.cliente?.nome) {
    linhas.push(`Cliente / entidade: ${servico.cliente.nome}`);
  }
  linhas.push(`Data do evento: ${fmtData(servico.dataServico)}`);
  if (servico.publicoPrivado) {
    linhas.push(`Evento ${servico.publicoPrivado.toLowerCase()}.`);
  }

  const loc = partesLocalizacao(servico);
  if (loc.length) {
    linhas.push(`Local: ${[...new Set(loc)].join(" · ")}`);
  }

  if (servico.coordenadasLat != null && servico.coordenadasLng != null) {
    linhas.push(
      `Coordenadas (WGS84): ${Number(servico.coordenadasLat).toFixed(6)} N, ${Number(servico.coordenadasLng).toFixed(6)} W`
    );
  }
  if (servico.raioPublico != null) {
    linhas.push(`Raio público indicado: ${servico.raioPublico} m.`);
  }

  if (servico.responsavelTecnico?.nomeCompleto) {
    linhas.push(`Responsável técnico: ${servico.responsavelTecnico.nomeCompleto}`);
  }
  const equipaNomes = servico.equipa
    .map((m) => m.funcionario?.nomeCompleto)
    .filter(Boolean) as string[];
  if (equipaNomes.length) {
    linhas.push(`Equipa registada: ${equipaNomes.join(", ")}.`);
  }

  if (servico.resumoMaterial?.temItens) {
    const r = servico.resumoMaterial;
    linhas.push(
      `Material pirotécnico (resumo): ${r.numeroProdutos} produtos, ${r.totalUnidades.toFixed(0)} unidades, MLE total ${r.mleTotalKg.toFixed(1)} kg${r.divisaoDominante ? `, divisão dominante ${r.divisaoDominante}` : ""}.`
    );
  }

  if (servico.distanciasSeguranca.length > 0) {
    linhas.push("Distâncias de segurança mínimas (referência):");
    for (const d of servico.distanciasSeguranca) {
      linhas.push(`  — ${d.descricaoReferencia}: ${d.distanciaMinima_m} m`);
    }
  }

  if (servico.observacoes?.trim()) {
    linhas.push("");
    linhas.push("Observações gerais do serviço:");
    linhas.push(servico.observacoes.trim());
  }

  linhas.push("");
  linhas.push("—");
  linhas.push("Completar número do documento, datas de emissão/validade e anexar o ficheiro oficial conforme aplicável.");

  return linhas.join("\n").trim();
}

/** Data de emissão por defeito (hoje, formato input date). */
export function dataEmissaoSugeridaHoje(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
