interface TeamSummaryCardProps {
  title: string;
  points: string[];
  team: "bull" | "bear";
}

const defaultPoints = {
  bull: [
    "상승 여력이 남았는지, 방어 근거가 있는지 먼저 봐.",
    "단기 변동성보다 추세 유지와 매수 논리의 밀도를 체크해.",
    "뉴스와 지표가 같은 방향인지 확인하고 선택해.",
  ],
  bear: [
    "과열과 되돌림 신호가 얼마나 강한지 먼저 봐.",
    "리스크 지표와 청산 압력이 실제 조정으로 이어질지 체크해.",
    "지금 상승이 체력인지 기대감인지 구분하고 선택해.",
  ],
};

export function TeamSummaryCard({ title, points, team }: TeamSummaryCardProps) {
  const visiblePoints = points.length > 0 ? points : defaultPoints[team];

  return (
    <article className="rounded-[24px] border border-border bg-card p-5">
      <h2 className={`font-display text-2xl font-bold tracking-[-0.04em] ${team === "bull" ? "text-bull" : "text-bear"}`}>
        {title}
      </h2>
      <p className="ag-body-copy mt-2 text-muted-foreground">
        {team === "bull"
          ? "상승 근거가 더 설득력 있다고 느껴지면 불리시 팀을 골라."
          : "조정과 하락 리스크가 더 크다고 느껴지면 베어리시 팀을 골라."}
      </p>
      <ul className="ag-body-copy mt-4 grid gap-3 text-muted-foreground">
        {visiblePoints.map((point) => (
          <li key={point} className="rounded-[16px] bg-[hsl(var(--surface-2))] px-4 py-3">
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}
