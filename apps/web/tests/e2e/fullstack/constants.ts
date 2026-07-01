/** Credenciais alinhadas com scripts/e2e-fullstack/seed-admin.sh e workflow CI. */
export const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "e2e-fullstack@pirofafe.pt";
export const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Teste123!Aa";
export const E2E_ADMIN_NOME = process.env.E2E_ADMIN_NOME ?? "Admin E2E Fullstack";
export const E2E_API_URL = process.env.E2E_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5078";
