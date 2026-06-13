"use client";

import { useEffect, useState } from "react";
import { btnSecondary } from "@/app/components/ui/tokens";

/**
 * Guia intuitivo das regras de armazenamento em paiol, pensado para quem não conhece
 * a legislação (ADR). Explica em linguagem simples o que pode e o que não pode entrar
 * num paiol, com exemplos visuais. A informação reflete as regras aplicadas pelo sistema:
 *  - Matriz licença vs. divisão (ParametrosLegaisPirotecnia.LicencaPaiolAceitaFamilias)
 *  - Compatibilidade de grupos (letras) e nivelamento por cima.
 */

type Divisao = "1.1" | "1.2" | "1.3" | "1.4" | "1.4S";

const TODAS_DIVISOES: Divisao[] = ["1.1", "1.2", "1.3", "1.4", "1.4S"];

const DESCRICAO_DIVISAO: Record<Divisao, { titulo: string; texto: string }> = {
  "1.1": { titulo: "Explosão em massa", texto: "O mais perigoso. Explode tudo de uma vez (ex.: dinamite)." },
  "1.2": { titulo: "Projeção de estilhaços", texto: "Atira pedaços a grande velocidade, sem explosão em massa." },
  "1.3": { titulo: "Incêndio violento", texto: "Calor extremo e fogo intenso (ex.: fogo de artifício grande)." },
  "1.4": { titulo: "Risco ligeiro", texto: "Perigo reduzido (ex.: pequenos petardos, munições comuns)." },
  "1.4S": { titulo: "Muito seguro", texto: "Risco mínimo, fica confinado à embalagem." },
};

const LICENCAS: { licenca: Divisao; aceita: Divisao[] }[] = [
  { licenca: "1.1", aceita: ["1.1"] },
  { licenca: "1.2", aceita: ["1.2"] },
  { licenca: "1.3", aceita: ["1.3", "1.4", "1.4S"] },
  { licenca: "1.4", aceita: ["1.4", "1.4S"] },
  { licenca: "1.4S", aceita: ["1.4S"] },
];

