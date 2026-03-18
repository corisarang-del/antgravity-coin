export interface BattleResultApplication {
  battleId: string;
  userId: string;
  appliedAt: string;
}

export interface BattleResultApplicationRepository {
  hasApplied(battleId: string, userId: string): Promise<boolean>;
  markApplied(input: BattleResultApplication): Promise<void>;
}
