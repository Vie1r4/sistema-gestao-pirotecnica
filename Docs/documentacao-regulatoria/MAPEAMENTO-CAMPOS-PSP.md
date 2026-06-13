# Mapeamento campos — Declaração PSP

| Campo no documento | Origem PIROFAFE |
|--------------------|-----------------|
| Bloco «Empresa pirotécnica» (título + designação, endereço, alvará, contacto) | **Texto fixo** no gerador (`EmpresaPirotecnicaTextoFixo`) — **tabela Word** (estilo «Table Grid») com título e dados na mesma célula |
| Bloco «Promotor» (título + evento/local/data) | **Reescrito na geração** — **tabela Word** com título «Promotor:» + `Evento:`, `Local:` (`Municipio`/concelho + ` – ` + `Cidade`, maiúsculas; concelho primeiro; se iguais, mantém os dois — ex.: «FAFE – FAFE», «ANTIME – FAFE»), `Data:` |
| Coordenador pirotécnico (quando aplicável) | `Servico.CoordenadorPirotecnico` → nome + `NumeroCredencial`; título e texto **alinhados à esquerda** |
| Zona n.º / designação | `ServicoZonaLancamento.Designacao` |
| Coordenadas zona | `ServicoZonaLancamento.CoordenadasLat/Lng` |
| Responsável zona | `ResponsavelPirotecnico` → nome + CRED |
| Horário (data/hora/tipo/qtd) | `ServicoZonaLinha` + `Produto.FiltroTecnico` / `Produto.Calibre` (formato «tipo/calibre») |
| Artigos (tipo, categoria, NEM) | `Produto.FiltroTecnico` (1.ª coluna), `Produto.Categoria`, `Produto.NEMPorUnidade` (unitário por linha); **Total** = Σ(quantidade × NEM/un.) na última célula da linha «Total» |

## Template oficial PSP

O ficheiro `declaracao-psp-source.docx` é o modelo recebido da PSP (com exemplo). O `PspDeclaracaoTemplatePreparador` substitui dados de exemplo por marcadores `{{…}}` e produz `declaracao-psp.docx`.

Na geração, `GeradorDeclaracaoPspService` detecta o layout oficial (tabelas «Zona de lançamento» + «Artigos de pirotecnia») e preenche **uma tabela de horário por zona** (zonas extra duplicam só o bloco horário). A tabela **«Artigos de pirotecnia» é única** e agrega o material de **todas** as zonas (quantidades somadas por produto).

## Marcadores de template (opcional)

`{{COORDENADOR_*}}`, `{{ZONA_BLOCO}}`, `{{DATA_DECLARACAO}}`. Os blocos **empresa pirotécnica** e **evento/local/data** não usam marcadores — são reescritos na geração com texto fixo ou dados do serviço.
