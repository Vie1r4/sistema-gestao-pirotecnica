# Mapeamento campos — Declaração PSP

| Campo no documento | Origem PIROFAFE |
|--------------------|-----------------|
| Bloco «Empresa pirotécnica» (designação, endereço, alvará, contacto) | **Texto fixo** no gerador (`EmpresaPirotecnicaTextoFixo`) — igual ao modelo PSP original; não depende do serviço |
| Bloco «Promotor» (caixa com evento/local/data) | **Reescrito na geração** — 3 linhas: `Evento:` (`Servico.NomeEvento` ou `Encomenda.Nome`), `Local:` (local/morada/cidade/distrito), `Data:` (`Servico.DataServico`, formato longo) |
| Rótulo «Promotor:» | Mantém-se no template (cabeçalho fora da caixa) |
| Coordenador pirotécnico | `Servico.CoordenadorPirotecnico` → nome + `NumeroCredencial` |
| Zona n.º / designação | `ServicoZonaLancamento.Designacao` |
| Coordenadas zona | `ServicoZonaLancamento.CoordenadasLat/Lng` |
| Responsável zona | `ResponsavelPirotecnico` → nome + CRED |
| Horário (data/hora/calibre/qtd) | `ServicoZonaLinha` + `Produto.Calibre` |
| Artigos (categoria, NEM) | `Produto.Categoria`, `Produto.NEMPorUnidade` |

## Template oficial PSP

O ficheiro `declaracao-psp-source.docx` é o modelo recebido da PSP (com exemplo). O `PspDeclaracaoTemplatePreparador` substitui dados de exemplo por marcadores `{{…}}` e produz `declaracao-psp.docx`.

Na geração, `GeradorDeclaracaoPspService` detecta o layout oficial (tabelas «Zona de lançamento» + «Artigos de pirotecnia») e preenche linhas de horário e artigos por zona; zonas adicionais clonam o bloco tabela-zona + tabela-artigos.

## Marcadores de template (opcional)

`{{COORDENADOR_*}}`, `{{ZONA_BLOCO}}`, `{{DATA_DECLARACAO}}`. Os blocos **empresa pirotécnica** e **evento/local/data** não usam marcadores — são reescritos na geração com texto fixo ou dados do serviço.
