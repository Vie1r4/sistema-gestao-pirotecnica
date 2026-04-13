# Documentação de Serviços

## Objetivo

Centralizar, numa única área, as ações de documentação relacionadas com serviços.

Rota frontend: `"/documentacao"`.

## Acesso

- Apenas roles `Admin` e `Gestor`.
- A rota também exige permissão de serviços (`servicos.gerir`) no guard global.

## Fluxo

1. O utilizador seleciona um serviço.
2. Na aba `"/documentacao"` gera o documento pretendido (PDF de teste).
3. No detalhe de `"/servicos/[id]"` anexa o ficheiro na secção **Documentação do serviço**.

## PDFs de teste

- Botões disponíveis:
  - **Gerar declaração (teste)**
  - **Gerar licença (teste)**
  - **Gerar autorização (teste)**
- Implementação atual no frontend: `client/app/lib/documentacaoPdf.ts` com `jsPDF`.
- Conteúdo: cabeçalho de teste e dados básicos do serviço selecionado.
- Objetivo: validar o fluxo enquanto o template final oficial ainda não está definido.

## Relação com o detalhe do serviço

- A página `"/documentacao"` é apenas para geração de ficheiros.
- O upload, abertura e remoção de documentos anexados ficam em `"/servicos/[id]"`, na secção **Documentação do serviço**.
- A remoção segue o padrão do projeto via `PUT /api/servicos/{id}` com `RemoverDocumentoExtraIds`.
