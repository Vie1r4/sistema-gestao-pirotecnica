export default function UserAvatar({ name, roles }: { name: string; roles: string[] }) {
  const initials = name
    .split(/[\s._@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const bg = roles.includes("Admin")
    ? "bg-[#f5f3ff] text-[#7c3aed] dark:bg-[#2e1065]/60 dark:text-[#c4b5fd]"
    : roles.includes("Gestor")
      ? "bg-[#f0fdf4] text-[#16a34a] dark:bg-[#052e16]/60 dark:text-[#86efac]"
      : "bg-[#f1f5f9] text-[#475569] dark:bg-[#1e293b] dark:text-[#94a3b8]";

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${bg}`}
    >
      {initials || "?"}
    </div>
  );
}
