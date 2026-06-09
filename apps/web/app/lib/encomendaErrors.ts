/** Tradução de códigos de erro de negócio das encomendas para mensagens amigáveis. */

export function mensagemErroPreparacao(raw: string): string {
  if (raw.includes("ENCOMENDA_COORDENADOR_SEM_CRED")) {
    return "O coordenador pirotécnico associado não tem n.º CRED na ficha. Edite o funcionário em Funcionários ou escolha outro coordenador na encomenda.";
  }
  return raw;
}
