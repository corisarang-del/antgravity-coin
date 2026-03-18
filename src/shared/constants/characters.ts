import { toCharacterApiResponse } from "@/features/characters/api";
import { characterCatalog } from "@/features/characters/catalog";
import type { Character, CharacterCatalogEntry, Team } from "@/features/characters/types";

const characterCopyOverrides: Record<
  string,
  Pick<CharacterCatalogEntry, "role" | "specialty" | "personality" | "selectionReason">
> = {
  aira: {
    role: "기술분석가",
    specialty: "RSI, 추세선, 거래량 패턴 해석",
    personality:
      "차분하고 끈기 있게 차트를 읽는 타입이야. 캔들 패턴과 지지저항, 거래량 같은 기본기를 믿고 성급하게 결론 내리지 않아.",
    selectionReason:
      "정제된 정면 구도와 집중하는 시선이 냉정하게 차트를 읽는 분석가 이미지와 잘 맞았어. 과장 없이 신뢰감을 주는 분위기가 기술분석가 역할에 어울려.",
  },
  judy: {
    role: "뉴스 스카우터",
    specialty: "공시, 일정, 정책 변화 해석",
    personality:
      "눈앞 차트보다 먼저 재료를 보는 타입이야. 헤드라인만 보지 않고 일정, 인터뷰, 공시, 정책 변화까지 연결해서 읽어내.",
    selectionReason:
      "정보를 관찰하고 빠르게 정리하는 인상이 강해서, 뉴스와 이벤트를 먼저 포착하는 캐릭터로 자연스럽게 이어졌어.",
  },
  clover: {
    role: "심리 센티먼트 분석가",
    specialty: "공포탐욕지수와 커뮤니티 온도 감지",
    personality:
      "시장 분위기와 군중 심리를 빠르게 감지하는 공감형이야. 커뮤니티의 기대, 공포, 과열감 같은 정서를 세밀하게 읽어.",
    selectionReason:
      "감정 반응을 섬세하게 읽는 표정과 부드러운 분위기가 군중 심리의 미세한 변화를 읽는 역할과 잘 맞았어.",
  },
  blaze: {
    role: "모멘텀 트레이더",
    specialty: "돌파 구간, 속도감 있는 추세 포착",
    personality:
      "속도와 타이밍을 중시하는 돌파형이야. 추세가 붙는 순간을 빠르게 감지하고, 흐름이 꺾이면 미련 없이 다음 기회를 봐.",
    selectionReason:
      "강한 채도와 공격적인 에너지가 즉시성을 중시하는 모멘텀 트레이더 캐릭터에 잘 어울렸어.",
  },
  ledger: {
    role: "온체인 분석가",
    specialty: "지갑 이동, 거래소 입출금, 대형 자금 추적",
    personality:
      "조용하지만 숫자에는 집요해. 자금 흐름과 거래소 입출금, 큰 손의 방향이 실제 가격과 어떻게 이어지는지 끝까지 확인해.",
    selectionReason:
      "차분한 존재감과 단단한 인상이 보이지 않는 대형 자금 흐름을 추적하는 온체인 분석가 이미지와 잘 맞았어.",
  },
  shade: {
    role: "리스크 매니저",
    specialty: "손절 시나리오, 변동성 경고, 방어 전략",
    personality:
      "항상 최악의 경우를 먼저 계산하는 경계형이야. 기대보다 손실 상한을 우선하고, 위험이 커지면 바로 강도를 낮춰.",
    selectionReason:
      "냉정하고 절제된 분위기가 리스크를 먼저 경고하고 방어선을 세우는 캐릭터와 잘 맞았어.",
  },
  vela: {
    role: "고래 추적자",
    specialty: "대형 자금 이동, 숨은 신호 감시",
    personality:
      "멀리서 큰 흐름을 먼저 감지하는 관찰자야. 작은 소음보다 큰 자금과 방향 신호, 숨어 있는 움직임을 추적해.",
    selectionReason:
      "차분하지만 예리한 인상이 보이지 않는 자금 흐름을 읽는 고래 추적자 캐릭터에 잘 어울렸어.",
  },
  flip: {
    role: "역발상 전략가",
    specialty: "과열 구간 반전 신호 포착",
    personality:
      "모두가 같은 방향을 볼 때 반대편 가능성을 먼저 보는 반전형이야. 과열 구간에서는 식는 순간을, 공포 구간에서는 기회를 찾아.",
    selectionReason:
      "강한 시선과 도발적인 분위기가 군중 심리의 빈틈을 파고드는 역발상 캐릭터에 잘 맞았어.",
  },
};

function buildImageVersion(sourceImageName: string) {
  return sourceImageName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-12)
    .toLowerCase();
}

function buildCharacter(entry: CharacterCatalogEntry): Character {
  const imageVersion = buildImageVersion(entry.sourceImageName);
  const imageSrc = `/characters/${entry.imageFileName}?v=${imageVersion}`;
  const copyOverride = characterCopyOverrides[entry.id];

  return {
    ...entry,
    ...copyOverride,
    imageSrc,
    posterSrc: imageSrc,
    previewSrc: imageSrc,
  };
}

export const characters: Character[] = characterCatalog.map(buildCharacter);

export function getCharacterById(id: string) {
  return characters.find((character) => character.id === id) ?? null;
}

export function getCharacterApiSeed() {
  return toCharacterApiResponse(characters);
}

export type { Character, CharacterCatalogEntry, Team };
