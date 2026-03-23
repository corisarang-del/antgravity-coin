import type { CharacterModelRoute } from "@/shared/constants/characterModelRoutes";
import { characterModelRoutes } from "@/shared/constants/characterModelRoutes";

const runtimeRouteOverrides = new Map<string, CharacterModelRoute>();

export function getRuntimeCharacterModelRoute(characterId: string) {
  return runtimeRouteOverrides.get(characterId) ?? characterModelRoutes[characterId];
}

export function setRuntimeCharacterModelRoute(route: CharacterModelRoute) {
  runtimeRouteOverrides.set(route.characterId, route);
}

export function listRuntimeCharacterModelRoutes() {
  return Object.keys(characterModelRoutes).map((characterId) =>
    getRuntimeCharacterModelRoute(characterId),
  );
}
