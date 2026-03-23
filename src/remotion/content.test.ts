import { describe, expect, it } from "vitest";
import {
  getCompositionById,
  getPromoDurationInFrames,
  promoAudio,
  promoClosing,
  promoCompositions,
  promoFeaturedCharacters,
  promoHighlights,
  promoHooks,
  promoMeta,
  promoScenes,
} from "@/remotion/content";

describe("ant gravity promo content", () => {
  it("씬 길이 합계가 7초로 고정된다", () => {
    expect(getPromoDurationInFrames()).toBe(210);
    expect(getPromoDurationInFrames() / promoMeta.fps).toBe(7);
  });

  it("후킹 카피와 마무리 카피가 비어 있지 않다", () => {
    expect(promoHooks).toHaveLength(3);
    expect(promoHighlights).toHaveLength(3);
    expect(promoClosing.headline.length).toBeGreaterThan(0);
    expect(promoClosing.cta.length).toBeGreaterThan(0);
  });

  it("배경음악과 효과음 자산 경로가 정의돼 있다", () => {
    expect(promoAudio.backgroundMusic.endsWith(".wav")).toBe(true);
    expect(promoAudio.whooshHit.endsWith(".wav")).toBe(true);
    expect(promoAudio.bassDrop.endsWith(".wav")).toBe(true);
    expect(promoAudio.outroRise.endsWith(".wav")).toBe(true);
  });

  it("가로, 숏폼, 확장판 composition 설정이 모두 있다", () => {
    expect(promoCompositions).toHaveLength(3);
    expect(getCompositionById("AntGravityPromo")?.durationInFrames).toBe(210);
    expect(getCompositionById("AntGravityPromoShorts")?.height).toBe(1920);
    expect(getCompositionById("AntGravityPromoExtended")?.durationInFrames).toBe(450);
  });

  it("8명 캐릭터 라인업을 그대로 사용한다", () => {
    expect(promoFeaturedCharacters).toHaveLength(8);
    expect(new Set(promoFeaturedCharacters.map((character) => character.id)).size).toBe(8);
  });

  it("씬 순서가 훅, 라인업, 배틀, CTA로 유지된다", () => {
    expect(promoScenes.map((scene) => scene.id)).toEqual(["hook", "lineup", "battle", "cta"]);
  });
});
