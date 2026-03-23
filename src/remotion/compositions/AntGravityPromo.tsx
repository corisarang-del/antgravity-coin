import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  promoAudio,
  promoClosing,
  promoFeaturedCharacters,
  promoHighlights,
  promoHooks,
} from "../content";
import wideNarration from "../generated/wide-narration.json";
import shortsNarration from "../generated/shorts-narration.json";
import extendedNarration from "../generated/extended-narration.json";

const palette = {
  ink: "#050816",
  deep: "#09142b",
  cyan: "#4ef2ff",
  rose: "#ff5a7a",
  gold: "#ffd166",
  white: "#f8fbff",
} as const;

interface NarrationSegment {
  index: number;
  text: string;
  startMs: number;
  endMs: number;
}

interface NarrationTimingData {
  durationMs: number;
  segments: NarrationSegment[];
}

function clampInterpolate(frame: number, input: [number, number], output: [number, number]) {
  return interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function GridBackground() {
  const frame = useCurrentFrame();
  const drift = clampInterpolate(frame, [0, 450], [0, -160]);

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(78,242,255,0.24), transparent 30%), radial-gradient(circle at 80% 18%, rgba(255,90,122,0.24), transparent 26%), linear-gradient(135deg, #050816 0%, #09142b 55%, #02040c 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          transform: `translateY(${drift}px)`,
          opacity: 0.18,
        }}
      />
    </>
  );
}

function AudioBed({
  bassDropFrom,
  narrationSrc,
  outroRiseFrom,
}: {
  bassDropFrom: number;
  narrationSrc: string;
  outroRiseFrom: number;
}) {
  const frame = useCurrentFrame();

  return (
    <>
      <Audio
        src={staticFile(promoAudio.backgroundMusic)}
        volume={clampInterpolate(frame, [0, 20], [0, 0.22])}
      />
      <Audio src={staticFile(narrationSrc)} volume={0.96} />
      <Sequence durationInFrames={22} from={0}>
        <Audio src={staticFile(promoAudio.whooshHit)} volume={0.75} />
      </Sequence>
      <Sequence durationInFrames={30} from={bassDropFrom}>
        <Audio src={staticFile(promoAudio.bassDrop)} volume={0.9} />
      </Sequence>
      <Sequence durationInFrames={36} from={outroRiseFrom}>
        <Audio src={staticFile(promoAudio.outroRise)} volume={0.8} />
      </Sequence>
    </>
  );
}

function TimedNarrationCaption({
  align = "center",
  bottom = 96,
  data,
}: {
  align?: "left" | "center";
  bottom?: number;
  data: NarrationTimingData;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const segment = data.segments.find((item) => currentMs >= item.startMs && currentMs < item.endMs);

  if (!segment) {
    return null;
  }

  const opacity = clampInterpolate(frame, [Math.max(frame - 8, 0), frame], [0.82, 1]);
  const y = clampInterpolate(frame, [Math.max(frame - 8, 0), frame], [14, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? 120 : 84,
        right: align === "center" ? 120 : 540,
        bottom,
        padding: "14px 22px",
        borderRadius: 24,
        background: "rgba(4,7,18,0.72)",
        border: "1px solid rgba(255,255,255,0.14)",
        color: palette.white,
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.3,
        textAlign: align,
        opacity,
        transform: `translateY(${y}px)`,
        boxShadow: "0 18px 44px rgba(0,0,0,0.28)",
        backdropFilter: "blur(10px)",
      }}
    >
      {segment.text}
    </div>
  );
}

function HookScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headlineOpacity = clampInterpolate(frame, [0, 10], [0, 1]);
  const headlineY = clampInterpolate(frame, [0, 14], [50, 0]);
  const pulse = 1 + spring({ fps, frame, config: { damping: 14, stiffness: 90 } }) * 0.04;

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "120px 140px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
        <div
          style={{
            color: palette.cyan,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
          }}
        >
          MARKET ENTERTAINMENT
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transform: `scale(${pulse})`,
            transformOrigin: "left center",
          }}
        >
          {promoHooks.map((line, index) => {
            const start = index * 10;
            const opacity = clampInterpolate(frame, [start, start + 8], [0, 1]);
            const x = clampInterpolate(frame, [start, start + 8], [80, 0]);

            return (
              <div
                key={line}
                style={{
                  color: index === 0 ? palette.white : index === 1 ? palette.gold : palette.rose,
                  fontSize: index === 2 ? 82 : 92,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  opacity,
                  transform: `translateX(${x}px)`,
                  textShadow: "0 10px 40px rgba(0,0,0,0.35)",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CharacterCard({
  imageSrc,
  name,
  team,
  index,
}: {
  imageSrc: string;
  name: string;
  team: "bull" | "bear";
  index: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entered = spring({
    fps,
    frame: Math.max(frame - index * 3, 0),
    config: { damping: 13, stiffness: 110 },
  });
  const opacity = clampInterpolate(frame - index * 3, [0, 8], [0, 1]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 34,
        border: `1px solid ${team === "bull" ? "rgba(78,242,255,0.4)" : "rgba(255,90,122,0.35)"}`,
        background:
          team === "bull"
            ? "linear-gradient(180deg, rgba(78,242,255,0.16), rgba(5,8,22,0.9))"
            : "linear-gradient(180deg, rgba(255,90,122,0.16), rgba(5,8,22,0.9))",
        boxShadow: "0 26px 60px rgba(0,0,0,0.32)",
        opacity,
        transform: `translateY(${(1 - entered) * 60}px) scale(${0.9 + entered * 0.1})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.18), transparent 38%), linear-gradient(180deg, transparent 0%, rgba(2,4,12,0.08) 46%, rgba(2,4,12,0.82) 100%)",
          zIndex: 1,
        }}
      />
      <Img
        src={staticFile(imageSrc)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 18,
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ color: palette.white, fontSize: 26, fontWeight: 800 }}>{name}</div>
          <div
            style={{
              color: team === "bull" ? palette.cyan : palette.rose,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.2em",
            }}
          >
            {team.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

function LineupScene() {
  const frame = useCurrentFrame();
  const titleOpacity = clampInterpolate(frame, [0, 10], [0, 1]);
  const titleY = clampInterpolate(frame, [0, 10], [28, 0]);

  return (
    <AbsoluteFill style={{ padding: "100px 110px 84px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          marginBottom: 34,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ color: palette.gold, fontSize: 26, fontWeight: 800, letterSpacing: "0.22em" }}>
          8 AI ANALYSTS
        </div>
        <div style={{ color: palette.white, fontSize: 88, fontWeight: 900, letterSpacing: "-0.05em" }}>
          한 코인, 여덟 개의 이빨.
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 22,
          flex: 1,
        }}
      >
        {promoFeaturedCharacters.map((character, index) => (
          <CharacterCard
            key={character.id}
            imageSrc={character.imageSrc}
            index={index}
            name={character.name}
            team={character.team}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function BattleScene() {
  return (
    <AbsoluteFill style={{ padding: "110px 120px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 220px 1.2fr",
          gap: 34,
          flex: 1,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            borderRadius: 42,
            border: "1px solid rgba(78,242,255,0.34)",
            background: "linear-gradient(180deg, rgba(78,242,255,0.16), rgba(5,8,22,0.92))",
            padding: "40px 42px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ color: palette.cyan, fontSize: 32, fontWeight: 900, letterSpacing: "0.2em" }}>
            BULL
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {promoHighlights.slice(0, 2).map((line) => (
              <div
                key={line}
                style={{
                  color: palette.white,
                  fontSize: 42,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.04em",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.22)",
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.white,
              fontSize: 68,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            }}
          >
            VS
          </div>
        </div>
        <div
          style={{
            borderRadius: 42,
            border: "1px solid rgba(255,90,122,0.34)",
            background: "linear-gradient(180deg, rgba(255,90,122,0.16), rgba(5,8,22,0.92))",
            padding: "40px 42px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ color: palette.rose, fontSize: 32, fontWeight: 900, letterSpacing: "0.2em" }}>
            BEAR
          </div>
          <div
            style={{
              color: palette.white,
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.05em",
            }}
          >
            {promoHighlights[2]}
          </div>
          <div style={{ color: "rgba(248,251,255,0.72)", fontSize: 26, lineHeight: 1.4, fontWeight: 600 }}>
            시장을 읽는 척하는 서비스 말고, 시장을 때려서 답을 뽑아내는 서비스.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ClosingScene() {
  const frame = useCurrentFrame();
  const headlineScale = 0.92 + clampInterpolate(frame, [0, 20], [0, 0.08]);
  const opacity = clampInterpolate(frame, [0, 12], [0, 1]);
  const glow = clampInterpolate(frame, [0, 45], [0.35, 0.7]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "120px 160px" }}>
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(78,242,255,${glow}) 0%, rgba(78,242,255,0.1) 32%, transparent 64%)`,
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
          opacity,
        }}
      >
        <div style={{ color: palette.gold, fontSize: 30, fontWeight: 800, letterSpacing: "0.26em" }}>
          {promoClosing.kicker}
        </div>
        <div
          style={{
            color: palette.white,
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.06em",
            transform: `scale(${headlineScale})`,
            textShadow: "0 18px 48px rgba(0,0,0,0.4)",
          }}
        >
          {promoClosing.headline}
        </div>
        <div style={{ color: palette.cyan, fontSize: 36, fontWeight: 700, letterSpacing: "0.34em" }}>
          {promoClosing.subheadline.toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 16,
            padding: "18px 34px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.08)",
            color: palette.white,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {promoClosing.cta}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function WidePromo() {
  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}>
      <GridBackground />
      <AudioBed
        bassDropFrom={42}
        narrationSrc={promoAudio.narrationWide}
        outroRiseFrom={162}
      />
      <Sequence durationInFrames={45} from={0}>
        <HookScene />
      </Sequence>
      <Sequence durationInFrames={60} from={45}>
        <LineupScene />
      </Sequence>
      <Sequence durationInFrames={60} from={105}>
        <BattleScene />
      </Sequence>
      <Sequence durationInFrames={45} from={165}>
        <ClosingScene />
      </Sequence>
      <TimedNarrationCaption align="left" data={wideNarration as NarrationTimingData} />
    </AbsoluteFill>
  );
}

function ShortsScene({
  title,
  subtitle,
  from,
  durationInFrames,
}: {
  title: string;
  subtitle: string;
  from: number;
  durationInFrames: number;
}) {
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "140px 72px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ color: palette.gold, fontSize: 28, fontWeight: 800, letterSpacing: "0.18em" }}>
            ANT GRAVITY COIN
          </div>
          <div
            style={{
              color: palette.white,
              fontSize: 102,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "rgba(248,251,255,0.8)",
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        </div>
      </AbsoluteFill>
    </Sequence>
  );
}

function ShortsCards() {
  return (
    <AbsoluteFill style={{ padding: "180px 58px 220px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18, flex: 1 }}>
        {promoFeaturedCharacters.map((character, index) => (
          <CharacterCard
            key={character.id}
            imageSrc={character.imageSrc}
            index={index}
            name={character.name}
            team={character.team}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ExtendedStatsScene() {
  return (
    <AbsoluteFill style={{ padding: "110px 120px" }}>
      <div style={{ display: "flex", gap: 24, flexDirection: "column" }}>
        <div style={{ color: palette.gold, fontSize: 28, fontWeight: 800, letterSpacing: "0.18em" }}>
          WHY IT HITS
        </div>
        <div style={{ color: palette.white, fontSize: 92, fontWeight: 900, letterSpacing: "-0.06em" }}>
          차트만 보면 늦고,
          <br />
          뉴스만 보면 흔들린다.
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          marginTop: 56,
        }}
      >
        {["기술", "뉴스", "온체인", "심리", "리스크", "고래 흐름"].map((item) => (
          <div
            key={item}
            style={{
              borderRadius: 28,
              padding: "28px 26px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: palette.white,
              fontSize: 38,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ExtendedActionScene() {
  return (
    <AbsoluteFill style={{ padding: "110px 120px", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ color: palette.cyan, fontSize: 28, fontWeight: 800, letterSpacing: "0.18em" }}>
          LIVE BATTLE FLOW
        </div>
        <div style={{ color: palette.white, fontSize: 86, fontWeight: 900, lineHeight: 0.96 }}>
          실시간 토론.
          <br />
          마지막 선택.
          <br />
          결과와 XP.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {["실시간 발언", "Bull/Bear 선택", "결과 저장"].map((item, index) => (
          <div
            key={item}
            style={{
              borderRadius: 30,
              padding: "34px 28px",
              background:
                index === 1
                  ? "linear-gradient(180deg, rgba(255,209,102,0.26), rgba(5,8,22,0.9))"
                  : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(5,8,22,0.9))",
              border: "1px solid rgba(255,255,255,0.14)",
              color: palette.white,
              fontSize: 38,
              fontWeight: 800,
              minHeight: 220,
              display: "flex",
              alignItems: "center",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function AntGravityPromo() {
  return <WidePromo />;
}

export function AntGravityPromoShorts() {
  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}>
      <GridBackground />
      <AudioBed
        bassDropFrom={88}
        narrationSrc={promoAudio.narrationShorts}
        outroRiseFrom={212}
      />
      <ShortsScene from={0} durationInFrames={88} title="한 코인." subtitle="AI 여덟 명." />
      <Sequence from={88} durationInFrames={124}>
        <ShortsCards />
      </Sequence>
      <ShortsScene from={212} durationInFrames={58} title="네가 끝내." subtitle="마지막 선택은 네가 한다." />
      <TimedNarrationCaption data={shortsNarration as NarrationTimingData} />
    </AbsoluteFill>
  );
}

export function AntGravityPromoExtended() {
  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}>
      <GridBackground />
      <AudioBed
        bassDropFrom={120}
        narrationSrc={promoAudio.narrationExtended}
        outroRiseFrom={360}
      />
      <Sequence durationInFrames={70} from={0}>
        <HookScene />
      </Sequence>
      <Sequence durationInFrames={70} from={70}>
        <ExtendedStatsScene />
      </Sequence>
      <Sequence durationInFrames={110} from={140}>
        <LineupScene />
      </Sequence>
      <Sequence durationInFrames={110} from={250}>
        <ExtendedActionScene />
      </Sequence>
      <Sequence durationInFrames={90} from={360}>
        <ClosingScene />
      </Sequence>
      <TimedNarrationCaption align="left" data={extendedNarration as NarrationTimingData} />
    </AbsoluteFill>
  );
}
