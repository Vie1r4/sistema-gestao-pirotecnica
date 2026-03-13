# Sistema de login baseado em funcionários

## Objetivo

O sistema é **apenas para uso interno**. O fluxo deve ser:

1. O **Admin** cria a ficha do **Funcionário** (nome, email, cargo, etc.).
2. Ao criar o funcionário **ou mais tarde**, na edição, o Admin pode **criar uma conta de acesso** para esse funcionário.
3. O Admin define (ou gera) a **palavra-passe inicial** e o **perfil de acesso** (role).
4. O Admin **entrega as credenciais** ao funcionário (email + palavra-passe); o funcionário entra com **Login** (sem Registo público).

---

## Decisões de desenho

### 1. Registo público

- **Remover** o link "Registo" do menu e **bloquear** o acesso à página de Registo (apenas Login fica disponível para quem não está autenticado).
- Novas contas só existem quando o Admin cria conta a partir de um Funcionário.

### 2. Onde criar a conta

- **No Create (Adicionar funcionário):** secção opcional "Criar conta de acesso" com:
  - Checkbox "Criar conta de acesso para este funcionário".
  - Quando marcado: Email (pré-preenchido do funcionário, editável), Palavra-passe, Confirmar palavra-passe, Perfil (role: Armazém, Técnico, Comercial, Admin).
- **No Edit (Editar funcionário):**
  - Se o funcionário **não tem conta** (`UserId` vazio): mostrar a mesma secção "Criar conta de acesso".
  - Se **já tem conta**: mostrar "Conta associada: [email]" e opção "Gerar nova palavra-passe temporária" (ação separada que gera uma password, atualiza no Identity e mostra na tela para o Admin entregar ao funcionário).

### 3. Login do funcionário

- Identity continua a usar **UserName** para login. Para o utilizador entrar com **email**, ao criar a conta vamos usar:
  - `UserName = email` e `Email = email`.
- Assim o funcionário entra na página **Entrar** com o email e a palavra-passe que o Admin lhe deu.

### 4. Associação Funcionário ↔ Conta

- O modelo **Funcionario** já tem `UserId` (Identity).
- Ao criar a conta a partir do Create ou Edit, criamos o `IdentityUser`, atribuímos a role e guardamos `Funcionario.UserId = user.Id`.
- Na Edit: remover o dropdown "Associar a utilizador" e substituir pela secção "Criar conta" quando não há UserId; quando já há UserId, mostrar a conta associada e o botão de gerar nova password.

### 5. Credenciais para entregar

- Após criar a conta (Create ou Edit), mostrar em **TempData** (e na view de sucesso/Details) uma mensagem do tipo:  
  **"Conta criada. Entregue ao funcionário: Email: x@y.pt | Palavra-passe: (a que definiu). Deve alterar no primeiro login."**

### 6. Roles (perfis)

- Dropdown com: **Armazém**, **Técnico**, **Comercial**, **Admin** (ConstantesFuncionariosClientes.Cargos).

### 7. Validações

- Ao criar conta: Email obrigatório e único; palavra-passe conforme regras do Identity; confirmar que a palavra-passe coincide.
- Se "Criar conta" estiver marcado mas o email do funcionário estiver vazio, exigir que o email seja preenchido.

### 8. Primeiro administrador (após Limpar dados)

- **Ninguém** pode fazer login sem ter já uma conta (não há registo público).
- Quando **não existe nenhum utilizador** (ex.: após Limpar dados), em vez da página «Entrar» aparece **«Criar primeiro administrador»**.
- Nessa página define-se email e palavra-passe do primeiro (e único) modo de criar conta sem estar autenticado. Esse utilizador é criado com role **Admin**, é criada uma **ficha de Funcionário** (Nome "Administrador", Cargo "Admin") ligada à conta e entra automaticamente.
- A partir daí, **só esse administrador** (ou outro Admin) pode criar contas, através da ficha do Funcionário (Criar/Editar funcionário → Criar conta de acesso).

### 9. Apenas funcionários têm acesso (verificação)

- **Criação de contas** só em dois sítios:
  1. **Criar primeiro administrador** — quando há 0 utilizadores; cria 1 user + 1 Funcionário "Administrador" ligado.
  2. **Funcionários (Criar / Editar)** — Admin marca "Criar conta de acesso" e preenche email, palavra-passe e perfil; a conta fica sempre ligada a um Funcionário (`UserId`).
- **Registo público** está desativado (redireciona para Login).
- **AdminController** não cria utilizadores; só altera roles e associação utilizador ↔ funcionário em contas já existentes.
- Assim, na prática **todas as contas** estão associadas a um Funcionário (o primeiro admin tem ficha criada automaticamente; as restantes são criadas ao criar conta na ficha do funcionário).

---

## Resumo do que implementar

| Item | Ação |
|------|------|
| Registo público | Remover link "Registo" do _LoginPartial; bloquear acesso a /Identity/Account/Register |
| Create funcionário | Secção opcional "Criar conta de acesso" (checkbox + email, password, confirm, role); no POST, criar IdentityUser e associar; mostrar credenciais em TempData |
| Edit funcionário | Se UserId == null: secção "Criar conta". Se UserId != null: "Conta: [email]" + ação "Gerar nova palavra-passe" |
| Nova ação | FuncionariosController: DesassociarConta(int id) [GET+POST] — desassocia a conta do funcionário e elimina o utilizador Identity (deixa de poder entrar no site) |
| Views | Create: bloco "Criar conta de acesso". Edit: remover dropdown Utilizadores; bloco Criar conta / Conta associada + gerar password |
| Details | Mostrar se tem conta (sim/não) e email; link "Criar conta" ou "Gerar nova password" conforme o caso |

---

*Documento criado para alinhamento antes da implementação.*
