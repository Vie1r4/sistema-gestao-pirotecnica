using System.Globalization;

namespace Finalproj.Domain.Legislacao;

/// <summary>
/// Motor de validação de entradas no paiol (regras ADR/RFACEPE); devolve erros/avisos, não lança exceções.
/// Todos os limites e matrizes legais provêm de <see cref="ParametrosLegaisPirotecnia"/>.
/// </summary>
public static class MotorValidacaoPaiol
{
    public static ResultadoValidacaoPaiol ValidarEntrada(
        Produto produto,
        Paiol paiol,
        decimal quantidadeEntrada,
        IReadOnlyList<ProdutoNoPaiolDto> produtosNoPaiol,
        decimal mleAtualPaiol,
        DateTime? dataValidadeLote = null)
    {
        var r = new ResultadoValidacaoPaiol();
        var divisaoProduto = ParametrosLegaisPirotecnia.NormalizarDivisao(produto.FamiliaRisco);
        var grupoProduto = ParametrosLegaisPirotecnia.NormalizarGrupo(produto.GrupoCompatibilidade);
        var mleEntrada = quantidadeEntrada * produto.NEMPorUnidade;
        var lotacaoMax = paiol.LimiteMLE;

        if (paiol.DataValidadeLicenca.HasValue && paiol.DataValidadeLicenca.Value.Date < DateTime.UtcNow.Date)
        {
            r.Erros.Add(new ErroValidacao
            {
                Codigo = "ERRO_001",
                Mensagem = "Licença do paiol expirada. Renovação obrigatória antes de qualquer entrada de stock."
            });
            return r;
        }

        if (!RegrasLicencaPaiol.ProdutoPodeEntrar(paiol.PerfilRisco, produto.FamiliaRisco))
        {
            r.Erros.Add(new ErroValidacao
            {
                Codigo = "ERRO_002",
                Mensagem = RegrasLicencaPaiol.MensagemRecusa(paiol.PerfilRisco, produto.FamiliaRisco)
            });
            return r;
        }

        foreach (var q in produtosNoPaiol)
        {
            var grupoExistente = ParametrosLegaisPirotecnia.NormalizarGrupo(q.Grupo);
            if (!ParametrosLegaisPirotecnia.GruposPodemCoexistir(grupoExistente, grupoProduto))
            {
                r.Erros.Add(new ErroValidacao
                {
                    Codigo = "ERRO_004",
                    Mensagem = $"Incompatibilidade de grupos: produto do grupo {grupoProduto} não pode coexistir com produto do grupo {grupoExistente} já existente no paiol (ADR 7.2.5)."
                });
                return r;
            }
        }

        var limiteGrupoC = ParametrosLegaisPirotecnia.LimiteMleGrupoCComGKg;
        var somaMleGrupoC = produtosNoPaiol
            .Where(p => ParametrosLegaisPirotecnia.NormalizarGrupo(p.Grupo) == "C")
            .Sum(p => p.MLE);
        if (grupoProduto == "G" && somaMleGrupoC >= limiteGrupoC)
        {
            r.Erros.Add(new ErroValidacao
            {
                Codigo = "ERRO_004",
                Mensagem = $"Incompatibilidade: o paiol já contém {limiteGrupoC:N0} kg MLE ou mais de grupo C (pólvoras). Não pode adicionar produtos do grupo G (sub-regra 4a ADR)."
            });
            return r;
        }
        if (grupoProduto == "C")
        {
            if (somaMleGrupoC + mleEntrada > limiteGrupoC && produtosNoPaiol.Any(p => ParametrosLegaisPirotecnia.NormalizarGrupo(p.Grupo) == "G"))
            {
                r.Erros.Add(new ErroValidacao
                {
                    Codigo = "ERRO_004",
                    Mensagem = $"Incompatibilidade: grupo C (pólvoras) com grupo G no mesmo paiol só é permitido até {limiteGrupoC:N0} kg MLE de C. Sub-regra 4a ADR."
                });
                return r;
            }
        }

        var divisoesApos = produtosNoPaiol.Select(p => ParametrosLegaisPirotecnia.NormalizarDivisao(p.Divisao)).ToList();
        divisoesApos.Add(divisaoProduto);
        r.DivisaoDominanteResultante = ParametrosLegaisPirotecnia.DivisaoMaisPerigosa(divisoesApos);

        var mleTotalApos = mleAtualPaiol + mleEntrada;
        if (mleTotalApos > lotacaoMax)
        {
            var pct = lotacaoMax > 0 ? (mleTotalApos / lotacaoMax * 100).ToString("N1", CultureInfo.InvariantCulture) : "—";
            r.Erros.Add(new ErroValidacao
            {
                Codigo = "ERRO_005",
                Mensagem = $"Lotação máxima excedida. Lotação autorizada: {lotacaoMax:N2} kg MLE. Ocupação após entrada: {mleTotalApos:N2} kg MLE ({pct}%)."
            });
            return r;
        }

        if (lotacaoMax > 0)
        {
            var percentagem = (mleTotalApos / lotacaoMax) * 100;
            r.OcupacaoResultantePercentagem = percentagem;
            if (percentagem >= ParametrosLegaisPirotecnia.OcupacaoQuaseCheioPercent && percentagem < 100)
                r.Avisos.Add(new AvisoValidacao { Codigo = "AVISO_003", Mensagem = "Paiol quase cheio (90% ou mais). Evite programar novas entradas." });
            else if (percentagem >= ParametrosLegaisPirotecnia.OcupacaoAvisoAtencaoPercent && percentagem < ParametrosLegaisPirotecnia.OcupacaoQuaseCheioPercent)
                r.Avisos.Add(new AvisoValidacao { Codigo = "AVISO_002", Mensagem = "Paiol em zona de atenção (80% ou mais)." });
        }

        if (grupoProduto == "G" && somaMleGrupoC > 0 && somaMleGrupoC < limiteGrupoC)
            r.Avisos.Add(new AvisoValidacao { Codigo = "AVISO_001", Mensagem = $"Grupos C e G juntos no paiol. Atenção ao limite de {limiteGrupoC:N0} kg MLE de grupo C (ADR sub-regra 4a)." });
        if (grupoProduto == "C" && produtosNoPaiol.Any(p => ParametrosLegaisPirotecnia.NormalizarGrupo(p.Grupo) == "G"))
            r.Avisos.Add(new AvisoValidacao { Codigo = "AVISO_001", Mensagem = $"Grupos C e G juntos no paiol. Atenção ao limite de {limiteGrupoC:N0} kg MLE de grupo C." });

        // Nivelamento por cima (ADR): se a entrada eleva a divisão dominante, todo o paiol passa a ser
        // tratado pela divisão mais perigosa. O limite de peso definido mantém-se — apenas avisa.
        if (produtosNoPaiol.Count > 0)
        {
            var divisoesAntes = produtosNoPaiol
                .Select(p => ParametrosLegaisPirotecnia.NormalizarDivisao(p.Divisao))
                .ToList();
            var dominanteAntes = ParametrosLegaisPirotecnia.DivisaoMaisPerigosa(divisoesAntes);
            var dominanteApos = r.DivisaoDominanteResultante ?? dominanteAntes;
            if (ParametrosLegaisPirotecnia.DivisaoMaisPerigosaQue(dominanteApos, dominanteAntes))
            {
                r.Avisos.Add(new AvisoValidacao
                {
                    Codigo = "AVISO_004",
                    Mensagem = $"Nivelamento de risco: a entrada de divisão {divisaoProduto} eleva a divisão dominante do paiol de {dominanteAntes} para {dominanteApos}. Pela regra ADR, todo o paiol passa a ser tratado como {dominanteApos} (pior caso), agravando as distâncias de segurança e o risco efetivo. O limite de peso definido mantém-se."
                });
            }
        }

        if (dataValidadeLote.HasValue && dataValidadeLote.Value.Date < DateTime.UtcNow.Date)
        {
            r.Erros.Add(new ErroValidacao
            {
                Codigo = "ERRO_006",
                Mensagem = $"Lote fora de prazo de validade. Data de validade: {dataValidadeLote:dd/MM/yyyy}. Não pode entrar em stock ativo."
            });
            return r;
        }

        r.Aprovado = true;
        return r;
    }
}
