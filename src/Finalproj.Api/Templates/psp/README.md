# Template da declaração PSP

Ficheiros nesta pasta:

| Ficheiro | Uso |
|----------|-----|
| `declaracao-psp-source.docx` | Modelo oficial recebido (com exemplo preenchido). **Não apagar.** |
| `declaracao-psp.docx` | Template com marcadores `{{…}}`, gerado a partir do source. Usado em produção. |

Para regenerar o template a partir do source (após receber novo modelo da PSP):

```powershell
dotnet test Finalproj.Tests --filter "FullyQualifiedName~Preparador_CriaTemplateComMarcadores"
```

Marcadores suportados:

- `{{EMPRESA_DESIGNACAO}}`, `{{EMPRESA_MORADA}}`, `{{EMPRESA_ALVARA}}`, `{{EMPRESA_CONTACTOS}}`
- `{{NOME_EVENTO}}`, `{{LOCAL_GERAL}}`, `{{DATA_EVENTO}}`, `{{PROMOTOR}}`
- `{{COORDENADOR_NOME}}`, `{{COORDENADOR_CRED}}`, `{{DATA_DECLARACAO}}`
- `{{ZONA_BLOCO}}` — bloco repetível por zona (templates simplificados; o modelo oficial usa tabelas)

Configure o caminho em `appsettings.json` → `EmpresaPirotecnica:TemplateDeclaracaoPsp`.

Se `declaracao-psp.docx` não existir, o sistema gera um documento estruturado programaticamente (OpenXml) e converte para **PDF** (biblioteca MiniPdf). O ficheiro gravado em `Uploads` tem extensão `.pdf`.

**Nota:** documentos preenchidos ficam em `PirofafeData/Uploads` (fora do Git).