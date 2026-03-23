# PIROFAFE — Frontend

Frontend **Next.js 16** (React 19) do sistema PIROFAFE. Consome a API do backend ASP.NET Core (raiz do repositório).

## Pré-requisitos

- Node.js 18+
- Backend da aplicação a correr (por defeito em `https://localhost:7225`)

## Variáveis de ambiente

Crie `.env.local` para desenvolvimento (opcional; por defeito usa `https://localhost:7225`):

```env
NEXT_PUBLIC_API_URL=https://localhost:7225
```

Em produção, defina `NEXT_PUBLIC_API_URL` com a URL pública da API.

## Executar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build para produção

```bash
npm run build
npm start
```

## Documentação

- **Docs/** — Auditoria localStorage vs API, endpoints utilizados, pendências (O-QUE-FALTA-FAZER.md).
