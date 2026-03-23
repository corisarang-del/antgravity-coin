export function RiskDisclaimer() {
  return (
    <section className="rounded-[20px] border border-[hsl(var(--bear)/0.18)] bg-[hsl(var(--highlight-soft))] p-4 text-sm leading-6 text-muted-foreground">
      <p className="font-semibold text-foreground">투자 조언 아님</p>
      <p>
        이 화면은 학습과 비교를 위한 참고 정보야. 실제 매수·매도 판단과 책임은 본인에게 있고,
        GPS 같은 민감 정보는 저장하지 않아.
      </p>
    </section>
  );
}
