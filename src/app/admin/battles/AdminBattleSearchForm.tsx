"use client";

import { useState } from "react";

interface AdminBattleSearchFormProps {
  initialBattleId: string;
}

export function AdminBattleSearchForm({
  initialBattleId,
}: AdminBattleSearchFormProps) {
  const [battleId, setBattleId] = useState(initialBattleId);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <label className="block text-sm font-semibold" htmlFor="battle-id-search">
        battleId 검색
      </label>
      <form className="mt-3 flex flex-wrap gap-3" method="GET">
        <input
          className="min-w-[18rem] flex-1 rounded-[16px] border border-input bg-background px-4 py-3 text-sm"
          id="battle-id-search"
          name="battleId"
          onChange={(event) => setBattleId(event.target.value)}
          placeholder="battleId를 입력"
          value={battleId}
        />
        <button
          className="inline-flex min-h-11 items-center rounded-[16px] bg-primary px-4 py-3 font-semibold text-primary-foreground"
          type="submit"
        >
          조회
        </button>
      </form>
    </section>
  );
}
