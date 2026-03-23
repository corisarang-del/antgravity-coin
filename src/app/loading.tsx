export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
          <div className="h-4 w-24 rounded-full bg-[hsl(var(--surface-2))]" />
          <div className="mt-4 h-10 w-48 rounded-[18px] bg-[hsl(var(--surface-2))]" />
          <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-[hsl(var(--surface-2))]" />
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="h-60 rounded-[24px] border border-border bg-card shadow-[0_16px_32px_rgba(17,29,61,0.06)]" />
          <div className="h-60 rounded-[24px] border border-border bg-card shadow-[0_16px_32px_rgba(17,29,61,0.06)]" />
        </section>
      </main>
    </div>
  );
}
