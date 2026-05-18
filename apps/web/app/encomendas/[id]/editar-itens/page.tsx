"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Redireciona para a página única de edição (datas, observações e itens). */
export default function EditarItensRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/encomendas/${id}/editar`);
  }, [router, id]);

  return null;
}
