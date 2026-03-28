import type { CharacterCatalogEntry } from "@/features/characters/types";

export const characterCatalog: CharacterCatalogEntry[] = [
  {
    id: "aira",
    name: "Aira",
    role: "기술분석가",
    team: "bull",
    specialty: "RSI, 추세선, 거래량 패턴 해석",
    beginnerSummary:
      "차트 숫자를 복잡하게 보지 않고, 지금 힘이 붙는지 쉬는지 먼저 읽어주는 타입이야.",
    beginnerGuide: [
      {
        term: "RSI",
        easyMeaning: "지금 너무 달렸는지, 잠깐 쉬는 중인지 보여주는 속도계 같은 지표야.",
        whyItMatters: "과열 구간인지 먼저 감이 오면 뒤늦게 추격할지 잠깐 기다릴지 판단하기 쉬워져.",
      },
      {
        term: "추세선",
        easyMeaning: "가격이 올라가는 길인지, 내려가는 길인지 큰 방향을 그어보는 선이야.",
        whyItMatters: "지금 움직임이 우연한 흔들림인지, 계속 이어질 흐름인지 구분하는 데 도움이 돼.",
      },
    ],
    emoji: "AI",
    imageFileName: "aira.webp",
    sourceImageName:
      "u2232487955_httpss.mj.runI9PyyxZcob4_AntGravity_fintech_masco_98d50a44-08e8-47b6-a5c4-5f9dc34371a4_2.png",
    personality:
      "차분하고 끈기 있게 차트를 읽는 타입이야. 캔들 패턴과 지지저항, 거래량 같은 기본기를 믿고 성급하게 결론 내리지 않아.",
    selectionReason:
      "정제된 정면 구도와 집중하는 시선이 냉정하게 차트를 읽는 분석가 이미지와 잘 맞았어. 과장 없이 신뢰감을 주는 분위기가 기술분석가 역할에 어울려.",
    accentTone: "rose",
  },
  {
    id: "judy",
    name: "Judy",
    role: "뉴스 스카우터",
    team: "bull",
    specialty: "공시, 일정, 정책 변화 해석",
    beginnerSummary:
      "가격표보다 먼저 뉴스 재료를 읽고, 왜 갑자기 분위기가 달라졌는지 설명해주는 캐릭터야.",
    beginnerGuide: [
      {
        term: "공시",
        easyMeaning: "회사나 프로젝트가 공식적으로 알리는 중요한 발표야.",
        whyItMatters: "소문이 아니라 확인된 정보라서 시장이 크게 반응할 만한 재료인지 판단하기 좋아.",
      },
      {
        term: "일정",
        easyMeaning: "업데이트, 심사, 회의처럼 미리 예정된 이벤트 날짜야.",
        whyItMatters: "시장은 결과가 나오기 전부터 기대나 불안으로 먼저 움직여서, 타이밍을 읽는 데 중요해.",
      },
    ],
    emoji: "JD",
    imageFileName: "judy.webp",
    sourceImageName: "ant_character_2d_2.png",
    personality:
      "눈앞의 차트보다 먼저 재료를 보는 탐색형이야. 헤드라인만 보지 않고 일정, 인터뷰, 공시, 정책 변화까지 연결해서 읽어낸다.",
    selectionReason:
      "정보를 관찰하고 빠르게 정리하는 인상이 강해서 뉴스와 이벤트를 먼저 포착하는 캐릭터로 자연스럽게 이어졌어.",
    accentTone: "cream",
  },
  {
    id: "clover",
    name: "Clover",
    role: "심리 센티먼트 분석가",
    team: "bull",
    specialty: "공포탐욕지수와 커뮤니티 온도 감지",
    beginnerSummary:
      "사람들이 지금 겁먹었는지 들떴는지를 읽어서, 분위기가 과열인지 식는 중인지 알려줘.",
    beginnerGuide: [
      {
        term: "공포탐욕지수",
        easyMeaning: "시장이 지금 겁이 큰지, 욕심이 큰지 숫자로 보여주는 분위기 점수야.",
        whyItMatters: "너무 들떠 있으면 쉬어갈 가능성을, 너무 겁먹고 있으면 반등 여지를 생각해볼 수 있어.",
      },
      {
        term: "커뮤니티 온도",
        easyMeaning: "SNS나 커뮤니티에서 사람들이 얼마나 뜨겁게 반응하는지 보는 거야.",
        whyItMatters: "가격보다 먼저 기대감이나 피로감이 드러나는 경우가 많아서 흐름 변화를 빨리 눈치챌 수 있어.",
      },
    ],
    emoji: "CL",
    imageFileName: "clover.webp",
    sourceImageName:
      "u2232487955_httpss.mj.runJZTxnZ2WwnA_stylish_moe_ant_girl_mas_7e6e836f-faab-4a1b-aec4-a0d486831fa5_2.png",
    personality:
      "시장 분위기와 군중 심리를 빠르게 감지하는 공감형이야. 커뮤니티의 기대, 공포, 피로감 같은 정서를 섬세하게 읽는다.",
    selectionReason:
      "감정 반응이 잘 드러나는 표정과 부드러운 분위기가 군중 심리의 미세한 변화를 포착하는 역할과 잘 맞았어.",
    accentTone: "butter",
  },
  {
    id: "blaze",
    name: "Blaze",
    role: "모멘텀 트레이더",
    team: "bull",
    specialty: "돌파 구간, 속도감 있는 추세 포착",
    beginnerSummary:
      "가격이 갑자기 힘을 받을 때 그 순간을 잡아내는 타입이라, '지금 달리는 장인지'를 빨리 알려줘.",
    beginnerGuide: [
      {
        term: "돌파",
        easyMeaning: "가격이 계속 막히던 구간을 뚫고 위나 아래로 강하게 나가는 장면이야.",
        whyItMatters: "막힌 벽을 넘는 순간엔 흐름이 더 세게 이어질 수 있어서 진입 타이밍 후보가 돼.",
      },
      {
        term: "모멘텀",
        easyMeaning: "지금 시장에 붙어 있는 추진력이나 가속도라고 보면 돼.",
        whyItMatters: "힘이 살아 있을 땐 추세가 생각보다 오래 이어질 수 있어서, 흐름을 거스를지 탈지 판단하게 해줘.",
      },
    ],
    emoji: "BZ",
    imageFileName: "blaze.webp",
    sourceImageName:
      "u2232487955_AntGravity_mascot_stylish_moe_male_ant_character__89da0142-24c0-4479-9e87-c460a52a47bc_1.png",
    personality:
      "속도와 타이밍을 중시하는 돌파형이야. 추세가 붙는 순간을 빠르게 감지하고, 흐름이 꺾이면 미련 없이 다음 기회를 본다.",
    selectionReason:
      "강한 채도와 공격적인 에너지가 짧은 순간의 돌파를 붙잡는 모멘텀 트레이더 캐릭터에 잘 어울렸어.",
    accentTone: "rose",
  },
  {
    id: "ledger",
    name: "Ledger",
    role: "온체인 분석가",
    team: "bear",
    specialty: "지갑 이동, 거래소 입출금, 대형 자금 추적",
    beginnerSummary:
      "겉으로 보이는 가격보다, 뒤에서 돈이 어디로 움직이는지 보고 시장 속마음을 읽는 캐릭터야.",
    beginnerGuide: [
      {
        term: "온체인",
        easyMeaning: "블록체인 위에 실제로 남는 거래 기록을 직접 보는 분석이야.",
        whyItMatters: "말이 아니라 실제 이동 데이터를 보기 때문에 큰손이 움직였는지 확인하기 좋아.",
      },
      {
        term: "거래소 입출금",
        easyMeaning: "코인이 거래소 안으로 들어오거나 밖으로 빠져나가는 흐름이야.",
        whyItMatters: "거래소로 많이 들어오면 매도 압력, 밖으로 많이 나가면 보관 의도가 커졌다고 해석할 수 있어.",
      },
    ],
    emoji: "LD",
    imageFileName: "ledger.webp",
    sourceImageName:
      "u2232487955_httpss.mj.runVpeKMoUqWGA_AntGravity_fintech_masco_f7fe06d1-1739-4737-82b0-61a856fc78f7_0.png",
    personality:
      "차분하게 숫자를 모으지만 시선은 날카로운 온체인 추적자야. 자금 흐름과 거래소 입출금, 큰 손 움직임을 끝까지 따라가며 조용하게 결론을 만든다.",
    selectionReason:
      "정면을 응시하는 강한 눈빛과 화려한 색감이 대형 자금의 흔적을 놓치지 않는 캐릭터로 잘 맞았어. 기존보다 존재감이 커서 온체인 분석가 포지션이 더 또렷하게 살아난다.",
    accentTone: "cream",
  },
  {
    id: "shade",
    name: "Shade",
    role: "리스크 매니저",
    team: "bear",
    specialty: "손절 시나리오, 변동성 경고, 방어 전략",
    beginnerSummary:
      "얼마나 벌 수 있냐보다 먼저 얼마나 크게 다칠 수 있는지 계산해서, 무리한 진입을 막아주는 역할이야.",
    beginnerGuide: [
      {
        term: "손절",
        easyMeaning: "틀렸을 때 손실이 더 커지기 전에 미리 정해둔 선에서 정리하는 거야.",
        whyItMatters: "한 번 크게 무너지면 다음 기회를 잡기 어려워서, 오래 살아남으려면 손실 제한이 중요해.",
      },
      {
        term: "변동성",
        easyMeaning: "가격이 얼마나 빠르고 크게 흔들리는지를 뜻해.",
        whyItMatters: "변동성이 크면 기회도 커지지만, 반대로 잘못 잡으면 손실도 순식간에 커질 수 있어.",
      },
    ],
    emoji: "SD",
    imageFileName: "shade.webp",
    sourceImageName:
      "u2232487955_httpss.mj.runw_uqNSpuRoU_AntGravity_mascot_stock__e2d0e08e-7f23-4c07-ac30-05911bf5a85f_2.png",
    personality:
      "항상 최악의 경우를 먼저 계산하는 경계형이야. 기대보다 손실 제한을 우선하고, 위험이 커지면 바로 강도를 조절한다.",
    selectionReason:
      "냉정한 인상과 통제된 분위기가 리스크를 먼저 경고하는 캐릭터와 잘 맞아서 방어형 분석가 포지션을 분명하게 보여준다.",
    accentTone: "butter",
  },
  {
    id: "vela",
    name: "Vela",
    role: "고래 추적자",
    team: "bear",
    specialty: "대형 자금 이동, 숨은 신호 감시",
    beginnerSummary:
      "눈에 잘 안 보이는 큰 자금의 방향을 읽어서, 겉보기와 다른 진짜 흐름이 있는지 체크해줘.",
    beginnerGuide: [
      {
        term: "고래 자금",
        easyMeaning: "시장에 큰 영향을 줄 수 있는 큰손들의 돈이야.",
        whyItMatters: "이런 자금은 움직이기만 해도 가격과 심리를 크게 흔들 수 있어서 방향 힌트가 되곤 해.",
      },
      {
        term: "자금 이동",
        easyMeaning: "돈이나 코인이 어느 지갑, 어느 거래소 쪽으로 흘러가는지 보는 거야.",
        whyItMatters: "보이는 뉴스가 조용해도 자금이 먼저 움직이면 곧 시장 반응이 따라올 수 있어.",
      },
    ],
    emoji: "VE",
    imageFileName: "vela.webp",
    sourceImageName:
      "u2232487955_httpss.mj.runHwKuVDKSiDE_AntGravity_mascot_stylis_7ee2bae4-41be-4ff3-baa7-f1cfbe4d23ab_0.png",
    personality:
      "멀리서 큰 움직임을 먼저 감지하는 감시형이야. 작은 파동보다 거대한 자금 방향과 세력의 진입 흔적을 찾는 데 집중한다.",
    selectionReason:
      "관찰자 같은 시선과 차분한 존재감이 보이지 않는 대형 자금 흐름을 추적하는 캐릭터에 잘 어울렸어.",
    accentTone: "rose",
  },
  {
    id: "flip",
    name: "Flip",
    role: "역발상 전략가",
    team: "bear",
    specialty: "과열 구간 반전 신호 포착",
    beginnerSummary:
      "사람들이 한쪽으로 너무 몰릴 때 반대로 생각해서, 지금 너무 뜨거운 건 아닌지 점검해주는 캐릭터야.",
    beginnerGuide: [
      {
        term: "과열",
        easyMeaning: "기대감이 너무 커져서 가격이 빠르게 달려버린 상태야.",
        whyItMatters: "다들 같은 방향만 볼 때는 작은 악재에도 크게 흔들릴 수 있어서 조심해야 해.",
      },
      {
        term: "반전 신호",
        easyMeaning: "지금까지 흐르던 방향이 꺾일 수 있다고 알려주는 징후야.",
        whyItMatters: "추세가 영원히 가지는 않아서, 꺾이는 순간을 먼저 보면 늦은 추격을 피할 수 있어.",
      },
    ],
    emoji: "FP",
    imageFileName: "flip.webp",
    sourceImageName:
      "u2232487955_httpss.mj.runvYIeeTkMIB8_AntGravity_mascot_fintec_9766d1e1-88a1-4ff2-b70d-97a2a9c5cfd0_2.png",
    personality:
      "모두가 한 방향으로 기울 때 반대편 논리를 점검하는 전략가야. 과열 구간에서 식을 줄 알고, 공포 구간에서 기회를 찾는다.",
    selectionReason:
      "강한 시선과 독특한 분위기가 역발상 포지션에 잘 맞고, 시장 과열을 식히는 캐릭터로 인상이 분명했어.",
    accentTone: "cream",
  },
];
