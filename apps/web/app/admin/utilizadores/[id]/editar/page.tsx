"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Redireciona para a lista com edição inline (?edit=id). */
export default function EditarUtilizadorRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) router.replace(`/admin/utilizadores?edit=${encodeURIComponent(id)}`);
    else router.replace("/admin/utilizadores");
  }, [id, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
    </div>
  );
}
