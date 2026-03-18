import Link from "next/link";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";

interface AdminBattleEventLogProps {
  battleId: string;
  page: number;
}

const PAGE_SIZE = 20;

export async function AdminBattleEventLog({ battleId, page }: AdminBattleEventLogProps) {
  const eventLog = new FileEventLog();
  const events = await eventLog.listByBattleId(battleId);
  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleEvents = events.slice(startIndex, startIndex + PAGE_SIZE);
  const visibleStart = visibleEvents.length > 0 ? startIndex + 1 : 0;
  const visibleEnd = visibleEvents.length > 0 ? startIndex + visibleEvents.length : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Event Log</h3>
        <p className="text-xs text-muted-foreground">
          {events.length}개 중 {visibleStart}-{visibleEnd}
        </p>
      </div>
      <div className="mt-3 grid gap-2">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-[16px] bg-[hsl(var(--surface-2))] px-4 py-3 text-sm"
          >
            <p className="font-semibold">{event.type}</p>
            <p className="text-muted-foreground">{event.createdAt}</p>
            {event.payload ? (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            ) : null}
          </div>
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            aria-disabled={currentPage === 1}
            className={`inline-flex min-h-10 items-center rounded-[14px] px-4 py-2 text-sm font-semibold ${
              currentPage === 1
                ? "pointer-events-none border border-border/60 bg-[hsl(var(--surface-2))] text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            href={`/admin/battles?battleId=${encodeURIComponent(battleId)}&eventPage=${Math.max(currentPage - 1, 1)}`}
          >
            이전
          </Link>
          <p className="text-xs text-muted-foreground">
            {currentPage} / {totalPages}
          </p>
          <Link
            aria-disabled={currentPage === totalPages}
            className={`inline-flex min-h-10 items-center rounded-[14px] px-4 py-2 text-sm font-semibold ${
              currentPage === totalPages
                ? "pointer-events-none border border-border/60 bg-[hsl(var(--surface-2))] text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            href={`/admin/battles?battleId=${encodeURIComponent(battleId)}&eventPage=${Math.min(currentPage + 1, totalPages)}`}
          >
            다음
          </Link>
        </div>
      ) : null}
    </div>
  );
}
