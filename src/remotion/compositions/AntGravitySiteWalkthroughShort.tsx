import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  ink: "#132046",
  body: "#44506a",
  white: "#ffffff",
  orange: "#ff5b2e",
  yellow: "#ffea00",
  blue: "#1d4ed8",
  green: "#1f9d66",
  purple: "#7c3aed",
  red: "#ef4444",
  dark: "#111827",
} as const;

const totalFrames = 540;
const introDuration = 30;

interface AntGravitySiteWalkthroughShortProps {
  bgmPath?: string;
}

const characterRoster = [
  { name: "Aira", role: "기술", image: "characters/aira.webp", accent: palette.green },
  { name: "Judy", role: "뉴스", image: "characters/judy.webp", accent: palette.orange },
  { name: "Clover", role: "심리", image: "characters/clover.webp", accent: palette.purple },
  { name: "Blaze", role: "모멘텀", image: "characters/blaze.webp", accent: palette.red },
  { name: "Ledger", role: "온체인", image: "characters/ledger.webp", accent: palette.blue },
  { name: "Shade", role: "리스크", image: "characters/shade.webp", accent: palette.dark },
  { name: "Vela", role: "고래", image: "characters/vela.webp", accent: palette.orange },
  { name: "Flip", role: "역발상", image: "characters/flip.webp", accent: palette.purple },
] as const;

const scenes = [
  {
    label: "01",
    duration: 54,
    kicker: "웹앱 시작점",
    highlight: "검색하고 진입",
    title: "홈에서 바로 시작해",
    body: "코인 찾고, 배틀 들어가고, 웹앱 흐름이 바로 열려.",
    accent: palette.green,
    kind: "shot" as const,
    image: "site-captures/home.png",
  },
  {
    label: "02",
    duration: 54,
    kicker: "배틀 구조",
    highlight: "Bull 4 vs Bear 4",
    title: "8명이 양쪽으로 붙어",
    body: "한 코인을 두고 양 팀이 동시에 실시간 토론해.",
    accent: palette.blue,
    kind: "shot" as const,
    image: "site-captures/battle.png",
  },
  {
    label: "03",
    duration: 78,
    kicker: "캐릭터 구성",
    highlight: "8명 역할 분업",
    title: "기술 뉴스 심리 리스크",
    body: "캐릭터마다 보는 데이터와 말투가 다 따로 있어.",
    accent: palette.red,
    kind: "parade" as const,
  },
  {
    label: "04",
    duration: 54,
    kicker: "토론 내용",
    highlight: "핵심 논거 정리",
    title: "읽고 바로 판단해",
    body: "토론에서 올라온 근거를 요약해서 바로 고르게 해줘.",
    accent: palette.orange,
    kind: "shot" as const,
    image: "site-captures/pick.png",
  },
  {
    label: "05",
    duration: 54,
    kicker: "결과 구조",
    highlight: "실캔들 정산",
    title: "Bybit 기준으로 끝내",
    body: "선택만 하고 끝이 아니라 실제 캔들로 결과를 봐.",
    accent: palette.purple,
    kind: "shot" as const,
    image: "site-captures/waiting.png",
  },
  {
    label: "06",
    duration: 54,
    kicker: "웹앱 기능",
    highlight: "기록과 XP",
    title: "로그인하면 계속 이어져",
    body: "배틀 기록, 레벨, XP까지 웹앱 안에서 누적돼.",
    accent: palette.dark,
    kind: "shot" as const,
    image: "site-captures/login.png",
  },
] as const;

const scenesDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
const outroDuration = totalFrames - introDuration - scenesDuration;

function clamp(frame: number, input: [number, number], output: [number, number]) {
  return interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function sceneFrom(index: number) {
  return introDuration + scenes.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0);
}

function Sticker({
  bg,
  color,
  rotate = 0,
  text,
}: {
  bg: string;
  color: string;
  rotate?: number;
  text: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        background: bg,
        color,
        padding: "10px 18px",
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: "-0.03em",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 12px 30px rgba(17,24,39,0.14)",
      }}
    >
      {text}
    </div>
  );
}

function Backdrop() {
  const frame = useCurrentFrame();
  const drift = clamp(frame, [0, totalFrames], [0, -120]);

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #fff7ef 0%, #fff1e8 42%, #f4edff 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.62,
          backgroundImage:
            "radial-gradient(circle at 18% 16%, rgba(255,91,46,0.2), transparent 20%), radial-gradient(circle at 82% 14%, rgba(29,78,216,0.16), transparent 18%), radial-gradient(circle at 50% 78%, rgba(124,58,237,0.18), transparent 24%)",
          transform: `translateY(${drift}px)`,
        }}
      />
    </>
  );
}

function AudioLayer({ bgmPath }: { bgmPath: string }) {
  return <Audio src={staticFile(bgmPath)} volume={0.64} />;
}

