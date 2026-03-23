# Painel inicial (dashboard) — o que deve aparecer

Documento de referência para o que deve ser mostrado na página inicial da aplicação (**painel inicial**), em especial quando o utilizador está autenticado.

---

## 1. Objetivo

A página inicial deve funcionar como **painel de entrada** após o login: resumo do estado do sistema, atalhos para as áreas que o utilizador pode aceder e, quando fizer sentido, informação contextual (encomendas pendentes, próximos serviços).

---

## 2. Estados da página

### 2.1 Utilizador **não** autenticado (visitante)

- **Hero** com marca PIROFAFE e frase de marca **"Iluminamos os seus sonhos."**
- Apenas o botão **"Aceder à aplicação"** → `/login` (sem botão "Saber mais", sem estatísticas, sem secção de áreas).
- **Navbar**: no canto superior direito mostra **"Iniciar sessão"** (link para `/login`) em vez de Perfil/nome.
- **Footer** com mensagem da API (`GET api/home`) quando aplicável e copyright.

### 2.2 Utilizador **autenticado** (painel)

A página deve transformar-se num **painel inicial** com:

1. **Boas-vindas**
   - Texto tipo: "Bem-vindo(a), [nome]".
   - Nome vem de `user.nome` (contexto) ou `/api/auth/me` / perfil.

2. **Resumo / KPIs (cards de estatísticas)**
   - Fonte: `GET api/home/stats`.
   - Valores atuais: **clientes**, **serviços realizados**, **produtos geridos**, **paióis ativos**.
   - Mostrar apenas os que o utilizador tem permissão para ver (opcional numa primeira fase pode mostrar todos; depois filtrar por role/permissions).
   - Manter o layout em grid (2x2 no mobile, 4 colunas no desktop).

3. **Acesso rápido (áreas do sistema)**
   - Mesmas áreas: Armazém, Encomendas, Clientes, Funcionários, Catálogo, Serviços.
   - **Filtrar por permissões**: mostrar apenas os blocos para os quais o utilizador tem permissão (usar o mesmo critério da Navbar: `permissions` do user).
   - Assim o painel reflete o que o utilizador pode realmente aceder.

4. **Conteúdo contextual (recomendado para uma segunda fase)**
   - **Encomendas pendentes / a aguardar ação**
     - Chamada à API existente: `GET api/encomendas?estado=Pendente` (e eventualmente `estado=Aceite`) com `itensPorPagina=5`.
     - Lista curta com link para cada encomenda (detalhe, aceitar, preparar).
   - **Próximos serviços** (se a API tiver data do serviço)
     - Lista dos próximos X serviços com link para detalhe.
   - **Alertas** (futuro)
     - Ex.: stock baixo, licenças a expirar — quando o backend expuser estes dados.

5. **Footer**
   - Manter mensagem da API e copyright.

---

## 3. Resumo do que deve aparecer (autenticado)

| Secção            | Conteúdo                                                                 | Fonte / nota                          |
|-------------------|--------------------------------------------------------------------------|----------------------------------------|
| Boas-vindas       | "Bem-vindo(a), [nome]"                                                  | `user.nome` (UserContext)             |
| Cards de stats    | 4 números: clientes, serviços, produtos, paióis ativos                   | `GET api/home/stats`                  |
| Acesso rápido     | Blocos Armazém, Encomendas, Clientes, Funcionários, Catálogo, Serviços  | Filtrar por `user.permissions`        |
| Encomendas (fase 2) | Lista curta de encomendas Pendente/Aceite com links                    | `GET api/encomendas?estado=...`       |
| Footer            | Mensagem da API + © PIROFAFE                                            | `GET api/home`                        |

---

## 4. Permissões e áreas (alinhado com a Navbar)

Para filtrar os blocos "Acesso rápido" no painel, usar as mesmas permissões que a Navbar:

- **Painel Admin** → `admin`
- **Funcionários** → `funcionarios.gerir`
- **Clientes** → `clientes.gerir`
- **Armazém** → `armazem.stock` ou `armazem.gerir`
- **Catálogo** → `produtos.ver` ou `produtos.gerir`
- **Encomendas** → `encomendas.gerir`
- **Serviços** → `servicos.gerir`

Se o utilizador não tiver nenhuma destas permissões, a secção "Acesso rápido" pode mostrar uma mensagem tipo "Sem áreas disponíveis" ou esconder-se.

---

## 5. Ordem de implementação sugerida

1. **Fase 1 (painel básico)**
   - Diferenciar layout/conteúdo quando há `user` no contexto: mostrar "Bem-vindo(a), [nome]" e esconder o botão "Aceder à aplicação" (ou substituir por "Ir para Encomendas" / "Ver armazém" conforme permissões).
   - Filtrar os blocos "Áreas do sistema" pelas permissões do utilizador (reutilizar lógica da Navbar).
   - Manter stats e footer como estão.

2. **Fase 2 (conteúdo contextual)**
   - Adicionar secção "Encomendas pendentes" com `GET api/encomendas?estado=Pendente&itensPorPagina=5` (e só mostrar a secção a quem tem `encomendas.gerir`).
   - Opcional: próximos serviços quando a API o permitir.

3. **Fase 3 (refinos)**
   - Filtrar os 4 cards de stats por permissão (ex.: Comercial só vê clientes).
   - Alertas quando existirem endpoints no backend.

---

## 6. Documentação relacionada

- **PROJETO.md** (raiz do repo) — visão geral do PIROFAFE.
- **ROLES-E-PERMISSOES.md** — matriz de permissões por role.
- **Navbar** — `app/components/Navbar.tsx` (lista de links e permissões).
- **API** — `GET api/home`, `GET api/home/stats`, `GET api/encomendas`.
