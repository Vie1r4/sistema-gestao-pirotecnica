# Estrutura do projeto

Resumo da organização do código para quem entra no projeto.

## Pastas principais

- **Controllers** — endpoints MVC: Encomendas, Paiol, Serviços, Clientes, Funcionários, Produtos, Admin, etc.
- **Data** — `FinalprojContext` (DbContext com Identity e entidades), migrações e inicialização (roles, seed).
- **Models** — entidades, constantes, enums e view models (subpastas abaixo).
- **Services** — lógica de negócio e infra: stock disponível, preparação de encomendas (FIFO), log de auditoria, Identity em PT, email.
- **Views** — Razor por área (Encomendas, Paiol, Servicos, Clientes, Funcionarios, etc.).
- **wwwroot** — estáticos, documentos carregados (por entidade: Paiol, Servico, Clientes, Funcionarios).

## Models

- **Models/** (raiz) — entidades de domínio: `Paiol`, `Produto`, `Encomenda`, `Servico`, `Cliente`, `Funcionario`, `Reserva`, `EntradaPaiol`, `SaidaPaiol`, documentos extras, helpers (`GeoHelper`, `MotorValidacaoPaiol`, DTOs).
- **Models/Constants/** — constantes por área: `ConstantesEncomenda`, `ConstantesCatalogo`, `ConstantesPaiol`, `ConstantesServico`, etc.
- **Models/Enums/** — `EstadoEncomenda`, `TipoLicencaServico`, `TipoReferenciaDistancia`.
- **Models/ViewModels/** — modelos para vistas e inputs: `EncomendaCriarViewModel`, `EncomendaDraftViewModel`, `RetiradaPreparacaoInput`, `DocumentoExtraInput`, view models de Paiol, Perfil, Serviço, etc.

Todos mantêm o namespace `Finalproj.Models` para não quebrar referências.

## Services

- **IStockDisponivelService / StockDisponivelService** — stock por produto = entradas − saídas − reservas (encomendas em curso).
- **IEncomendaService / EncomendaService** — preparação de encomenda: saídas por FIFO, validação de paióis e quantidades.
- **ILogSistemaService / LogSistemaService** — auditoria: uma linha por acção (userId, nome, JSON, timestamp).
- **IdentityErrorDescriberPt** — mensagens do Identity em português.
- **EmailSender** — envio de email (configurável; confirmação de email pode estar desligada).

## Fluxo de encomendas

Pendente → Aceite | Rejeitada. Aceite → Em preparação (retiradas FIFO) → Concluída. Stock reservado enquanto estiver Pendente/Aceite/Em preparação; libertado ao rejeitar ou ao concluir.

## Comentários no código

O código está comentado com frases curtas em português: o que cada classe ou bloco faz, sem XML longo. Os comentários dão contexto de negócio quando ajuda (ex.: FIFO, reservas, estados).
