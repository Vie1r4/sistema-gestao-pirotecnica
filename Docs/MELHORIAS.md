# Melhorias e pontos a alinhar — Finalproj

Documento de referência para alinhar decisões sobre segurança, qualidade e operação do projeto.  
*Última atualização: março 2025*

---

## 1. Segurança

### 1.1 LimparDados (HomeController)

| Situação | A ação `LimparDados` apaga todos os utilizadores, roles e dados da aplicação e está acessível a **qualquer utilizador autenticado**. |
|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| **Risco** | Um utilizador não-admin pode apagar toda a base de dados. |
| **Propostas** | • Restringir a `[Authorize(Roles = "Admin")]` **e** só permitir em desenvolvimento (`if (!app.Environment.IsDevelopment()) return NotFound();`).<br>• Em produção: remover ou esconder o link do menu. |
| **Decisão** | _A preencher_ |

---

### 1.2 Endpoints de download de documentos

| Situação | As ações `Download` e `DownloadLicenca` (Servicos, Clientes, Funcionarios, Paiol) só exigem utilizador autenticado. Qualquer user pode tentar IDs e descarregar documentos de outros. |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Risco** | Acesso indevido a documentos (licenças, CC, contratos, etc.). |
| **Propostas** | **Opção A:** Exigir role Admin em todos os downloads (`[Authorize(Roles = "Admin")]`).<br>**Opção B:** Autorização por contexto (ex.: Comercial só vê documentos dos seus clientes; verificar recurso antes de servir o ficheiro). |
| **Decisão** | _A preencher_ |

---

### 1.3 Credenciais e segredos

| Situação | `appsettings.json` pode conter dados sensíveis (ex.: `SmtpPassword`). |
|----------|-----------------------------------------------------------------------|
| **Propostas** | • Desenvolvimento: User Secrets.<br>• Produção: variáveis de ambiente ou Azure Key Vault; nunca commitar palavras-passe. |
| **Decisão** | _A preencher_ |

---

### 1.4 Path traversal ao servir ficheiros

| Situação | Ao servir ficheiros a partir de caminhos guardados na BD, convém validar que o caminho não sai de `wwwroot`. |
|----------|-------------------------------------------------------------------------------------------------------------|
| **Proposta** | Validar que o caminho relativo está dentro de `wwwroot` antes de servir (evitar path traversal). |
| **Decisão** | _A preencher_ |

---

## 2. Qualidade e consistência

### 2.1 Testes automatizados

| Situação | O projeto **Finalproj.Tests** foi removido; não há testes ativos. |
|----------|--------------------------------------------------------------------|
| **Risco** | Regressões em regras de negócio (ex.: MotorValidacaoPaiol, EncomendaService, StockDisponivelService). |
| **Propostas** | • Reativar ou recriar projeto de testes.<br>• Priorizar testes unitários para: `MotorValidacaoPaiol`, `EncomendaService`, `StockDisponivelService`. |
| **Decisão** | _A preencher_ |

---

### 2.2 Role "Admin" em string

| Situação | A string `"Admin"` está repetida em muitos atributos `[Authorize(Roles = "Admin")]`. |
|----------|-------------------------------------------------------------------------------------|
| **Propostas** | • Criar constante partilhada (ex.: `Roles.Admin`) ou policy `"AdminOnly"` e usar `[Authorize(Policy = "AdminOnly")]` para facilitar manutenção. |
| **Decisão** | _A preencher_ |

---

### 2.3 Upload de licenças (ServicosController)

| Situação | Se `UploadLicenca` criar ficheiros diretamente com `_env.WebRootPath` / `FileStream` em vez de usar `IDocumentoStorageService`, há duplicação de lógica. |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Proposta** | Unificar todos os uploads no `IDocumentoStorageService` (um único ponto de validação e armazenamento). |
| **Decisão** | _A preencher_ |

---

## 3. Operação e desempenho

### 3.1 LimparDados e volume de dados

| Situação | `LimparDadosConfirmar` usa `_userManager.Users.ToList()` e `_roleManager.Roles.ToList()`, carregando tudo em memória. |
|----------|---------------------------------------------------------------------------------------------------------------------|
| **Proposta** | Se a ação for mantida apenas em desenvolvimento, pode ficar como está; caso contrário, considerar processamento em lote. |
| **Decisão** | _A preencher_ |

---

### 3.2 Configuração para produção

| Situação | Connection string está configurada para LocalDB. |
|----------|-------------------------------------------------|
| **Proposta** | Documentar configuração para produção (SQL Server completo, connection string via configuração segura) no README ou em comentários. |
| **Decisão** | _A preencher_ |

---

## 4. Resumo de prioridades sugeridas

| Prioridade | Item | Motivo |
|------------|------|--------|
| **P1** | LimparDados (1.1) | Risco imediato de perda total de dados. |
| **P1** | Download de documentos (1.2) | Acesso indevido a documentos sensíveis. |
| **P2** | Testes (2.1), Constante/Policy Admin (2.2) | Qualidade e manutenção. |
| **P3** | Upload unificado (2.3), Path traversal (1.4), Doc. produção (3.2) | Robustez e operação. |

---

## 5. Notas de alinhamento

_(Espaço para anotar decisões tomadas em reunião ou entre a equipa.)_

- 
- 
- 

---

*Quando uma decisão for tomada, preencher a linha **Decisão** na secção correspondente e, se útil, resumir em "Notas de alinhamento".*
