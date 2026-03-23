"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition, pageTransitionConfig } from "@/app/lib/animations";

type PageTransitionProps = {
  children: React.ReactNode;
};

/**
 * Transição entre rotas: crossfade rápido (~180ms). initial={false} evita animação no primeiro paint.
 * - initial={false} evita animação no primeiro paint / hidratação (menos “flash”).
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransitionConfig}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
