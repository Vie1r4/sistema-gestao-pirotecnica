import Link from "next/link";

type QuickAccessCardProps = {
  title: string;
  href: string;
  description?: string;
};

export default function QuickAccessCard({
  title,
  href,
  description,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-neutral-700/80 bg-neutral-900/80 p-5 transition-colors hover:border-amber-600/50 hover:bg-neutral-800/80"
    >
      <span className="text-base font-semibold text-white transition-colors group-hover:text-amber-500">
        {title}
      </span>
      {description && (
        <span className="mt-1 text-sm text-neutral-500">{description}</span>
      )}
      <span className="mt-3 text-xs font-medium text-amber-600 group-hover:text-amber-500">
        Aceder →
      </span>
    </Link>
  );
}
