import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-amber-900/30 bg-neutral-950">
      <div className="content-container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-amber-500 transition-colors hover:text-amber-400"
        >
          PIROFAFE
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <span className="hidden text-neutral-400 sm:inline">
            Sistema de Gestão Pirotécnica
          </span>
        </nav>
      </div>
    </header>
  );
}
