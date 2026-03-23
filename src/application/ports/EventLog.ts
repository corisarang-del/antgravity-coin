export interface EventLogEntry<TPayload = Record<string, unknown>> {
  id: string;
  battleId: string;
  userId?: string;
  type: string;
  createdAt: string;
  payload: TPayload;
}

export interface EventLog {
  append<TPayload = Record<string, unknown>>(entry: EventLogEntry<TPayload>): Promise<void>;
  list(): Promise<EventLogEntry[]>;
  listByBattleId?(battleId: string): Promise<EventLogEntry[]>;
}