function IntroScene() {
  const frame = useCurrentFrame();
  const opacity = clamp(frame, [0, 10], [0, 1]);
  const scale = clamp(frame, [0, 14], [0.92, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 84px",
        opacity,
        transform: `scale(${scale})`,
        fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif",
      }}
    >
      <Sticker bg={palette.orange} color={palette.white} rotate={-4} text="스크롤 멈춰" />
      <div
        style={{
          marginTop: 22,
          maxWidth: 860,
          fontSize: 108,
          lineHeight: 1.04,
          fontWeight: 900,
          letterSpacing: "-0.06em",
          color: palette.ink,
          textShadow: "0 8px 0 rgba(255,255,255,0.9)",
        }}
      >
        이 코인 앱,
        <br />
        왜 재밌냐면
      </div>
      <div
        style={{
          marginTop: 24,
          display: "inline-flex",
          borderRadius: 28,
          background: palette.yellow,
          color: palette.dark,
          padding: "16px 24px",
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 1.18,
          maxWidth: 820,
        }}
      >
        웹앱 소개, 배틀 구조, 토론 내용까지
      </div>
    </AbsoluteFill>
  );
}

function PhoneFrame({
  accent,
  duration,
  image,
  label,
}: {
  accent: string;
  duration: number;
  image: string;
  label: string;
}) {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const y = clamp(frame, [0, 10], [64, 0]);
  const opacity = clamp(frame, [0, 10], [0, 1]);
  const scale = clamp(frame, [0, duration], [1.1, 1]);

  return (
    <>
      <div style={{ position: "absolute", top: 72, left: 70 }}>
        <Sticker bg={accent} color={palette.white} text={label} />
      </div>
      <div
        style={{
          position: "absolute",
          left: width * 0.11,
          right: width * 0.11,
          top: 170,
          bottom: 320,
          borderRadius: 58,
          padding: 18,
          background: palette.dark,
          boxShadow: "0 32px 90px rgba(17,24,39,0.28)",
          transform: `translateY(${y}px)`,
          opacity,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            borderRadius: 42,
            background: palette.white,
          }}
        >
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
              transformOrigin: "center top",
            }}
          />
        </div>
      </div>
    </>
  );
}

