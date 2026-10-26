/* ================================================================
   characters.js  ★ 캐릭터 정보는 전부 이 파일에서 ★
   ----------------------------------------------------------------
   여기에 캐릭터를 적으면 바탕화면에 캐릭터 폴더가 자동으로 생기고,
   그 안에 아래 파일들이 알아서 만들어져요.

     📁 캐릭터 폴더
        ├ 프로필.txt      ← profile
        ├ 그림            ← pictures   (비어 있으면 안 생겨요)
        ├ 관계도          ← 전체 관계도를 이 캐릭터 강조해서 열기
        ├ 📁 페어         ← pairs      (비어 있으면 안 생겨요)
        │    └ 📁 A x B   (페어마다: 관계도 · 페어 설정.txt · 페어 그림)
        └ 📁 추가 정보    ← extra      (비어 있으면 안 생겨요)

   ■ 캐릭터 추가하는 법
     아래 CHARACTERS 안의 { 부터 }, 까지 한 덩어리를 통째로 복사해서
     맨 아래에 붙여넣고 내용만 바꾸면 끝!
     (id 는 다른 캐릭터와 겹치지 않는 짧은 영어로)

   ■ 꼭 지킬 것: 따옴표 안만 고치기 · 줄 끝 쉼표(,) 지우지 않기 · 괄호 짝 맞추기
     실수하면 사이트에 "characters.js 오류" 창이 뜨고 몇 번째 줄인지 알려줘요.
================================================================ */

const CHARACTERS = [

  // ─────────────────────────────── 캐릭터A ───
  {
    id: "a",                       // 짧은 이름표 (관계도·페어에서 이 캐릭터를 부를 때 사용)
    name: "캐릭터A",                // 보이는 이름
    slot: 12,                      // 바탕화면 칸 번호 (data.js [7-0] 참고)
    folderColor: "#f7d64a",        // 폴더 색
    face: "",                      // 얼굴 그림 → 관계도 카드, 타자연습 초상화에 쓰여요 (예: "images/a-face.png")
    intro: "캐릭터A 한 줄 소개",     // 관계도에서 눌렀을 때 나오는 소개
    relationPos: { x: 22, y: 20 }, // 관계도에서의 위치 (0~100). 지우면 자동 배치

    // 프로필.txt 내용
    profileImage: "",              // 프로필 글 위에 보일 그림 (없으면 "")
    profile: `이름 : 캐릭터A
나이 : ??
생일 : 1월 1일
좋아하는 것 : 고양이, 비 오는 날

여기에 자유롭게 소개를 적어주세요.`,

    // 그림 (src 말고는 없어도 돼요)
    pictures: [
      { src: "images/sample-1.png", title: "풍경 연습", date: "2026-10-03", caption: "배경 그려본 것" },
      { src: "images/sample-2.png", title: "하트", date: "2026-10-05", caption: "도트 연습" },
    ],

    // 페어 (여러 개 가능)
    //  with : 상대 캐릭터의 id      me : 내가 상대에게 갖는 마음      them : 상대가 나에게 갖는 마음
    //  note : 페어 설정.txt 내용     pictures : 페어 그림
    pairs: [
      {
        with: "b",
        me: "마음 1",
        them: "마음 2",
        note: `처음 만난 계기 :
서로를 부르는 호칭 :
둘만의 에피소드 :`,
        pictures: [],
      },
    ],

    // 추가 정보 폴더 안에 들어갈 메모들 (title 이 파일 이름이 돼요)
    extra: [
      { title: "세계관 설정", text: "세계관 설정을 적어주세요." },
      { title: "TMI", text: `- 소소한 TMI 1
- 소소한 TMI 2` },
      { title: "비밀", text: "아직은 비밀!" },
    ],
  },

  // ─────────────────────────────── 캐릭터B ───
  {
    id: "b",
    name: "캐릭터B",
    slot: 6,
    folderColor: "#ff9ec7",
    face: "",
    intro: "캐릭터B 한 줄 소개",
    relationPos: { x: 78, y: 20 },
    profileImage: "",
    profile: `이름 : 캐릭터B

여기에 자유롭게 소개를 적어주세요.`,
    pictures: [
      { src: "images/pudding-2.png", title: "딸기 푸딩", date: "2026-10-08" },
    ],
    pairs: [
      { with: "d", me: "마음 1", them: "마음 2", note: `페어 설정을 적어주세요.`, pictures: [] },
    ],
    extra: [
      { title: "TMI", text: "소소한 TMI" },
    ],
  },

  // ─────────────────────────────── 캐릭터C ───
  {
    id: "c",
    name: "캐릭터C",
    slot: 56,
    folderColor: "#8fd3ff",
    face: "",
    intro: "캐릭터C 한 줄 소개",
    relationPos: { x: 22, y: 78 },
    profileImage: "",
    profile: `이름 : 캐릭터C

여기에 자유롭게 소개를 적어주세요.`,
    pictures: [
      { src: "images/pudding-3.png", title: "말차 푸딩", date: "2026-10-09" },
    ],
    pairs: [
      { with: "d", me: "마음 1", them: "마음 2", note: `페어 설정을 적어주세요.`, pictures: [] },
    ],
    extra: [],
  },

  // ─────────────────────────────── 캐릭터D ───
  {
    id: "d",
    name: "캐릭터D",
    slot: 7,
    folderColor: "#b8e986",
    face: "",
    intro: "캐릭터D 한 줄 소개",
    relationPos: { x: 78, y: 78 },
    profileImage: "",
    profile: `이름 : 캐릭터D

여기에 자유롭게 소개를 적어주세요.`,
    pictures: [],
    pairs: [],
    extra: [],
  },

  // ↓ 새 캐릭터는 여기에 붙여넣기

];


/* ================================================================
   전체 관계도의 화살표
   ----------------------------------------------------------------
     from → to : 누가 누구에게 (캐릭터 id)
     label     : 화살표 위 글씨          desc : 눌렀을 때 나오는 설명
     back      : 반대 방향 마음 (적으면 화살표 두 줄이 나란히)   backDesc : 그 설명
     both      : true 면 한 줄에 양쪽 화살표 (서로 같은 관계)
     color     : 선 색    style : "solid"(실선) / "dashed"(점선) / "dotted"(점점)
     labelAt   : 이름표 위치 (0~1). 안 적으면 겹치지 않게 알아서
================================================================ */

const RELATIONS = [
  { from: "a", to: "b", label: "소꿉친구", back: "신경 쓰임", color: "#ff5fa2", desc: "어릴 때부터 알던 사이", backDesc: "요즘 왠지 신경 쓰인다" },
  { from: "b", to: "c", label: "라이벌", both: true, color: "#e02424", style: "dashed", desc: "서로 지기 싫어함" },
  { from: "c", to: "a", label: "동경", color: "#1a5cff", desc: "몰래 동경하고 있다" },
  { from: "d", to: "b", label: "짝사랑", color: "#ff5fa2", desc: "아무도 모르는 짝사랑" },
  { from: "a", to: "d", label: "경계", back: "흥미", color: "#9b59ff", style: "dotted", desc: "왠지 수상하다", backDesc: "재밌는 녀석" },
  { from: "c", to: "d", label: "같은 반", both: true, color: "#3cb371", desc: "같은 반 친구" },
];
