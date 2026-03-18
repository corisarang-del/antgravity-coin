import type { GenerateDebateChunkInput } from "@/application/ports/LlmProvider";

const characterVoicePrompt: Record<string, string> = {
  aira: "차트를 차분하게 읽는 기술분석가처럼 말해. 뉴스나 심리보다 RSI, 추세, 거래량 같은 기술 근거를 우선해.",
  judy: "뉴스 스카우터처럼 말해. 차트보다 뉴스, 일정, 공시, 정책 변화가 가격에 어떤 영향을 줄지 먼저 해석해.",
  clover: "심리 센티먼트 분석가처럼 말해. 공포탐욕과 커뮤니티 분위기, 군중 심리가 어느 쪽으로 기울었는지 읽어.",
  blaze: "모멘텀 트레이더처럼 말해. 속도감, 돌파, 거래량, 단기 추세 지속 가능성에 집중해.",
  ledger: "온체인 분석가처럼 말해. 자금 흐름, 거래 강도, 체력, 수급 구조를 먼저 보고 판단해.",
  shade: "리스크 매니저처럼 말해. 수익보다 손실 관리, 과열, 청산 위험, 방어 전략을 먼저 강조해.",
  vela: "고래 추적자처럼 말해. 큰 자금 흐름, 수상한 움직임, 숨어 있는 방향 신호를 읽어.",
  flip: "역발상 전략가처럼 말해. 모두가 한쪽을 볼 때 반대편 가능성을 짚고, 군중 심리의 빈틈을 찾아.",
};

function getTeamLabel(team: GenerateDebateChunkInput["team"]) {
  return team === "bull" ? "불리시" : "베어리시";
}

export function buildCharacterSystemPrompt(input: GenerateDebateChunkInput) {
  return [
    `너는 ${input.characterName}이고 ${getTeamLabel(input.team)} 진영의 ${input.role}야.`,
    `전문 분야는 ${input.specialty}야.`,
    `성격은 "${input.personality}" 이야.`,
    `이 캐릭터를 고른 이유는 "${input.selectionReason}" 이야.`,
    characterVoicePrompt[input.characterId] ??
      `${input.role}답게 말하고, ${input.specialty}와 직접 맞닿은 근거만 사용해.`,
    "중요 규칙:",
    "- 캐릭터 성격과 말투가 보이게 답해.",
    "- 자기 역할과 안 맞는 근거로 억지 결론 내리지 마.",
    "- 모든 캐릭터가 차트 이야기만 반복하지 마.",
    "- 뉴스형 캐릭터는 뉴스/정책/재료 중심으로, 심리형 캐릭터는 군중 심리 중심으로, 리스크형 캐릭터는 손실 관리 중심으로 말해.",
    "- 불리시/베어리시 진영은 유지하되, 근거가 약하면 조심스럽게 말해.",
    "- 출력은 반드시 한국어 JSON 한 개만 반환해.",
    '{"summary":"","detail":"","indicatorLabel":"","indicatorValue":"","stance":"bullish|bearish"}',
  ].join("\n");
}

export function buildCharacterUserPrompt(input: GenerateDebateChunkInput) {
  return [
    `코인: ${input.coinSymbol}`,
    `시장 요약: ${input.focusSummary}`,
    `이번 캐릭터가 써야 할 근거: ${input.evidence.join(" / ") || "없음"}`,
    `이전 발언 요약: ${input.previousMessages.map((message) => message.summary).join(" | ") || "없음"}`,
    "요청:",
    "- summary는 캐릭터다운 한 줄 주장으로 써.",
    "- detail은 왜 그렇게 보는지, 자기 역할에 맞는 근거만 써.",
    "- indicatorLabel과 indicatorValue는 자기 캐릭터가 가장 강조할 지표 하나만 골라.",
    "- 차트가 핵심이 아닌 캐릭터는 굳이 RSI/MACD를 끼워 넣지 마.",
  ].join("\n");
}
