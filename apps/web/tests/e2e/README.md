# Testes E2E (Playwright)

Objetivo: validar fluxos ponta-a-ponta em browser real.

## Pré-requisitos

- App frontend a correr (Playwright arranca `npm run dev` por defeito; URL base `http://127.0.0.1:3000` ou `E2E_BASE_URL`)
- Browsers do Playwright instalados

## Instalação de browser

```bash
npx playwright install chromium
```

## Execução

```bash
npm run test:e2e
```

## CI (GitHub Actions)

No workflow [`.github/workflows/client-ci.yml`](../../../../.github/workflows/client-ci.yml), após `npm run build`, corre `npx playwright install chromium --with-deps` e `npm run test:e2e`. Os cenários atuais **não exigem backend** (mock com `page.route`); o smoke de login intercepta `GET api/auth/existem-utilizadores` para resposta rápida e estável.

Modo visual:

```bash
npm run test:e2e:headed
```

## Organização

- `tests/e2e/*.spec.ts` para cenários E2E
- Começar com smoke tests estáveis
- Adicionar fluxos críticos incrementais (ex.: documentação serviço)
- Para estabilidade local/CI, preferir mock de API com `page.route(...)` nos cenários que não dependem de backend real
