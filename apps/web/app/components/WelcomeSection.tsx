type WelcomeSectionProps = {
  userName?: string | null;
};

export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  const displayName = userName?.trim() || "Utilizador";

  return (
    <section className="rounded-lg border border-amber-900/20 bg-neutral-900/50 px-5 py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Bem-vindo, <span className="text-amber-500">{displayName}</span>
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        Selecione uma área abaixo para começar.
      </p>
    </section>
  );
}
