import Link from "next/link";
import { cn } from "@/shared/lib/cn";

interface AdminSectionNavProps {
  active: "battles" | "memos";
}

const items = [
  { id: "battles", href: "/admin/battles", label: "배틀 대시보드" },
  { id: "memos", href: "/admin/memos", label: "재사용 메모" },
] as const;

export function AdminSectionNav({ active }: AdminSectionNavProps) {
  return (
    <nav aria-label="관리자 섹션" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          aria-current={active === item.id ? "page" : undefined}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            active === item.id
              ? "border-primary bg-[hsl(var(--surface-2))] text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
