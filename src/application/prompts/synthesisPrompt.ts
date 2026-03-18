import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";

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
    "- lesson은 '참고 메모'여야 하고, 현재 실데이터보다 우선하면 안 돼.",
    "- 전부 차트 이야기로 몰지 말고, 캐릭터 역할에 맞는 lesson을 남겨.",
    "- globalLessons는 3개 이상 4개 이하로 작성해.",
    "- characterLessons는 캐릭터마다 1개씩, 총 8개를 작성해.",
    "- 각 lesson은 1~2문장, 최대 110자 안으로 짧고 구체적으로 써.",
    "- wasCorrect는 제공된 값을 그대로 유지해.",
    "- output은 JSON 하나만 반환해. 설명 문장, 마크다운, 코드펜스 금지.",
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
