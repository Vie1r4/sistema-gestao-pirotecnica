import { motion } from "framer-motion";
import { type Paiol, labelPerfilRisco } from "@/app/lib/armazem";
import { fadeInUp, transitionSmooth } from "@/app/lib/animations";
import { cardClass, labelClass, sectionTitleClass } from "./armazemUi";

type Props = {
  paiol: Paiol;
  mleAtual: number;
  percentagem: number;
  delay?: number;
};

export default function PaiolLicencaCapacidadeCard({ paiol, mleAtual, percentagem, delay = 0.06 }: Props) {
  return (
    <motion.section
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={{ ...transitionSmooth, delay }}
      className={cardClass}
    >
      <h2 className={sectionTitleClass}>Licença e capacidade</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-1">
        <div>
          <dt className={labelClass}>N.º licença</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.numeroLicenca ?? "—"}</dd>
        </div>
        <div>
          <dt className={labelClass}>Validade da licença</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">
            {paiol.dataValidadeLicenca ? new Date(paiol.dataValidadeLicenca).toLocaleDateString("pt-PT") : "—"}
          </dd>
        </div>
        <div>
          <dt className={labelClass}>Perfil de risco</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">{labelPerfilRisco(paiol.perfilRisco)}</dd>
        </div>
        <div>
          <dt className={labelClass}>Limite MLE (kg)</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">{paiol.limiteMLE}</dd>
        </div>
        <div>
          <dt className={labelClass}>NEM atual / capacidade</dt>
          <dd className="mt-1 text-gray-600 dark:text-gray-400">
            {mleAtual.toFixed(1)} kg / {paiol.limiteMLE} kg ({percentagem.toFixed(0)}%)
          </dd>
        </div>
      </dl>
    </motion.section>
  );
}
