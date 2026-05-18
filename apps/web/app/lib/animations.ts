/**
 * Variantes de animação suaves e profissionais (framer-motion).
 * Entrada: fade in de baixo para cima ao carregar.
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInUpStagger = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export const transitionSmooth = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export const transitionFast = {
  duration: 0.2,
  ease: "easeOut" as const,
};

/** Para listas em cascata */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

/** Transição entre páginas: apenas fade, rápida e discreta (estilo apps modernos) */
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransitionConfig = {
  duration: 0.18,
  ease: [0.32, 0.72, 0, 1] as const, // ease-out suave, sem “bounce”
};
