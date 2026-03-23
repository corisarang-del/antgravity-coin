import type { BattleTimeframe } from "@/domain/models/BattleTimeframe";

export const battleTimeframeOptions: Array<{
  value: BattleTimeframe;
  label: string;
  shortLabel: string;
  description: string;
  countdownSeconds: number;
}> = [
  {
    value: "5m",
    label: "5분 후",
    shortLabel: "5분",
    description: "초단기 캔들 반응",
    countdownSeconds: 6,
  },
  {
    value: "30m",
    label: "30분 후",
    shortLabel: "30분",
    description: "단기 흐름 확인",
    countdownSeconds: 8,
  },
  {
    value: "1h",
    label: "1시간 후",
    shortLabel: "1시간",
    description: "한 시간 추세 체크",
    countdownSeconds: 10,
  },
  {
    value: "4h",
    label: "4시간 후",
    shortLabel: "4시간",
    description: "스윙 전환 구간",
    countdownSeconds: 12,
  },
  {
    value: "24h",
    label: "24시간 후",
    shortLabel: "24시간",
    description: "일간 방향 확정",
    countdownSeconds: 14,
  },
  {
    value: "7d",
    label: "7일 후",
    shortLabel: "7일",
    description: "주간 흐름 비교",
    countdownSeconds: 18,
  },
];

export function getBattleTimeframeMeta(timeframe: BattleTimeframe) {
  return (
    battleTimeframeOptions.find((option) => option.value === timeframe) ?? battleTimeframeOptions[0]
  );
}

export function formatBattleTimeframeLabel(timeframe: BattleTimeframe) {
  return getBattleTimeframeMeta(timeframe).label;
}
