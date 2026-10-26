/* ================================================================
   data.js  ★ 홈페이지 설정은 이 파일에서 수정해요 ★
   · 캐릭터 정보(프로필, 그림, 페어, 관계도)는 characters.js 에서!
   · 사이트에서 바로 고치는 관리자 모드는 firebase-config.js 에서 연결해요.
   · 자세한 따라하기는 같은 폴더의 "사용법.txt" 를 봐주세요.
================================================================

   ■ 목차  —  Ctrl+F 로 [번호] 를 검색하면 바로 이동해요 (예: [7-2])

     [1]  기본 정보 (사이트 제목, 시작 버튼 글씨)
     [2]  색상 · 바탕화면
     [3]  효과음
     [4]  로딩 화면
     [5]  들어오면 뜨는 팝업
     [6]  처음부터 열려 있는 창
     [7]  바탕화면 아이콘
            [7-0] 칸 번호 설정
            [7-1] 내 컴퓨터        [7-2] 인터넷       [7-3] 뮤직플레이어
            [7-4] 달력             [7-5] 자유 폴더    [7-6] 그림.png
            [7-7] 읽어주세요.txt   [7-8] 휴지통
            ★ 캐릭터 폴더는 characters.js 에 따로 있어요!
     [8]  숨은 프로그램 (바탕화면엔 없고 링크로 여는 창)
            [8-1] 관계도   [8-2] 타자연습   [8-3] 푸딩쌓기
     [9]  시작 메뉴

   ■ id 목록  —  open: "id" / data-open="id" 로 창을 열 때 쓰는 이름표
     mycomputer · browser · music · calendar · free · pic1 · readme · trash
     relations · typing · stack
     캐릭터 폴더 : "char-" + 캐릭터 id   (예: 캐릭터 id 가 "a" 면 "char-a")
     (새 아이콘에 id 를 붙이면 여기에도 적어두면 헷갈리지 않아요)

================================================================
   ■ 수정할 때 꼭 지킬 것 4가지
     1. 글자는 " " 따옴표 안쪽만 고치기
     2. 줄 끝의 쉼표(,) 지우지 않기
     3. 괄호 { } [ ] 는 항상 짝으로 — 지울 땐 짝까지 같이
     4. 여러 줄 글은 ` ` (백틱, 숫자 1 왼쪽 키) 안에 쓰기
     → 실수하면 사이트에 "data.js 오류" 창이 뜨고 몇 번째 줄인지 알려줘요.
       메모장(VS Code 추천)의 줄 번호를 보고 그 근처를 확인하세요.
================================================================
   ■ 참고표
   [icon 종류] 아래 이름 중 하나, 또는 이미지 경로
     "folder" 폴더 · "file" 문서 · "image" 그림 · "computer" 컴퓨터
     "trash" 휴지통 · "browser" 인터넷 · "music" 음악 · "calendar" 달력
     "info" 정보 · "power" 전원 · "keyboard" 키보드 · "pudding" 푸딩
     "gallery" 그림 모음 · "relation" 관계도 · "person" 사람
     "images/my-icon.png"  ← 직접 만든 아이콘 (그림 파일 자체를 아이콘으로 써도 돼요)
     color: "#색상코드" 를 같이 적으면 아이콘 색이 바뀌어요.

   [window.type] 열었을 때 뜨는 창 종류
     "folder"   : 폴더. items 안에 아이콘을 넣어요. 폴더 안에 폴더도 OK!
     "text"     : 메모장. text 에 글, image 를 같이 적으면 글 위에 그림이 나와요.
     "image"    : 그림 보기. src 에 이미지 경로.
     "gallery"  : 그림 모음. images 에 그림 목록 (누르면 크게 보기, 이전/다음).
     "relation" : 관계도. nodes 에 인물, links 에 관계.
     "browser"  : 인터넷 창. pages(페이지들) 와 history(검색 기록).
     "music"    : 뮤직플레이어. tracks 에 곡 목록.
     "calendar" : 달력. entries 에 날짜별 기록.
     "typing"   : 타자연습 게임. sentences 에 문장.
     "stack"    : 쌓기 게임. images 에 쌓을 그림.
     window 를 아예 안 적으면 "준비 중" 알림창이 떠요.

   [바로가기] 아이콘에 window 대신 open: "아이콘 id" 를 적으면 그 창이 열려요.
     관계도 바로가기에 focus: "인물 id" 를 적으면 그 인물이 강조돼요.

   [창 크기] window 안에 width: 400, height: 300 → 크기 지정 (안 적으면 자동)
   [창 위치] window 안에 left: 100, top: 50   → 열릴 때 위치 (right, bottom 도 가능)
================================================================ */

