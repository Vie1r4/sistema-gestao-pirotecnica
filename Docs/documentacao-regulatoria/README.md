# Documentação regulatória (PSP)

Geração da **declaração PSP** a partir dos dados do serviço (evento + zonas de lançamento).

## Acesso

- **Admin** e **Gestor** — política `PodeGerirDocumentacaoRegulatoria`, permissão frontend `documentacao.gerir`.
- Outros perfis recebem **404** (não 403) nos endpoints de geração/download de pedidos gerados.

## Fluxo

1. Criar/editar serviço com zonas, linhas de material e responsáveis (CRED no funcionário).
2. `POST /api/servicos/{id}/licenca/gerar` — gera **PDF** (a partir do template Word), grava em `PirofafeData/Uploads/.../Licencas/` e regista `ServicoLicenca` com `OrigemRegisto = PedidoGerado`.
3. Download via `GET /api/servicos/{id}/licenca/{licencaId}/ficheiro` (attachment, `Cache-Control: no-store`).
4. Documento assinado pela PSP entra como `AutorizacaoDefinitiva` via upload de licença existente.

## Configuração

`appsettings.json` → secção `EmpresaPirotecnica` (designação, morada, alvará, contactos).

Template oficial: `Templates/psp/declaracao-psp.docx` (gerado a partir de `declaracao-psp-source.docx` — ver README na pasta). O gerador preenche o template Word, normaliza o rodapé (uma linha centrada: morada | email | telefone) e centra o texto das células das tabelas, depois exporta PDF. Se o template não existir, gera documento via OpenXml e converte para PDF.

## Auditoria

Ações registadas em `LogSistema`:

- `DocumentacaoRegulatoria.GerarDeclaracaoPsp`
- `DocumentacaoRegulatoria.DownloadDeclaracaoPsp`

Com `CifragemEmRepouso:Ativa=true`, os PDF gerados são gravados cifrados em `Uploads` (AES-256-GCM); ver [SEGURANCA.md](../SEGURANCA.md).

Ver também [MAPEAMENTO-CAMPOS-PSP.md](./MAPEAMENTO-CAMPOS-PSP.md).
