import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";
import { MergeLocalStateClient } from "@/app/me/MergeLocalStateClient";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";

interface MePageProps {
  searchParams?: Promise<{
    battleId?: string;
  }>;
}

interface CharacterMemorySeedRow {
  id: string;
  character_name: string;
  was_correct: boolean;
  indicator_label: string;
  indicator_value: string;
  summary: string;
}

function firstOrNull<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function MePage({ searchParams }: MePageProps) {
  const params = await searchParams;
  const selectedBattleId = params?.battleId ?? null;
  const [supabase, initialCurrentUserSnapshot] = await Promise.all([
    createSupabaseServerClient(),
    getInitialCurrentUserSnapshot(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/me");
  }

  const [{ data: profile }, { data: progress }, { data: battles }, { data: selectedBattle }] =
    await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("battle_sessions")
        .select(
          `
          battle_id,
          coin_id,
          coin_symbol,
          selected_team,
          timeframe,
          settlement_at,
          status,
          battle_outcomes (
            winning_team,
            price_change_percent,
            user_won
          )
        `,
        )
        .eq("owner_user_id", user.id)
        .order("selected_at", { ascending: false })
        .limit(12),
      selectedBattleId
        ? supabase
            .from("battle_sessions")
            .select(
              `
              *,
              battle_outcomes (*),
              battle_snapshots (*),
              character_memory_seeds (*),
              player_decision_seeds (*)
            `,
            )
            .eq("owner_user_id", user.id)
            .eq("battle_id", selectedBattleId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email?.split("@")[0] ?? "사용자");
  const avatarUrl =
    profile?.avatar_url ||
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    "";
  const providerHints =
    (Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers) ||
    (user.app_metadata?.provider ? [user.app_metadata.provider] : []);

  const selectedOutcome = firstOrNull(selectedBattle?.battle_outcomes);
  const selectedSnapshot = firstOrNull(selectedBattle?.battle_snapshots);
  const selectedDecision = firstOrNull(selectedBattle?.player_decision_seeds);
  const selectedMemorySeeds = Array.isArray(selectedBattle?.character_memory_seeds)
    ? (selectedBattle.character_memory_seeds as CharacterMemorySeedRow[])
    : [];
  const selectedMessages = Array.isArray(selectedSnapshot?.messages_json)
    ? (selectedSnapshot.messages_json as DebateMessage[])
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
      <MergeLocalStateClient />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <section className="grid gap-4 rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_22px_50px_rgba(17,29,61,0.08)] md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
              내 계정
            </span>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <Image
                  alt={displayName}
                  className="h-14 w-14 rounded-full border border-border/80 object-cover"
                  height={56}
                  src={avatarUrl}
                  width={56}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-[hsl(var(--surface-2))] text-sm font-semibold text-muted-foreground">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="space-y-2">
                <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-none tracking-[-0.06em]">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  연결 계정: {providerHints.length > 0 ? providerHints.join(", ") : "email"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
              <p className="text-xs font-semibold text-muted-foreground">현재 레벨</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">
                Lv.{progress?.level ?? 1}
              </p>
            </div>
            <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
              <p className="text-xs font-semibold text-muted-foreground">누적 XP</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">
                {progress?.xp ?? 0}
              </p>
            </div>
            <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
              <p className="text-xs font-semibold text-muted-foreground">전적</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {progress?.wins ?? 0}승 {progress?.losses ?? 0}패
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_16px_36px_rgba(17,29,61,0.06)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">내 배틀 기록</h2>
              <p className="text-sm text-muted-foreground">
                최근 정산된 라운드와 진행 중인 라운드를 같이 보여줘.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {(battles ?? []).length === 0 ? (
              <div className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] px-4 py-4 text-sm text-muted-foreground">
                아직 저장된 배틀 기록이 없어. 로그인한 상태로 배틀을 진행하면 여기 쌓이기 시작해.
              </div>
            ) : (
              (battles ?? []).map((battle) => {
                const outcome = firstOrNull(battle.battle_outcomes);
                const timeframeMeta = getBattleTimeframeMeta(battle.timeframe);

                return (
                  <Link
                    key={battle.battle_id}
                    className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] px-4 py-4 transition hover:border-primary/30 hover:bg-card"
                    href={`/me?battleId=${battle.battle_id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{battle.coin_symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {timeframeMeta.label} · {battle.selected_team} · {battle.status}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{new Date(battle.settlement_at).toLocaleString("ko-KR")}</p>
                        <p>
                          {outcome?.price_change_percent != null
                            ? `${Number(outcome.price_change_percent).toFixed(2)}%`
                            : "정산 전"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {selectedBattle ? (
          <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_16px_36px_rgba(17,29,61,0.06)]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">선택한 배틀 상세</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedBattle.coin_symbol} · {getBattleTimeframeMeta(selectedBattle.timeframe).label}
                </p>
              </div>
              <Link
                className="rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground"
                href="/me"
              >
                상세 닫기
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-3">
                <div className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                  <p className="text-xs font-semibold text-muted-foreground">정산 요약</p>
                  <div className="mt-3 grid gap-2 text-sm text-foreground">
                    <p>선택 팀: {selectedBattle.selected_team}</p>
                    <p>정산 가격: {selectedBattle.settled_price ?? "미정"}</p>
                    <p>상태: {selectedBattle.status}</p>
                    <p>snapshotId: {selectedBattle.snapshot_id}</p>
                    <p>리포트 소스: {selectedOutcome?.report_json?.reportSource ?? "fallback"}</p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                  <p className="text-xs font-semibold text-muted-foreground">플레이어 선택</p>
                  <div className="mt-3 grid gap-2 text-sm text-foreground">
                    <p>진입 가격: {selectedDecision?.selected_price ?? "미정"}</p>
                    <p>정산 시각: {new Date(selectedBattle.settlement_at).toLocaleString("ko-KR")}</p>
                    <p>마켓 심볼: {selectedDecision?.market_symbol ?? selectedBattle.market_symbol}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">리포트</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {selectedOutcome?.report_json?.report ?? "아직 생성된 리포트가 없어."}
                </pre>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">토론 메시지</p>
                <div className="mt-3 grid gap-3">
                  {selectedMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">저장된 토론 메시지가 없어.</p>
                  ) : (
                    selectedMessages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-[18px] border border-border/80 bg-card px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{message.characterName}</p>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {message.team}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-foreground">{message.summary}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">Character Memory</p>
                <div className="mt-3 grid gap-3">
                  {selectedMemorySeeds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">저장된 character memory가 없어.</p>
                  ) : (
                    selectedMemorySeeds.map((seed) => (
                      <div
                        key={seed.id}
                        className="rounded-[18px] border border-border/80 bg-card px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{seed.character_name}</p>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {seed.was_correct ? "정답 적중" : "관점 보완"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {seed.indicator_label} · {seed.indicator_value}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-foreground">{seed.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