const SITE = {

  /* ==============================================================
     [1] 기본 정보
     ============================================================== */

  // 브라우저 탭에 보이는 제목
  pageTitle: "MY OC WORLD 98",

  // 시작 메뉴 왼쪽 세로 글씨
  osName: "OC World 98",

  // 시작 버튼 글씨
  startButtonText: "시작",

  // 창 위쪽 메뉴줄 글씨
  menuBar: ["파일", "편집", "보기", "도움말"],

  /* ==============================================================
     [2] 색상 · 바탕화면
     ============================================================== */
  theme: {
    desktop: "#008080",                   // 바탕화면 색
    wallpaper: "",                        // 바탕화면 이미지 (예: "images/bg.png"), 없으면 ""
    wallpaperMode: "tile",                // "tile" = 바둑판 반복 / "cover" = 화면 꽉 채우기
    titleActive: ["#000080", "#1084d0"],  // 선택된 창 제목줄 (왼쪽색, 오른쪽색)
    titleInactive: ["#808080", "#b5b5b5"],// 선택 안 된 창 제목줄
    selection: "#000080",                 // 아이콘 선택했을 때 색
    startIconColor: "#ff5fa2",            // 시작 버튼 하트 색
  },

  /* ==============================================================
     [3] 효과음
     ============================================================== */
  //  비워두면("") 기본 레트로 소리가 나요.
  //  직접 만든 소리를 쓰려면 경로를 적어요 (예: "sounds/click.mp3")
  //  특정 소리만 끄려면 false
  //  방문자는 작업 표시줄 오른쪽 스피커 버튼으로 소리를 끌 수 있어요.
  sounds: {
    enabled: true,      // false 면 모든 효과음 끄기
    volume: 0.5,        // 크기 (0 ~ 1)
    showButton: true,   // 작업 표시줄 스피커 버튼 보이기
    click: "",          // 클릭할 때 (기본: 마우스 딸깍 소리)
    open: false,        // 창이 열릴 때 ("" 로 바꾸면 기본 삐빅 소리)
    popup: false,       // 알림창/팝업이 뜰 때 ("" 로 바꾸면 기본 띵 소리)
    startup: false,     // 로딩이 끝나고 바탕화면이 나올 때 ("" 로 바꾸면 기본 시작음)
  },

  /* ==============================================================
     [4] 로딩 화면 (처음 들어올 때 + 시스템 종료 눌렀을 때)
     ============================================================== */
  loading: {
    background: "#c0c0c0",       // 로딩 화면 배경색
    backgroundImage: "",         // 배경 이미지 (예: "images/loading.png"), 없으면 ""
    logo: "",                    // 가운데 로고 이미지 (예: "images/logo.png"), 없으면 ""
    title: "OC World 98",        // 큰 글씨
    subtitle: "Original Character Edition",  // 작은 글씨
    textColor: "#000000",        // 글자색
    barColor: "#000080",         // 로딩 바 색
    duration: 3000,              // 로딩 시간 (1000 = 1초)
    messages: [                  // 로딩 중 바뀌는 문구 (순서대로)
      "시스템을 시작하는 중...",
      "캐릭터 파일을 불러오는 중...",
      "폴더를 정리하는 중...",
      "바탕화면을 준비하는 중...",
    ],
    // 처음 접속할 때는 항상 자동으로 넘어가요.
    // 아래는 "시스템 종료" 후 로딩 화면에만 적용돼요.
    clickToStart: true,          // true = 다 차면 "클릭해서 시작" / false = 바로 바탕화면으로
    clickText: "▶ 화면을 클릭하면 시작합니다",
  },

  /* ==============================================================
     [5] 들어오면 뜨는 팝업
     ============================================================== */
  //  여러 개 넣으면 조금씩 겹쳐서 차례로 떠요. 안 띄우려면 show: false
  //  title      : 제목줄 글씨
  //  text       : 내용 (여러 줄 가능)
  //  icon       : "question"(?) / "warning"(!) / "error"(X) / "info"(i) / 이미지 경로 / "none"(아이콘 없음)
  //  image      : 내용 아래에 보여줄 그림 (없으면 "")
  //  titleColor : 제목줄 색 ["왼쪽색", "오른쪽색"]  (비우면 기본 파란색)
  //  background : 창 바탕색 (비우면 기본 회색)
  //  once       : true 면 처음 방문할 때 한 번만 떠요
  //  buttons    : 선택지 (2개 추천, 1개나 3개도 가능)
  //     label : 버튼 글씨
  //     image : 버튼 위에 보여줄 그림 (선택)
  //     reply : 눌렀을 때 뜨는 대답 창 → "글" 또는 { title, text, icon }
  //     open  : "아이콘 id" → 그 창 열기
  //     link  : "https://..." → 새 탭으로 사이트 열기
  //     (아무것도 안 적으면 그냥 닫혀요)
  popups: [
    {
      show: true,
      title: "New Message",
      icon: "question",
      text: "좋아하는 동물은?",
      buttons: [
        { label: "강아지", reply: "멍멍! 🐶" },
        { label: "고양이", reply: { title: "알림", text: "야옹~ 🐱", icon: "info" } },
      ],
    },
    {
      show: false,          // ← true 로 바꾸면 분홍 팝업도 같이 떠요
      title: "Desktop",
      icon: "warning",
      text: "I love you.\n٩(@^▽^@)۶",
      titleColor: ["#ff4f9a", "#ff8fc0"],
      background: "#ffe3ef",
      buttons: [
        { label: "OK" },
        { label: "Me too", reply: "♥♥♥" },
      ],
    },
  ],

  /* ==============================================================
     [6] 처음부터 열려 있는 창
     ============================================================== */
  //  open : 열 아이콘의 id  (위에 있을수록 먼저 열리고, 맨 아래 창이 맨 앞에 와요)
  //  위치 : left(왼쪽에서) / right(오른쪽에서) / top(위에서) / bottom(아래에서) 거리, 단위 px
  //         예) right: 16, top: 16  →  화면 오른쪽 위 구석
  //         안 적으면 자동으로 계단식 배치
  //  열고 싶지 않으면 그 줄을 지우거나 맨 앞에 // 를 붙이세요.
  startup: {
    windows: [
      { open: "calendar", right: 178, top: 28 },
      { open: "music",    right: 25,  top: 366 },
      { open: "readme",   left: 247,  top: 30 },
    ],
  },

  /* ==============================================================
     [7] 바탕화면 아이콘
     ============================================================== */

  // ─── [7-0] 칸 번호 설정 ───
  //  칸 번호는 세로줄부터 세요. (rows: 10 이면)
  //     1  11  21  31 ...
  //     2  12  22  32
  //     …   …   …
  //    10  20  30  40
  //  아이콘에 slot: 21 처럼 적으면 그 칸에 놓여요.
  //  slot 을 안 적으면 비어있는 칸에 위에서부터 순서대로 들어가요.
  desktopGrid: {
    rows: 10,             // 세로 한 줄에 들어가는 칸 수
    cellWidth: 80,        // 칸 하나의 가로 크기 (px)
    showNumbers: false,   // true 로 하면 바탕화면에 칸 번호가 보여요 (위치 정할 때 켜두면 편해요!)
  },

  // ─── 바탕화면 아이콘 목록 ───
  //  slot: 칸 번호 (위 설명 참고)
  desktopIcons: [

    // ─── [7-1] 내 컴퓨터 ───
    {
      id: "mycomputer",
      slot: 1,
      label: "내 컴퓨터",
      icon: "computer",
      window: {
        type: "text",
        title: "내 컴퓨터",
        text: `OC World 98
자캐 정리용 홈페이지입니다.

※ 이 창의 내용은 data.js 에서 바꿀 수 있어요.`,
      },
    },

    // 캐릭터 폴더(캐릭터A, B, C …)는 characters.js 에서 자동으로 만들어져요!

    // ─── [7-2] 인터넷 (브라우저) ───
    {
      id: "browser",
      slot: 2,
      label: "인터넷",
      icon: "browser",
      window: {
        type: "browser",
        title: "OC Explorer",
        home: "home",                         // 처음 열리는 페이지 id
        placeholder: "검색어를 입력하세요",

        // 검색창을 클릭하면 나오는 검색 기록
        //  page: "페이지 id" → 그 페이지로 이동
        //  open: "아이콘 id" → 바탕화면 창을 열기
        history: [
          { text: "리뷰 찾아보기", page: "review" },
          { text: "커미션 신청 안내", page: "commission" },
          { text: "미니 게임하는 곳", page: "minigame" },
        ],

        // 검색 사이트 첫 화면 꾸미기 (searchHome: true 인 페이지에 적용)
        searchHome: {
          logo: "OC Search",          // 로고 글씨
          logoColors: ["#ff5fa2", "#ffb800", "#3cb371", "#1a5cff", "#9b59ff", "#ff7a45"], // 글자마다 돌아가며 칠할 색
          logoImage: "",              // 로고를 그림으로 쓰려면 경로 (예: "images/logo.png")
          subtitle: "자캐 월드",       // 로고 밑 작은 글씨
          placeholder: "",            // 검색창 안 흐린 글씨
          searchButton: "OC 검색",     // 첫 번째 버튼 (검색)
          luckyButton: "아무 페이지나!", // 두 번째 버튼 (아무 페이지로 이동). "" 로 하면 버튼 숨김
        },

        // 주소창 아래 즐겨찾기 줄 (page / open / link 사용 가능, 비우면 줄이 사라져요)
        bookmarks: [
          { text: "홈", page: "home" },
          { text: "리뷰", page: "review" },
          { text: "커미션", page: "commission" },
          { text: "미니 게임", page: "minigame" },
        ],

        // 페이지 목록
        //  keyword: 검색했을 때 이 페이지가 나오는 단어
        //  html 안에서 쓸 수 있는 특별한 링크
        //    <a data-page="페이지id">글자</a>  → 브라우저 안에서 이동
        //    <a data-open="아이콘id">글자</a>  → 바탕화면 창 열기
        //    <a href="https://...">글자</a>     → 새 탭으로 진짜 사이트 열기
        pages: [
          {
            id: "home",
            address: "oc://home",
            title: "OC Search",
            searchHome: true,       // ← 검색 사이트 첫 화면 모양 (로고 + 검색창 + 버튼 2개)
          },
          {
            id: "review",
            address: "oc://review",
            title: "리뷰 찾아보기",
            keyword: "리뷰 후기 감상 책 영화 기록",
            // ── 감상 기록장 ──
            //  category : 분류 (책, 영화, 드라마, 게임 … 마음대로. 같은 분류끼리 버튼이 생겨요)
            //  title    : 제목          creator : 작가/감독
            //  date     : 본 날짜       rating  : 별점 0~5
            //  image    : 표지/포스터 그림 (없으면 "")
            //  short    : 한 줄 감상    text    : 긴 감상 (여러 줄 가능)
            //  목록에서 하나를 누르면 자세한 감상이 열려요.
            //  위쪽 검색창에 제목이나 작가를 검색해도 찾아져요.
            reviews: {
              heading: "감상 기록",
              intro: "읽은 책, 본 영화를 기록하는 곳",
              items: [
                {
                  category: "책",
                  title: "책 제목 예시",
                  creator: "작가 이름",
                  date: "2026-10-10",
                  rating: 4,
                  image: "",
                  short: "한 줄 감상을 적어주세요.",
                  text: `여기에 긴 감상을 자유롭게 적어요.

여러 줄도 그대로 들어가요.`,
                },
                {
                  category: "영화",
                  title: "영화 제목 예시",
                  creator: "감독 이름",
                  date: "2026-10-12",
                  rating: 5,
                  image: "",
                  short: "인생 영화 등극!",
                  text: `영화 감상 예시예요.`,
                },
              ],
            },
          },
          {
            id: "commission",
            address: "oc://commission",
            title: "커미션 신청 안내",
            keyword: "커미션 신청 가격",
            html: `
<h1>커미션 안내</h1>
<h2>가격표</h2>
<table>
  <tr><th>종류</th><th>가격</th></tr>
  <tr><td>두상</td><td>00,000원</td></tr>
  <tr><td>반신</td><td>00,000원</td></tr>
  <tr><td>전신</td><td>00,000원</td></tr>
</table>
<h2>신청 방법</h2>
<p>신청 방법을 여기에 적어주세요.</p>
<p><a data-page="home">← 홈으로</a></p>`,
          },
          {
            id: "minigame",
            address: "oc://minigame",
            title: "미니 게임",
            keyword: "게임 미니게임 타자 푸딩",
            html: `
<h1>미니 게임</h1>
<p>심심할 때 한 판!</p>
<ul>
  <li><a data-open="typing">⌨ 타자연습</a> - 대사를 따라 쳐 보세요</li>
  <li><a data-open="stack">🍮 푸딩쌓기</a> - 얼마나 높이 쌓을 수 있을까?</li>
</ul>
<p><a data-page="home">← 홈으로</a></p>`,
          },
        ],
      },
    },

    // ─── [7-3] 뮤직플레이어 ───
    {
      id: "music",
      slot: 3,
      label: "뮤직플레이어",
      icon: "music",
      window: {
        type: "music",
        title: "뮤직플레이어",
        volume: 60,           // 처음 볼륨 (0 ~ 100)
        cover: "",            // 기본 앨범 그림 (곡마다 따로 지정도 가능)
        tracks: [
          { title: "샘플 곡", artist: "OC World", src: "music/sample.wav", cover: "" },
          // { title: "곡 제목", artist: "아티스트", src: "music/song.mp3", cover: "images/cover.png" },
        ],
      },
    },

    // ─── [7-4] 달력 ───
    {
      id: "calendar",
      slot: 4,
      label: "달력",
      icon: "calendar",
      window: {
        type: "calendar",
        title: "달력",
        startMonth: "",       // 처음 보여줄 달 (예: "2026-10"), 비우면 오늘 기준
        hint: "표시된 날짜를 눌러보세요",

        // 날짜별 기록  "연-월-일": { ... }
        //  mark  : 날짜에 표시할 기호 (예: "♥", "★", "●")
        //  title : 제목
        //  text  : 일기/메모 내용
        //  image : 같이 보여줄 그림
        //  open  : "아이콘 id" → 사이트에 있는 다른 파일/폴더를 열기
        entries: {
          "2026-10-16": {
            mark: "♥",
            title: "홈페이지 오픈!",
            text: `오늘 홈페이지를 만들기 시작했다.
이런 식으로 일기나 메모를 적을 수 있어요.`,
          },
          "2026-10-03": {
            mark: "★",
            title: "오늘의 그림",
            image: "images/sample-1.png",
          },
          "2026-10-24": {
            mark: "●",
            title: "캐릭터A 생일",
            open: "char-a",
          },
        },
      },
    },

    // ─── [7-5] 자유 폴더 (폴더 안에 폴더, 파일, 그림 마음대로) ───
    {
      id: "free",
      slot: 21,
      label: "자유 폴더",
      icon: "folder",
      color: "#b8e986",
      window: {
        type: "folder",
        title: "자유 폴더",
        items: [
          {
            label: "그림 모음",
            icon: "folder",
            window: {
              type: "folder",
              title: "그림 모음",
              items: [
                {
                  label: "샘플1.png",
                  icon: "image",
                  window: { type: "image", title: "샘플1.png - 그림 보기", src: "images/sample-1.png" },
                },
                {
                  label: "샘플2.png",
                  icon: "images/sample-2.png",      // 그림 자체를 아이콘으로!
                  window: { type: "image", title: "샘플2.png - 그림 보기", src: "images/sample-2.png" },
                },
              ],
            },
          },
          {
            label: "비밀 폴더",
            icon: "folder",
            color: "#c49bff",
            window: {
              type: "folder",
              title: "비밀 폴더",
              items: [
                {
                  label: "비밀.txt",
                  icon: "file",
                  window: { type: "text", title: "비밀.txt - 메모장", text: "폴더 안의 폴더 안의 파일이에요!" },
                },
              ],
            },
          },
          {
            label: "메모.txt",
            icon: "file",
            window: { type: "text", title: "메모.txt - 메모장", text: "자유롭게 쓰는 메모" },
          },
          { label: "음악 바로가기", icon: "music", open: "music" },   // 바로가기 예시
        ],
      },
    },

    // ─── [7-6] 바탕화면에 바로 둔 그림 파일 ───
    {
      id: "pic1",
      slot: 13,
      label: "그림.png",
      icon: "image",
      window: { type: "image", title: "그림.png - 그림 보기", src: "images/sample-1.png" },
    },

    // ─── [7-7] 읽어주세요.txt ───
    {
      id: "readme",
      slot: 16,
      label: "읽어주세요.txt",
      icon: "file",
      window: {
        type: "text",
        title: "읽어주세요.txt - 메모장",
        text: `공지사항을 적는 곳이에요.

- 무단 사용 금지
- 업데이트 소식은 여기에!`,
      },
    },

    // ─── [7-8] 휴지통 ───
    {
      id: "trash",
      slot: 5,
      label: "휴지통",
      icon: "trash",
      window: {
        type: "text",
        title: "휴지통",
        text: "휴지통이 비어 있습니다.",
        status: "0개 개체",
      },
    },

  ],

  /* ==============================================================
     [8] 숨은 프로그램 (바탕화면엔 없고 링크로 여는 창)
     ============================================================== */
  //  바탕화면에는 안 보이지만 링크(data-open), 시작 메뉴(open), 팝업 버튼(open)으로 열 수 있는 창들.
  //  바탕화면에도 두고 싶으면 이 { } 덩어리를 desktopIcons 안으로 옮기면 돼요.
  programs: [

    // ─── [8-1] 관계도 ───
    {
      id: "relations",
      label: "관계도",
      icon: "relation",
      window: {
        type: "relation",
        title: "관계도",
        background: "",       // 바탕색 (비우면 흰 바탕에 점무늬)
        // 인물과 화살표는 characters.js 에서 자동으로 가져와요.
      },
    },

    // ─── [8-2] 타자연습 ───
    {
      id: "typing",
      label: "타자연습",
      icon: "keyboard",
      window: {
        type: "typing",
        title: "타자연습",
        heading: "긴 글 연습",      // 위쪽 나무 명패 글씨
        order: "order",           // "order" = 적은 순서대로 / "random" = 섞어서
        count: 0,                 // 한 판에 칠 문장 수 (0 = 전부)
        linesPerPage: 5,          // 한 쪽에 보이는 줄 수
        maxCpm: 600,              // 타수 막대가 꽉 차는 타수
        endText: "수고했어요!",     // 결과 창 첫 줄

        // 오른쪽 초상화: 문장의 who 와 이름이 같은 캐릭터의 face 그림이 자동으로 나와요 (characters.js)
        //  다른 그림을 쓰고 싶을 때만 아래 characters 에 적으세요
        portrait: "",             // 기본 초상화 (who 가 없거나 목록에 없을 때)
        characters: {
          // "캐릭터A": "images/charA.png",
          // "캐릭터B": "images/charB.png",
        },
        defaultName: "",          // who 가 없을 때 이름 칸에 보일 글씨

        // 색 (비우면 홈페이지 기본 색)
        theme: {
          paper: "",              // 종이 색 (기본 흰색)
          textColor: "",          // 따라 칠 글씨 색 (기본 남색)
          barColor: "",           // 시계·막대 글씨와 막대 색 (기본 초록)
          panel: "",              // 시계·아래 칸 바탕색 (기본 검정)
        },

        // 따라 칠 문장들. who 는 말하는 사람 (없어도 돼요)
        //  image 를 적으면 그 줄에서만 다른 초상화가 나와요
        sentences: [
          { who: "캐릭터A", text: "오늘도 좋은 하루 보내!" },
          { who: "캐릭터B", text: "푸딩은 몇 개까지 쌓을 수 있을까?" },
          { who: "캐릭터C", text: "이 홈페이지에 온 걸 환영해." },
          { who: "캐릭터A", text: "천천히 정확하게 치는 게 더 중요해." },
          { who: "캐릭터B", text: "다 치면 결과를 보여줄게!" },
          { text: "다람쥐 헌 쳇바퀴에 타고파" },
        ],
      },
    },

    // ─── [8-3] 푸딩쌓기 (쌓기 게임) ───
    {
      id: "stack",
      label: "푸딩쌓기",
      icon: "pudding",
      window: {
        type: "stack",
        title: "푸딩쌓기",
        // 쌓을 그림들 (여러 개 넣으면 랜덤으로 나와요). 비우면 기본 푸딩 그림.
        //  배경이 투명한 PNG 를 쓰면 예뻐요!
        images: [
          "images/pudding-1.png",
          "images/pudding-2.png",
          "images/pudding-3.png",
        ],
        itemWidth: 72,        // 그림 하나의 가로 크기 (세로는 그림 비율대로)
        pixel: true,          // 도트 그림이면 true (흐려지지 않게)
        speed: 1,             // 움직이는 속도 (1 = 보통, 1.5 = 빠르게)
        background: "#fff4e0",// 게임 배경색
        groundColor: "#c8a27a",// 접시(바닥) 색
        startText: "클릭하거나 스페이스바로 떨어뜨리기!",
        overText: "와르르!",
      },
    },

  ],

  /* ==============================================================
     [9] 시작 메뉴 (위에서부터 순서대로)
     ============================================================== */
  //  open: "아이콘 id"  → 그 창을 열어요
  //  link: "주소"       → 새 탭으로 링크를 열어요
  //  reboot: true       → 창을 모두 닫고 로딩 화면으로 돌아가요
  //  { separator: true } → 구분선
  startMenu: [
    { label: "내 컴퓨터", icon: "computer", open: "mycomputer" },
    { label: "인터넷", icon: "browser", open: "browser" },
    { label: "뮤직플레이어", icon: "music", open: "music" },
    { label: "달력", icon: "calendar", open: "calendar" },
    { label: "타자연습", icon: "keyboard", open: "typing" },
    { label: "푸딩쌓기", icon: "pudding", open: "stack" },
    { label: "읽어주세요", icon: "info", open: "readme" },
    { separator: true },
    { label: "시스템 종료...", icon: "power", reboot: true },
  ],

};
