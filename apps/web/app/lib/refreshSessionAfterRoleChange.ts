import { refreshAccessToken } from "@/app/lib/auth";
import type { QueryClient } from "@tanstack/react-query";

/** Renova JWT e invalida perfil após alteração de roles (menu e API alinhados com a BD). */
export async function refreshSessionAfterRoleChange(
  queryClient: QueryClient,
  requiresTokenRefresh: boolean
): Promise<void> {
  if (!requiresTokenRefresh) return;
  await refreshAccessToken();
  await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
}