function CaptionBlock({
  accent,
  body,
  highlight,
  kicker,
  title,
}: {
  accent: string;
  body: string;
  highlight: string;
  kicker: string;
  title: string;
}) {
  const frame = useCurrentFrame();
  const y = clamp(frame, [0, 10], [18, 0]);
  const opacity = clamp(frame, [0, 10], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 58,
        right: 58,
        bottom: 90,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Sticker bg={palette.white} color={accent} rotate={-3} text={kicker} />
        <Sticker bg={palette.yellow} color={palette.dark} rotate={2} text={highlight} />
      </div>
      <div
        style={{
          marginTop: 14,
          maxWidth: 820,
          fontSize: 86,
          lineHeight: 1.03,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: palette.ink,
          textShadow: "0 8px 0 rgba(255,255,255,0.88)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 14,
          display: "inline-flex",
          maxWidth: 780,
          borderRadius: 28,
          background: "rgba(19,32,70,0.9)",
          color: palette.white,
          padding: "18px 22px",
          fontSize: 28,
          lineHeight: 1.36,
          fontWeight: 800,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function ScreenshotScene(scene: Extract<(typeof scenes)[number], { kind: "shot" }>) {
  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}>
      <PhoneFrame
        accent={scene.accent}
        duration={scene.duration}
        image={scene.image}
        label={scene.label}
      />
      <CaptionBlock
        accent={scene.accent}
        body={scene.body}
        highlight={scene.highlight}
        kicker={scene.kicker}
        title={scene.title}
      />
    </AbsoluteFill>
  );
}

function CharacterCard({
  accent,
  image,
  index,
  name,
  role,
}: {
  accent: string;
  image: string;
  index: number;
  name: string;
  role: string;
}) {
  const frame = useCurrentFrame();
  const local = Math.max(frame - index * 2, 0);
  const opacity = clamp(local, [0, 8], [0, 1]);
  const y = clamp(local, [0, 8], [36, 0]);
  const nameScale = clamp(local, [4, 12], [0.7, 1]);
  const nameOpacity = clamp(local, [4, 12], [0, 1]);
  const tilt = index % 2 === 0 ? -2 : 2;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        background: palette.white,
        border: `2px solid ${accent}`,
        boxShadow: "0 20px 44px rgba(17,24,39,0.14)",
        opacity,
        transform: `translateY(${y}px) rotate(${tilt}deg)`,
      }}
    >
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
        <Sticker bg={accent} color={palette.white} text={role} />
      </div>
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: 230,
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />
      <div style={{ padding: "16px 16px 18px" }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: palette.ink,
          }}
        >
          {name}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          display: "flex",
          justifyContent: "center",
          opacity: nameOpacity,
          transform: `scale(${nameScale})`,
        }}
      >
        <div
          style={{
            borderRadius: 999,
            background: palette.yellow,
            color: palette.dark,
            padding: "10px 18px",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            boxShadow: "0 12px 30px rgba(255,234,0,0.3)",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}

function CharacterParadeScene(scene: Extract<(typeof scenes)[number], { kind: "parade" }>) {
  const frame = useCurrentFrame();
  const titleScale = clamp(frame, [0, 12], [0.92, 1]);

  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}>
      <div
        style={{
          position: "absolute",
          top: 78,
          left: 58,
          right: 58,
          transform: `scale(${titleScale})`,
          transformOrigin: "left top",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Sticker bg={palette.white} color={scene.accent} rotate={-3} text={scene.kicker} />
          <Sticker bg={palette.yellow} color={palette.dark} rotate={2} text={scene.highlight} />
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 96,
            lineHeight: 0.93,
            fontWeight: 900,
            letterSpacing: "-0.08em",
            color: palette.ink,
            textShadow: "0 8px 0 rgba(255,255,255,0.88)",
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            marginTop: 14,
            display: "inline-flex",
            maxWidth: 760,
            borderRadius: 28,
            background: "rgba(19,32,70,0.9)",
            color: palette.white,
            padding: "18px 22px",
            fontSize: 28,
            lineHeight: 1.26,
            fontWeight: 800,
          }}
        >
          {scene.body}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          top: 404,
          bottom: 108,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
        }}
      >
        {characterRoster.map((character, index) => (
          <CharacterCard
            key={character.name}
            accent={character.accent}
            image={character.image}
            index={index}
            name={character.name}
            role={character.role}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function OutroScene() {
  const frame = useCurrentFrame();
  const badgeOpacity = clamp(frame, [0, 10], [0, 1]);
  const headlineOpacity = clamp(frame, [8, 24], [0, 1]);
  const headlineY = clamp(frame, [8, 24], [28, 0]);
  const bodyOpacity = clamp(frame, [20, 40], [0, 1]);
  const bodyY = clamp(frame, [20, 40], [30, 0]);
  const footerOpacity = clamp(frame, [38, 56], [0, 1]);
  const glowScale = clamp(frame, [0, outroDuration], [0.94, 1.08]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 84px",
        fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,91,46,0.22) 0%, rgba(255,234,0,0.16) 32%, rgba(124,58,237,0.12) 54%, transparent 74%)",
          filter: "blur(24px)",
          transform: `scale(${glowScale})`,
        }}
      />
      <div style={{ opacity: badgeOpacity }}>
        <Sticker bg={palette.orange} color={palette.white} rotate={-4} text="AntGravity v1.0.0 정식 출시!" />
      </div>
      <div
        style={{
          marginTop: 24,
          maxWidth: 860,
          fontSize: 94,
          lineHeight: 1.06,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: palette.ink,
          textShadow: "0 8px 0 rgba(255,255,255,0.9)",
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        흔들릴수록
        <br />
        더 똑똑하게
      </div>
      <div
        style={{
          marginTop: 24,
          display: "inline-flex",
          borderRadius: 28,
          background: "rgba(19,32,70,0.92)",
          color: palette.white,
          padding: "20px 26px",
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.38,
          maxWidth: 840,
          opacity: bodyOpacity,
          transform: `translateY(${bodyY}px)`,
        }}
      >
        토론으로 읽고, 선택으로 검증하고, 결과로 복기하는 투자 앱.
        <br />
        앤트그래비티와 함께 흔들리지 않는 투자 루틴을 시작해 봐.
      </div>
      <div
        style={{
          marginTop: 24,
          display: "inline-flex",
          borderRadius: 999,
          background: palette.yellow,
          color: palette.dark,
          padding: "16px 24px",
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          maxWidth: 820,
          opacity: footerOpacity,
        }}
      >
        지금 먼저 시작하면, 앞으로 나올 더 강한 기능도 제일 먼저 잡을 수 있어
      </div>
    </AbsoluteFill>
  );
}

export const AntGravitySiteWalkthroughShort = ({
  bgmPath = "audio/ant-gravity-site-hook.wav",
}: AntGravitySiteWalkthroughShortProps) => {
  return (
    <AbsoluteFill style={{ fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif" }}>
      <Backdrop />
      <AudioLayer bgmPath={bgmPath} />
      <Sequence from={0} durationInFrames={introDuration}>
        <IntroScene />
      </Sequence>
      {scenes.map((scene, index) => {
        const from = sceneFrom(index);

        return (
          <Sequence key={scene.label} from={from} durationInFrames={scene.duration}>
            {scene.kind === "parade" ? (
              <CharacterParadeScene {...scene} />
            ) : (
              <ScreenshotScene {...scene} />
            )}
          </Sequence>
        );
      })}
      <Sequence from={introDuration + scenesDuration} durationInFrames={outroDuration}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