function IconeSim() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeNao() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M5 5 15 15M15 5 5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function BadgeDivisao({ divisao, aceite }: { divisao: Divisao; aceite: boolean }) {
  return (
    <span
      className={
        aceite
          ? "inline-flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }
    >
      {aceite ? <IconeSim /> : <IconeNao />}
      {divisao}
    </span>
  );
}

export default function GuiaRegrasPaiol() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={btnSecondary}>
        <span className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10 9v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="10" cy="6.4" r="1" fill="currentColor" />
          </svg>
          O que pode entrar num paiol?
        </span>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guia-paiol-titulo"
          onClick={() => setAberto(false)}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-[#333] dark:bg-[#141414]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-[#222] sm:p-6">
              <div>
                <h2 id="guia-paiol-titulo" className="font-heading text-xl text-gray-900 dark:text-white">
                  Como funcionam as regras dos paióis
                </h2>
                <p className="mt-1 text-sm text-[#57534e] dark:text-gray-400">
                  Um guia simples para perceber o que pode (e o que não pode) entrar em cada paiol.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#222] dark:hover:text-white"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
                  <path d="M5 5 15 15M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] space-y-7 overflow-y-auto p-5 sm:p-6">
              <section>
                <p className="rounded-xl bg-[#f8f7f5] p-4 text-sm leading-relaxed text-[#44403c] dark:bg-[#1a1a1a] dark:text-gray-300">
                  Pensa num paiol como um cofre construído para aguentar um determinado nível de explosão.
                  A licença diz qual o <strong>pior cenário</strong> que aquele paiol foi feito para suportar.
                  A regra de ouro: um produto só pode entrar se for <strong>igual ou menos perigoso</strong> do
                  que aquilo para que o paiol foi licenciado.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                  1. Os números — o nível de perigo
                </h3>
                <p className="mt-2 text-sm text-[#57534e] dark:text-gray-400">
                  Cada produto tem uma divisão de risco. Do mais perigoso para o mais seguro:
                </p>
                <ul className="mt-3 space-y-2">
                  {TODAS_DIVISOES.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex w-12 shrink-0 justify-center rounded-md bg-[#f97316]/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-[#c2410c] dark:text-[#fb923c]">
                        {d}
                      </span>
                      <span className="text-[#44403c] dark:text-gray-300">
                        <strong>{DESCRICAO_DIVISAO[d].titulo}.</strong> {DESCRICAO_DIVISAO[d].texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                  2. O que pode entrar em cada paiol
                </h3>
                <p className="mt-2 text-sm text-[#57534e] dark:text-gray-400">
                  Consoante a licença do paiol (à esquerda), só entram as divisões marcadas a verde:
                </p>
                <div className="mt-3 space-y-2">
                  {LICENCAS.map(({ licenca, aceita }) => (
                    <div
                      key={licenca}
                      className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-[#262626] sm:flex-row sm:items-center"
                    >
                      <div className="flex shrink-0 items-center gap-2 sm:w-40">
                        <span className="text-xs text-[#78716c] dark:text-gray-500">Paiol</span>
                        <span className="rounded-md bg-[#f97316]/10 px-2 py-0.5 font-mono text-sm font-semibold text-[#c2410c] dark:text-[#fb923c]">
                          {licenca}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TODAS_DIVISOES.map((d) => (
                          <BadgeDivisao key={d} divisao={d} aceite={aceita.includes(d)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  Repara: um paiol <strong>1.1</strong> (o mais resistente) só aceita produtos <strong>1.1</strong>.
                  Isto porque produtos de classes diferentes não devem ser guardados juntos — não basta o paiol
                  &quot;aguentar&quot;. Já um paiol <strong>1.3</strong> aceita também os mais seguros (1.4 e 1.4S).
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                  3. As letras — produtos que reagem entre si
                </h3>
                <p className="mt-2 text-sm text-[#57534e] dark:text-gray-400">
                  A seguir ao número há uma letra (ex.: 1.1<strong>D</strong>, 1.3<strong>G</strong>, 1.1<strong>B</strong>).
                  Indica que tipo de material é. Alguns não podem ficar lado a lado, mesmo no paiol certo:
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/15">
                    <span className="mt-0.5 text-red-600 dark:text-red-400">
                      <IconeNao />
                    </span>
                    <span className="text-[#44403c] dark:text-gray-300">
                      <strong>Detonadores (B)</strong> nunca com <strong>explosivos (D)</strong> nem{" "}
                      <strong>pirotecnia (G)</strong>: se o detonador dispara por acidente, faz o resto ir pelos ares.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-900/15">
                    <span className="mt-0.5 text-green-600 dark:text-green-400">
                      <IconeSim />
                    </span>
                    <span className="text-[#44403c] dark:text-gray-300">
                      <strong>Pirotecnia (G)</strong> pode coexistir com <strong>pólvoras (C)</strong> e artigos do
                      grupo <strong>S</strong> — são compatíveis.
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#78716c] dark:text-gray-500">
                  Não te preocupes em decorar isto: o sistema verifica automaticamente as letras e bloqueia
                  combinações proibidas ao registar a entrada.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                  4. Nivelamento por cima
                </h3>
                <p className="mt-2 text-sm text-[#44403c] dark:text-gray-300">
                  Se misturares produtos, o paiol passa a contar como <strong>o mais perigoso lá dentro</strong>.
                  Exemplo: tens muito 1.4 e metes um 1.3 — o paiol inteiro passa a ser tratado como 1.3.
                  O sistema deixa entrar, mas <strong>avisa-te</strong> para teres consciência do novo nível de risco.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#78716c] dark:text-gray-500">
                  5. O limite de peso (MLE)
                </h3>
                <p className="mt-2 text-sm text-[#44403c] dark:text-gray-300">
                  Cada paiol tem um limite máximo de peso de explosivo (em kg) que <strong>tu defines</strong> ao criá-lo.
                  A soma de tudo o que está lá dentro não pode ultrapassar esse limite. Se uma entrada fizer
                  exceder o teto, o sistema recusa-a.
                </p>
              </section>
            </div>

            <div className="flex justify-end border-t border-gray-100 p-4 dark:border-[#222] sm:px-6">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Percebi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
