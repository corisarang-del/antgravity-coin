export function debugBattleLog(message: string) {
  if (process.env.DEBUG_BATTLE_LOGS === "true") {
    console.log(message);
  }
}
