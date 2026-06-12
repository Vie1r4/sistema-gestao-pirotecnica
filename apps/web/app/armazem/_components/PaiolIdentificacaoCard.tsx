import { motion } from "framer-motion";
import type { Paiol } from "@/app/lib/armazem";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { cardClass, labelClass, sectionTitleClass } from "./armazemUi";

type Props = {
  paiol: Paiol;
  delay?: number;
};

export default function PaiolIdentificacaoCard({ paiol, delay = 0.05 }: Props) {
  return (
    <motion.section
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...transitionSmooth, delay }}
      className={cardClass}
    >
      <h2 className={sectionTitleClass}>Identificação</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-1">
        <div>
          <dt className={labelClass}>Nome</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{paiol.nome}</dd>
        </div>
        <div>
          <dt className={labelClass}>Localização (texto)</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.localizacao ?? "—"}</dd>
        </div>
        <div>
          <dt className={labelClass}>Estado</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.estado}</dd>
        </div>
      </dl>
    </motion.section>
  );
}
