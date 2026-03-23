import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";

const characterLessonRules = [
  "aira: lesson은 RSI, 추세, 거래량 같은 기술 근거 중심으로만 써. 금지어: 뉴스, 공시, 커뮤니티",
  "judy: lesson은 뉴스, 일정, 공시, 정책 변화 중심으로만 써. 금지어: RSI, MACD, 볼린저",
  "clover: lesson은 공포탐욕, 심리, 커뮤니티 분위기 중심으로만 써. 금지어: MACD, 볼린저, 추세선",
  "blaze: lesson은 돌파, 속도감, 거래량, 모멘텀 중심으로만 써. 금지어: 정책 변화, 커뮤니티 여론",
  "ledger: lesson은 자금 흐름, 수급, 온체인 체력 중심으로만 써. 금지어: RSI, MACD",
  "shade: lesson은 리스크 관리, 손실 방어, 과열 경고 중심으로만 써. 금지어: 무조건 상승, 확실한 폭등",
  "vela: lesson은 고래 자금, 큰 손 움직임, 방향 신호 중심으로만 써. 금지어: RSI, MACD, 볼린저",
  "flip: lesson은 역발상, 과열 반전, 쏠림 해소 중심으로만 써. 금지어: 추세 추종, 돌파 매수",
] as const;

export function buildSynthesisPrompt(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
}) {
  return [
    "너는 최종 결과를 취합하는 리포트 작성자야.",
    "이미 계산된 승패를 바꾸지 말고, 근거를 정리해서 플레이어용 보고서를 써.",
    `배틀: ${input.battleOutcomeSeed.coinSymbol} ${input.battleOutcomeSeed.timeframe}`,
    `승리 팀: ${input.battleOutcomeSeed.winningTeam}`,
    `플레이어 선택: ${input.playerDecisionSeed.selectedTeam}`,
    `플레이어 결과: ${input.playerDecisionSeed.userWon ? "성공" : "실패"}`,
    `가장 강한 승리 근거: ${input.battleOutcomeSeed.strongestWinningArgument}`,
    `가장 약한 패배 근거: ${input.battleOutcomeSeed.weakestLosingArgument}`,
    `캐릭터 메모: ${input.characterMemorySeeds.map((seed) => `${seed.characterName}:${seed.summary}`).join(" | ")}`,
    "출력은 일반 텍스트 report만 작성해.",
  ].join("\n");
}

export function buildLessonSynthesisPrompt(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
  report: string;
}) {
  return [
    "너는 배틀 보고서를 다음 토론에서 재사용할 수 있는 lesson JSON으로 바꾸는 분석가야.",
    "중요 규칙:",
    "- 현재 배틀의 승패를 바꾸지 마.",
    "- 현재 배틀의 결과를 다음 배틀의 정답처럼 말하지 마.",
    "- lesson은 참고 메모여야 하고, 현재 실데이터보다 우선하면 안 돼.",
    "- 추상적인 조언 대신, 다음 토론에서 바로 참고할 수 있는 짧은 교훈만 남겨.",
    "- globalLessons는 3개 이상 4개 이하로 작성해.",
    "- characterLessons는 캐릭터마다 1개씩, 총 8개를 작성해.",
    "- 각 lesson은 1문장, 최대 90자 안으로 짧고 구체적으로 써.",
    "- wasCorrect는 제공된 값을 그대로 유지해.",
    "- output은 JSON 하나만 반환해. 설명 문장, 마크다운, 코드펜스 금지.",
    "- reportSummary는 1문장, 최대 120자 안으로 써.",
    "캐릭터별 제약:",
    ...characterLessonRules,
    `배틀: ${input.battleOutcomeSeed.coinSymbol} ${input.battleOutcomeSeed.timeframe}`,
    `승리 팀: ${input.battleOutcomeSeed.winningTeam}`,
    `플레이어 선택: ${input.playerDecisionSeed.selectedTeam}`,
    `플레이어 결과: ${input.playerDecisionSeed.userWon ? "성공" : "실패"}`,
    `가장 강한 승리 근거: ${input.battleOutcomeSeed.strongestWinningArgument}`,
    `가장 약한 패배 근거: ${input.battleOutcomeSeed.weakestLosingArgument}`,
    `최종 리포트: ${input.report}`,
    `캐릭터 메모: ${input.characterMemorySeeds.map((seed) => `${seed.characterId}|${seed.characterName}|${seed.wasCorrect ? "correct" : "wrong"}|${seed.summary}`).join(" || ")}`,
    "JSON 스키마:",
    '{"reportSummary":"","globalLessons":[""],"characterLessons":[{"characterId":"","characterName":"","lesson":"","wasCorrect":true}]}',
  ].join("\n");
}
