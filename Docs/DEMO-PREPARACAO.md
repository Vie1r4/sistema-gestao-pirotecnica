# Preparação para demonstração (testar do zero)

Guia para **instalar, popular dados manualmente e ensaiar** o PIROFAFE antes da apresentação académica. A API **não** cria produtos, clientes, encomendas nem contas de teste — tudo é criado por ti na aplicação.

**Última revisão:** junho de 2026.

---

## 1. Arranque limpo

### Pré-requisitos

- .NET 8 SDK, Node.js 20+, SQL Server (LocalDB ou instância)
- Seguir [README na raiz](../README.md) — secção «Configuração do Backend»

### Segredos obrigatórios

```powershell
cd <raiz-do-projeto>
dotnet user-secrets set "Jwt:Secret" "sua-chave-secreta-longa-com-pelo-menos-32-caracteres" --project src/Finalproj.Api/Finalproj.Api.csproj
dotnet user-secrets set "Frontend:BaseUrl" "http://localhost:3000" --project src/Finalproj.Api/Finalproj.Api.csproj
```

### Primeira conta (Admin)

Com `Bootstrap:AllowFirstUserRegistration=true` (por defeito em **Development**), a página de login mostra **Criar primeiro utilizador** enquanto não existir nenhuma conta — recebe role **Admin**.

Depois podes criar mais utilizadores em **Admin → Utilizadores** e funcionários com conta associada. Utilizadores **sem email confirmado não fazem login** (exceto bootstrap/primeiro registo).

Para a demo com vários cargos, cria contas separadas (ex. gestor, comercial, armazém) no painel Admin e atribui as roles correspondentes.

### Executar

```powershell
# Terminal 1 — API (migrações EF aplicam-se no arranque)
dotnet run --project src/Finalproj.Api/Finalproj.Api.csproj

# Terminal 2 — Frontend (primeira compilação pode demorar 1–3 min)
cd apps/web
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). API: [https://localhost:7225/swagger](https://localhost:7225/swagger) (Development).

---

## 2. Ordem sugerida para popular dados

Faz nesta ordem para evitar bloqueios de validação:

| # | O quê | Quem (role) | Notas |
|---|--------|-------------|--------|
| 1 | **Produtos** (≥2, com distância segurança público) | Gestor / Admin | Catálogo necessário para encomendas e stock |
| 2 | **Paióis** (≥1 ativo, com coordenadas) | Armazém / Gestor | Mapa e entradas de stock |
| 3 | **Clientes** (≥2) | Comercial / Gestor | Encomendas e serviços |
| 4 | **Funcionários** (≥1 com CRED para PSP) | Gestor | Serviço + declaração regulatória |
| 5 | **Entrada de stock** no paiol | Armazém | Produtos com lote / data fabrico |
| 6 | **Encomenda** → submeter → **aceitar** → preparar | Comercial → Armazém | Fluxo completo armazém |
| 7 | **Serviço** (encomenda concluída, zonas, coordenadas) | Gestor | Mapa + PSP |
| 8 | **Declaração PSP** (opcional) | Gestor | Ver [documentacao-regulatoria/README.md](documentacao-regulatoria/README.md) |

### Gráficos do painel gestor

O gráfico «Comparação anual» e o «Volume» mostram dados **reais** das encomendas que criares. Para ter curvas interessantes, inclui encomendas em meses/anos diferentes (ex. algumas em 2024 e 2025).

---

## 3. Roteiro de apresentação (~15 min)

| Min | Ecrã | Conta |
|-----|------|-------|
| 1 | Login + home gestor (KPIs, setas vs há 7 dias) | Gestor |
| 3 | Tab **Atividade** — YoY + volume | Gestor |
| 2 | **Encomendas** — pendente / aceite | Comercial ou Gestor |
| 2 | **Armazém** — stock, entrada ou saída | Armazém |
| 3 | **Serviço** — detalhe, zonas, mapa | Gestor |
| 2 | **Declaração PSP** ou documentos | Gestor |
| 1 | **Admin** — backup manual ou logs | Admin |
| 1 | Fecho: segurança ([SEGURANCA.md](SEGURANCA.md)), testes ([TESTES.md](TESTES.md)) | — |

### Plano B

- API indisponível → Swagger, testes `dotnet test`, screenshots preparados
- Frontend lento → `npm run build && npm start` na véspera
- **Não clicar** em «Limpar todos os dados» (Admin, só Development)

---

## 4. Backup antes da defesa

1. Admin → Definições → **Executar backup agora**
2. Confirmar `.bak` + `_uploads.zip` em `PirofafeData/Backups/`
3. Opcional: correr `scripts/test-restore-backup-rpo.ps1` e registar em [OPERACOES.md](OPERACOES.md)

---

## 5. Checklist final

- [ ] JWT configurado; API arranca sem erros de migração
- [ ] Login em cada role que vais mostrar
- [ ] Reload da página (refresh token) funciona
- [ ] Paióis e serviços com **coordenadas** (mapa `/mapa`)
- [ ] ≥1 encomenda Pendente ou fluxo aceite preparado
- [ ] Painel gestor com dados reais (KPIs, YoY e volume das encomendas criadas)
- [ ] Ensaio cronometrado uma vez de ponta a ponta
- [ ] Backup manual feito na véspera

---

Ver também: [README.md](README.md) (índice) · [guia-iniciantes.md](guia-iniciantes.md) · [frontend/PAINEL-GESTOR.md](frontend/PAINEL-GESTOR.md)
