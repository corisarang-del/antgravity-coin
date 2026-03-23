import { characters } from "../shared/constants/characters";

export interface PromoScene {
  id: string;
  title: string;
  durationInFrames: number;
}

export interface PromoCompositionMeta {
  id: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
}

export const promoMeta = {
  compositionId: "AntGravityPromo",
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

export const promoScenes: PromoScene[] = [
  { id: "hook", title: "훅", durationInFrames: 45 },
  { id: "lineup", title: "라인업", durationInFrames: 60 },
  { id: "battle", title: "배틀", durationInFrames: 60 },
  { id: "cta", title: "콜투액션", durationInFrames: 45 },
];

export const promoHooks = [
  "망설이는 3초에, 기회는 이미 반대편으로 튄다.",
  "시장 소음에 휘둘리면, 네 돈은 군중의 먹잇감이 된다.",
  "그래서 앤트그래비티는 AI 8명을 같은 코인 위에 던져 넣는다.",
] as const;

export const promoHighlights = [
  "기술, 뉴스, 온체인, 심리, 리스크, 고래 흐름까지 전부 충돌시킨다.",
  "Bull과 Bear가 동시에 달려들고, 너는 마지막 한쪽만 고르면 된다.",
  "토론은 실시간으로 터지고, 결과는 XP와 함께 네 기록으로 남는다.",
] as const;

export const promoClosing = {
  kicker: "눈치 보지 마.",
  headline: "AI 8명의 전투를 네 선택으로 끝내.",
  subheadline: "Ant Gravity Coin",
  cta: "한 번의 선택으로 시장 감각을 증명해.",
} as const;

export const promoAudio = {
  backgroundMusic: "audio/ant-gravity-promo-bgm.wav",
  whooshHit: "audio/ant-gravity-promo-whoosh.wav",
  bassDrop: "audio/ant-gravity-promo-drop.wav",
  outroRise: "audio/ant-gravity-promo-rise.wav",
  narrationWide: "audio/ant-gravity-narration-wide.wav",
  narrationShorts: "audio/ant-gravity-narration-shorts.wav",
  narrationExtended: "audio/ant-gravity-narration-extended.wav",
} as const;

export const promoNarration = {
  wide: [
    "망설이는 사이 기회는 이미 반대편으로 튄다.",
    "앤트그래비티는 AI 여덟 명을 같은 코인 위에 올려붙인다.",
    "실시간 토론이 터지고, 마지막 선택은 네가 끝낸다.",
  ],
  shorts: [
    "한 코인. AI 여덟 명.",
    "Bull과 Bear가 동시에 물어뜯는다.",
    "마지막 선택은 네가 한다.",
  ],
  extended: [
    "망설이는 사이, 시장은 이미 다음 사람 편으로 넘어간다.",
    "차트만 보는 순간 놓치고, 뉴스만 보면 늦는다.",
    "앤트그래비티는 기술, 뉴스, 온체인, 심리, 리스크, 고래 흐름까지 한 판에 붙인다.",
    "AI 여덟 명이 동시에 토론하고, 실시간으로 서로를 깨부순다.",
    "너는 구경만 하지 않는다. 마지막에 직접 고르고, 결과와 XP로 남긴다.",
    "시장 감각, 이제 말로 말고 선택으로 증명해.",
  ],
} as const;

export const promoCompositions: PromoCompositionMeta[] = [
  {
    id: "AntGravityPromo",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 210,
  },
  {
    id: "AntGravityPromoShorts",
    fps: 30,
    width: 1080,
    height: 1920,
    durationInFrames: 270,
  },
  {
    id: "AntGravityPromoExtended",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 450,
  },
];

export const promoFeaturedCharacters = characters.map((character) => ({
  id: character.id,
  name: character.name,
  team: character.team,
  imageSrc: `characters/${character.id}.webp`,
}));

export function getPromoDurationInFrames() {
  return promoScenes.reduce((total, scene) => total + scene.durationInFrames, 0);
}

export function getCompositionById(id: string) {
  return promoCompositions.find((composition) => composition.id === id) ?? null;
}
