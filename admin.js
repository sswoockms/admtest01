/* ==========================================================
   admin.js : OC World 98 사이트 편집기와 설치 화면
   ----------------------------------------------------------
   주소 뒤에 #admin 을 붙이면 편집기, #setup 을 붙이면 설치 화면이 열립니다.
   저장하면 Firestore(oc_site/config)에 기록됩니다. 이미지 파일은 업로드하지 않고
   images 폴더의 경로만 저장합니다. 권한 확인은 Firebase 보안 규칙이 담당합니다.
   ========================================================== */
(function () {
  'use strict';

  var FBC = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG) || {};
  var FBO = (typeof FIREBASE_OPTIONS !== 'undefined' && FIREBASE_OPTIONS) || {};
  var PREFIX = FBO.collectionPrefix != null ? FBO.collectionPrefix : 'oc_';
  var VER = FBO.sdkVersion || '10.12.2';
  var BASE = 'https://www.gstatic.com/firebasejs/' + VER + '/';
  var KEY = 'oc-site-override-v1';
  var CONFIGURED = !!(FBC.apiKey && FBC.projectId);

  var TABS = [
    ['basic', '기본 정보'], ['theme', '색상과 바탕화면'], ['sounds', '효과음'], ['loading', '로딩 화면'],
    ['popups', '팝업'], ['startup', '시작 시 열리는 창'], ['desktopGrid', '바탕화면 격자'],
    ['desktopIcons', '바탕화면 아이콘'], ['programs', '숨은 프로그램'], ['startMenu', '시작 메뉴'],
    ['characters', '캐릭터'], ['relations', '관계도']
  ];
  var BASIC_KEYS = ['pageTitle', 'osName', 'startButtonText', 'menuBar'];

  var LABEL = {
    pageTitle: '탭 제목', osName: 'OS 이름', startButtonText: '시작 버튼 문구', menuBar: '메뉴 막대',
    desktop: '바탕화면 색', wallpaper: '바탕화면 이미지', wallpaperMode: '이미지 배치',
    titleActive: '활성 창 제목줄', titleInactive: '비활성 창 제목줄', selection: '선택 색', startIconColor: '시작 버튼 아이콘 색',
    enabled: '사용', volume: '음량', showButton: '음소거 버튼 표시', click: '클릭음', open: '열 아이콘 ID', popup: '팝업음', startup: '시작음',
    background: '배경색', backgroundImage: '배경 이미지', logo: '로고 이미지', title: '제목', subtitle: '부제목',
    textColor: '글자색', barColor: '진행 막대 색', duration: '로딩 시간(ms)', messages: '로딩 문구',
    clickToStart: '클릭하면 시작', clickText: '시작 안내 문구', show: '표시', icon: '아이콘', text: '내용', image: '이미지',
    titleColor: '제목줄 색', once: '첫 방문 때만', buttons: '버튼', label: '이름', reply: '응답', link: '링크',
    windows: '창 목록', left: '왼쪽 여백', right: '오른쪽 여백', top: '위쪽 여백', bottom: '아래쪽 여백',
    rows: '세로 칸 수', cellWidth: '칸 너비', showNumbers: '칸 번호 표시', id: '아이디', slot: '칸 번호',
    color: '색', window: '열리는 창', type: '창 종류', items: '항목', src: '경로', pixel: '도트 이미지',
    width: '너비', height: '높이', status: '상태 표시', separator: '구분선', reboot: '재시작',
    home: '시작 페이지', placeholder: '입력 안내', history: '검색 기록', bookmarks: '즐겨찾기', pages: '페이지',
    searchHome: '검색 첫 화면', address: '주소', keyword: '검색어', html: '본문(HTML)', page: '이동할 페이지',
    tracks: '곡 목록', artist: '아티스트', cover: '앨범 이미지', startMonth: '시작 월', hint: '안내 문구', entries: '날짜별 기록',
    mark: '표시', category: '분류', creator: '제작자', date: '날짜', rating: '평점', short: '한 줄 평',
    sentences: '문장', who: '화자', heading: '제목 문구', order: '순서', count: '문장 수', images: '이미지',
    name: '이름', intro: '소개', face: '얼굴 이미지', folderColor: '폴더 색', relationPos: '관계도 위치',
    profile: '프로필', profileImage: '프로필 이미지', pictures: '그림', pairs: '페어', extra: '추가 정보',
    with: '상대', me: '내 감정', them: '상대 감정', note: '페어 설정', from: '출발', to: '도착',
    back: '반대 방향 감정', backDesc: '반대 방향 설명', both: '양방향 동일', style: '선 종류', desc: '설명', labelAt: '이름표 위치',
    moreItems: '추가 항목', caption: '캡션', x: 'X (0~100)', y: 'Y (0~100)'
  };
  var PLACEHOLDER = { wallpaperMode: 'tile 또는 cover', style: 'solid, dashed, dotted' };
  var LONG = { text: 1, html: 1, profile: 1, note: 1, desc: 1, backDesc: 1, intro: 1, caption: 1, short: 1 };
  var IMGK = { src: 1, image: 1, face: 1, profileImage: 1, cover: 1, logo: 1, wallpaper: 1, backgroundImage: 1,
               logoImage: 1, portrait: 1, images: 1 };

  var st = { user: null, fb: null, draft: null, dirty: false, tab: 'basic', root: null, view: 'admin',
             pvMobile: false, pvFrame: null, pvBody: null, pvTimer: null, pvOpen: '' };

  function $(s, e) { return (e || document).querySelector(s); }
  function h(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) Object.keys(a).forEach(function (k) {
      if (k === 'class') e.className = a[k]; else if (k === 'text') e.textContent = a[k];
      else if (k.slice(0, 2) === 'on') e[k] = a[k]; else if (a[k] != null) e.setAttribute(k, a[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function blank(v) {
    if (Array.isArray(v)) return [];
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function (k) { o[k] = blank(v[k]); }); return o; }
    if (typeof v === 'number') return 0; if (typeof v === 'boolean') return false; return '';
  }
  function toast(msg, bad) {
    var t = $('#oca-toast'); if (!t) return;
    t.textContent = msg; t.className = 'oca-toast is-on' + (bad ? ' is-bad' : '');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = 'oca-toast'; }, 3400);
  }
  function emails() {
    return (FBO.adminEmails || []).map(function (x) { return String(x).trim().toLowerCase(); }).filter(Boolean);
  }
  function isAdmin() { return !!(st.user && emails().indexOf((st.user.email || '').toLowerCase()) >= 0); }
  function wide() { return window.innerWidth >= 1000; }

  function touch() {
    st.dirty = true;
    var b = $('#oca-save'); if (b) b.disabled = false;
    var d = $('#oca-dirty'); if (d) d.hidden = false;
    schedulePreview();
  }

  /* ---------- Firebase (로그인과 저장 전용) ---------- */
  function fb() {
    if (st.fb) return st.fb;
    if (!CONFIGURED) return Promise.reject(new Error('Firebase가 연결되지 않았습니다.'));
    st.fb = Promise.all([import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')])
      .then(function (m) {
        var app = m[0].getApps().some(function (a) { return a.name === 'oc-admin'; })
          ? m[0].getApp('oc-admin') : m[0].initializeApp(FBC, 'oc-admin');
        return { auth: m[1], fs: m[2], a: m[1].getAuth(app), db: m[2].getFirestore(app) };
      });
    return st.fb;
  }

  /* ==========================================================
     스타일
     색상: Radix Colors (gray, blue, red, green). 단계별 용도를 따릅니다.
       1 앱 배경  2 보조 배경  3 4 5 컴포넌트 배경(기본, 호버, 선택)
       6 구분선  7 컴포넌트 테두리  8 호버 테두리와 포커스  9 10 단색 배경  11 보조 텍스트  12 본문 텍스트
     글자 크기: 12 / 14 / 18 (세 가지)   테두리: 0.5px   둥근 모서리: 바깥 12, 안쪽 4 (안쪽 = 바깥 - 여백, 최소 4)
     ========================================================== */
  function injectCss() {
    if ($('#oca-css')) return;
    var css =
      '#oca{--gray-1:#fcfcfc;--gray-2:#f9f9f9;--gray-3:#f0f0f0;--gray-4:#e8e8e8;--gray-5:#e0e0e0;--gray-6:#d9d9d9;--gray-7:#cecece;--gray-8:#bbbbbb;--gray-9:#8d8d8d;--gray-10:#838383;--gray-11:#646464;--gray-12:#202020;' +
      '--blue-3:#e6f4fe;--blue-4:#d5efff;--blue-5:#c2e5ff;--blue-8:#5eb1ef;--blue-9:#0090ff;--blue-10:#0588f0;--blue-11:#0d74ce;' +
      '--red-3:#feebec;--red-4:#ffdbdc;--red-7:#f4a9aa;--red-9:#e5484d;--red-11:#ce2c31;--green-11:#218358}' +
      '@media(prefers-color-scheme:dark){#oca{--gray-1:#111111;--gray-2:#191919;--gray-3:#222222;--gray-4:#2a2a2a;--gray-5:#313131;--gray-6:#3a3a3a;--gray-7:#484848;--gray-8:#606060;--gray-9:#6e6e6e;--gray-10:#7b7b7b;--gray-11:#b4b4b4;--gray-12:#eeeeee;' +
      '--blue-3:#0d2847;--blue-4:#003362;--blue-5:#004074;--blue-8:#2870bd;--blue-9:#0090ff;--blue-10:#3b9eff;--blue-11:#70b8ff;' +
      '--red-3:#3b1219;--red-4:#500f1c;--red-7:#8c333a;--red-9:#e5484d;--red-11:#ff9592;--green-11:#3dd68c}}' +
      '.cp-backdrop{z-index:100002!important}' +
      '#oca{position:fixed;inset:0;z-index:100000;background:var(--gray-2);color:var(--gray-12);font:400 14px/1.5 "Pretendard","Malgun Gothic",system-ui,sans-serif;overflow:auto}' +
      '#oca *{box-sizing:border-box}#oca[hidden]{display:none}#oca{accent-color:var(--blue-9)}' +
      ':where(#oca) :is(button,input,select,textarea){font:inherit}' +
      /* 상단 막대 */
      '.oca-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;background:var(--gray-1);border-bottom:0.5px solid var(--gray-6)}' +
      '.oca-top b{font-weight:600;margin-right:8px}.oca-sp{flex:1}' +
      /* 버튼 */
      '.oca-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 12px;border:0.5px solid var(--gray-7);border-radius:4px;background:var(--gray-1);color:var(--gray-12);font:inherit;cursor:pointer;text-decoration:none;white-space:nowrap}' +
      '.oca-btn:hover{background:var(--gray-3)}.oca-btn:active{background:var(--gray-4)}.oca-btn[disabled]{color:var(--gray-9);background:var(--gray-3);cursor:default}' +
      '.oca-btn.is-main{background:var(--blue-9);border-color:var(--blue-9);color:#fff}.oca-btn.is-main:hover{background:var(--blue-10)}.oca-btn.is-main[disabled]{background:var(--gray-4);border-color:var(--gray-4);color:var(--gray-9)}' +
      '.oca-btn.is-quiet{border-color:transparent;background:transparent;color:var(--gray-11)}.oca-btn.is-quiet:hover{background:var(--gray-3)}' +
      '.oca-btn.is-bad{color:var(--red-11);border-color:var(--red-7)}.oca-btn.is-bad:hover{background:var(--red-3)}' +
      '.oca-mini{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 6px;border:0.5px solid var(--gray-7);border-radius:4px;background:var(--gray-1);color:var(--gray-11);font:inherit;font-size:12px;cursor:pointer}' +
      '.oca-mini:hover{background:var(--gray-3);color:var(--gray-12)}' +
      '.oca-seg{display:inline-flex;border:0.5px solid var(--gray-7);border-radius:4px;overflow:hidden}.oca-seg button{height:28px;padding:0 12px;border:0;background:var(--gray-1);color:var(--gray-11);font:inherit;font-size:12px;cursor:pointer}' +
      '.oca-seg button+button{border-left:0.5px solid var(--gray-7)}.oca-seg button.is-on{background:var(--blue-4);color:var(--blue-11);font-weight:600}' +
      /* 입력 */
      '.oca-in,.oca-ta,.oca-sel{width:100%;height:32px;padding:0 8px;border:0.5px solid var(--gray-7);border-radius:4px;background:var(--gray-1);color:var(--gray-12);font:inherit}' +
      '.oca-ta{height:auto;min-height:72px;padding:6px 8px;resize:vertical}.oca-sel{width:auto}' +
      '.oca-in:hover,.oca-ta:hover,.oca-sel:hover{border-color:var(--gray-8)}' +
      '#oca :focus-visible{outline:2px solid var(--blue-8);outline-offset:-1px}' +
      '.oca-in::placeholder,.oca-ta::placeholder{color:var(--gray-9)}' +
      '.oca-line{display:flex;gap:8px;align-items:center}.oca-line>.oca-grow{flex:1;min-width:0}' +
      '.oca-line img{width:32px;height:32px;flex:none;object-fit:contain;border:0.5px solid var(--gray-6);border-radius:4px;background:var(--gray-3);image-rendering:pixelated}' +
      '.oca-line input[type=color]{width:32px;height:32px;flex:none;padding:2px;border:0.5px solid var(--gray-7);border-radius:4px;background:var(--gray-1)}' +
      /* 본문 배치 */
      '.oca-main{display:grid;grid-template-columns:152px minmax(0,1fr);gap:16px;padding:16px}' +
      '.oca-nav{display:flex;flex-direction:column;gap:2px;position:sticky;top:64px;align-self:start}' +
      '.oca-nav button{height:32px;padding:0 12px;border:0;border-radius:4px;background:transparent;color:var(--gray-11);font:inherit;text-align:left;cursor:pointer}' +
      '.oca-nav button:hover{background:var(--gray-3)}.oca-nav button.is-on{background:var(--blue-4);color:var(--blue-11);font-weight:600}' +
      '.oca-panel{min-width:0;padding:12px;border:0.5px solid var(--gray-6);border-radius:12px;background:var(--gray-1)}' +
      '.oca-row{display:grid;grid-template-columns:128px minmax(0,1fr);gap:12px;margin:8px 0;align-items:start}' +
      '.oca-lab{display:flex;align-items:center;min-height:32px;color:var(--gray-11);font-size:12px;font-weight:500}' +
      '.oca-box{margin:8px 0;padding:0 8px 8px;border:0.5px solid var(--gray-6);border-radius:4px;background:var(--gray-2)}' +
      '.oca-box>summary{display:flex;align-items:center;gap:8px;min-height:40px;cursor:pointer;font-weight:600}.oca-box>summary:hover{color:var(--blue-11)}' +
      '.oca-box .oca-box{background:var(--gray-1)}' +
      '.oca-add{margin-top:8px}.oca-note{margin:4px 0;color:var(--gray-11);font-size:12px}' +
      '.oca-menu{display:flex;flex-direction:column;margin-top:8px;padding:4px;border:0.5px solid var(--gray-7);border-radius:8px;background:var(--gray-1)}' +
      '.oca-menu[hidden]{display:none}.oca-mi{display:flex;align-items:center;height:32px;padding:0 8px;border:0;border-radius:4px;background:transparent;color:var(--gray-12);font:inherit;text-align:left;cursor:pointer}' +
      '.oca-mi:hover{background:var(--gray-3)}' +
      /* 미리보기 */
      '.oca-split{display:flex;height:calc(100vh - 48px)}.oca-ed{flex:1 1 46%;min-width:460px;overflow:auto}' +
      '.oca-pv{flex:1 1 54%;min-width:0;display:flex;flex-direction:column;border-right:0.5px solid var(--gray-6);background:var(--gray-3)}' +
      '.oca-pvbar{display:flex;align-items:center;gap:8px;height:44px;padding:0 12px;background:var(--gray-1);border-bottom:0.5px solid var(--gray-6)}.oca-pvbar b{font-weight:600}' +
      '.oca-pvbody{flex:1;position:relative;overflow:hidden}' +
      '.oca-pvbody iframe{position:absolute;left:0;top:0;border:0;background:var(--gray-1);transform-origin:0 0;outline:0.5px solid var(--gray-7)}' +
      '.oca-split .oca-main{grid-template-columns:112px minmax(0,1fr);gap:12px;padding:12px}' +
      '.oca-split .oca-nav{top:12px;max-height:calc(100vh - 72px);overflow:auto}' +
      '.oca-split .oca-nav button{padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.oca-split .oca-row{grid-template-columns:96px minmax(0,1fr)}' +
      '@media(max-width:999px){.oca-main{grid-template-columns:minmax(0,1fr)}.oca-nav{position:static;flex-direction:row;flex-wrap:wrap}.oca-row{grid-template-columns:minmax(0,1fr);gap:0}}' +
      /* 알림 */
      '.oca-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:90vw;padding:8px 12px;border-radius:4px;background:var(--gray-12);color:var(--gray-1);opacity:0;pointer-events:none;transition:opacity 250ms ease-out;z-index:100001}' +
      '.oca-toast.is-on{opacity:1}.oca-toast.is-bad{background:var(--red-9);color:#fff}' +
      /* 로그인과 설치 */
      '.oca-login{display:flex;flex-direction:column;gap:8px;max-width:360px;margin:96px auto;padding:16px;border:0.5px solid var(--gray-6);border-radius:12px;background:var(--gray-1)}' +
      '.oca-login h2{margin:0 0 8px;font-size:18px;font-weight:600}.oca-login .oca-btn{width:100%}' +
      '.oca-login details>summary{cursor:pointer;color:var(--gray-11);height:32px;display:flex;align-items:center}.oca-login details .oca-in{margin-bottom:8px}' +
      '.oca-setup{max-width:720px;margin:0 auto;padding:16px 16px 48px}' +
      '.oca-step{padding:16px 0;border-top:0.5px solid var(--gray-6)}.oca-step:first-child{border-top:0}' +
      '.oca-step h3{margin:0 0 4px;font-size:14px;font-weight:600}.oca-step .oca-ta,.oca-step .oca-in{margin:8px 0}' +
      '.oca-pre{margin:8px 0 0;padding:12px;border-radius:4px;background:var(--gray-3);color:var(--gray-12);font:12px/1.5 Consolas,monospace;white-space:pre-wrap;word-break:break-all}' +
      '.oca-ok{color:var(--green-11)}.oca-ul{margin:8px 0 0;padding-left:20px}.oca-ul li{margin:4px 0}';
    document.head.appendChild(h('style', { id: 'oca-css', text: css }));
  }

  /* ---------- 미리보기 ---------- */
  function schedulePreview() {
    if (!st.pvFrame) return;
    clearTimeout(st.pvTimer);
    st.pvTimer = setTimeout(function () { try { st.pvFrame.contentWindow.location.reload(); } catch (e) {} }, 700);
  }
  function layoutPreview() {
    if (!st.pvFrame || !st.pvBody) return;
    var w = st.pvMobile ? 420 : 1280, pw = st.pvBody.clientWidth, ph = st.pvBody.clientHeight;
    if (!pw || !ph) return;
    var s = Math.min(pw / w, 1);
    st.pvFrame.style.width = w + 'px'; st.pvFrame.style.height = (ph / s) + 'px';
    st.pvFrame.style.transform = 'scale(' + s + ')'; st.pvFrame.style.marginLeft = Math.max(0, (pw - w * s) / 2) + 'px';
  }
  function previewPane() {
    var base = location.href.split('#')[0].split('?')[0];
    var pc = h('button', { type: 'button', text: 'PC' }), mo = h('button', { type: 'button', text: '모바일' });
    function sync() { pc.className = st.pvMobile ? '' : 'is-on'; mo.className = st.pvMobile ? 'is-on' : ''; layoutPreview(); }
    pc.onclick = function () { st.pvMobile = false; sync(); }; mo.onclick = function () { st.pvMobile = true; sync(); };
    var bar = h('div', { class: 'oca-pvbar' }, [h('b', { text: '미리보기' }), h('span', { class: 'oca-sp' }), h('div', { class: 'oca-seg' }, [pc, mo])]);
    var body = h('div', { class: 'oca-pvbody' });
    var fr = h('iframe', { title: '사이트 미리보기', src: base + '?preview=1' });
    body.appendChild(fr);
    st.pvFrame = fr; st.pvBody = body; sync();
    setTimeout(layoutPreview, 0);
    if (window.ResizeObserver) new ResizeObserver(layoutPreview).observe(body);
    return h('div', { class: 'oca-pv' }, [bar, body]);
  }

  /* ---------- 추가 틀 ---------- */
  function iconTemplates() {
    return [
      { name: '폴더', value: { label: '새 폴더', icon: 'folder', color: '#f7d64a', window: { type: 'folder', title: '새 폴더', items: [] } } },
      { name: '메모장 파일', value: { label: '메모.txt', icon: 'file', window: { type: 'text', title: '메모.txt - 메모장', text: '' } } },
      { name: '이미지 파일', value: { label: '그림.png', icon: 'image', window: { type: 'image', title: '그림.png - 그림 보기', src: 'images/' } } },
      { name: '바로가기 (창 열기)', value: { label: '바로가기', icon: 'folder', open: '' } },
      { name: '바로가기 (웹사이트)', value: { label: '링크', icon: 'browser', link: 'https://' } }
    ];
  }
  function templatesFor(key, pkey) {
    switch (key) {
      case 'desktopIcons': case 'programs': return iconTemplates();
      case 'items':
        if (pkey === 'pages') return [{ name: '감상 기록', value: { category: '책', title: '', creator: '', date: '', rating: 4, image: '', short: '', text: '' } }];
        return iconTemplates();
      case 'characters':
        if (pkey === 'window') return [];
        return [{ name: '새 캐릭터', value: {
          id: '', name: '새 캐릭터', slot: 0, folderColor: '#f7d64a', face: '', intro: '', relationPos: { x: 50, y: 50 },
          profileImage: '', profile: '이름 : \n나이 : \n생일 : \n좋아하는 것 : ', pictures: [], pairs: [], extra: [] } }];
      case 'pairs': return [{ name: '페어', value: { with: '', me: '', them: '', note: '', pictures: [] } }];
      case 'pictures': return [{ name: '그림', value: { src: 'images/', title: '', date: '', caption: '' } }];
      case 'extra': return [{ name: '추가 정보', value: { title: '새 메모', text: '' } }];
      case 'relations': return [{ name: '관계 화살표', value: { from: '', to: '', label: '', color: '#ff5fa2', desc: '' } }];
      case 'popups': return [{ name: '팝업', value: { show: true, title: '알림', icon: 'info', text: '', buttons: [{ label: 'OK' }] } }];
      case 'buttons': return [{ name: '버튼', value: { label: '', reply: '' } }];
      case 'tracks': return [{ name: '곡', value: { title: '', artist: '', src: 'music/', cover: '' } }];
      case 'sentences': return [{ name: '문장', value: { who: '', text: '' } }];
      case 'startMenu': return [
        { name: '메뉴 항목 (창 열기)', value: { label: '', icon: 'folder', open: '' } },
        { name: '메뉴 항목 (링크)', value: { label: '', icon: 'browser', link: 'https://' } },
        { name: '구분선', value: { separator: true } }];
      case 'windows': return [{ name: '창', value: { open: '', left: 40, top: 40 } }];
      case 'history': case 'bookmarks': return [{ name: '항목', value: { text: '', page: '' } }];
      case 'pages': return [{ name: '페이지', value: { id: '', address: 'oc://new', title: '새 페이지', keyword: '', html: '<h1>제목</h1>\n<p>내용</p>\n<p><a data-page="home">홈으로</a></p>' } }];
    }
    return [];
  }
  var ICONISH = { desktopIcons: 1, programs: 1, items: 1 };
  var OPTIONAL = {
    icon: { slot: 0, color: '#f7d64a', open: '', link: '', id: '' },
    window: { width: 400, height: 300, left: 100, top: 50, image: '', status: '' },
    characters: { face: '', profileImage: '', relationPos: { x: 50, y: 50 }, folderColor: '#f7d64a', slot: 0, moreItems: [] },
    popups: { titleColor: ['#000080', '#1084d0'], background: '', once: true, image: '' },
    relations: { back: '', backDesc: '', both: true, style: 'solid', labelAt: 0.5 },
    buttons: { image: '', open: '', link: '' }
  };
  function optionalFor(key) { return ICONISH[key] ? OPTIONAL.icon : OPTIONAL[key]; }

  /* ---------- 값 편집기 ---------- */
  function ids() { return ((st.draft && st.draft.characters) || []).map(function (c) { return c.id; }).filter(Boolean); }
  function colorKey(k, v) { return /^#[0-9a-f]{6}$/i.test(v) || /(olor|ackground|^desktop$|^selection$|^paper$|^panel$)/.test(k); }
  function stringEd(val, set, key, pkey) {
    if ((key === 'from' || key === 'to' || key === 'with') && ids().length) {
      var list = ids().slice(); if (val && list.indexOf(val) < 0) list.push(val);
      var sel = h('select', { class: 'oca-sel', style: 'width:100%' }, [h('option', { value: '', text: '선택' })].concat(list.map(function (i) {
        var c = st.draft.characters.filter(function (x) { return x.id === i; })[0];
        return h('option', { value: i, text: i + (c && c.name ? ' (' + c.name + ')' : '') });
      })));
      sel.value = val; sel.onchange = function () { set(sel.value); touch(); }; return sel;
    }
    var long = LONG[key] || String(val).indexOf('\n') >= 0;
    var inp = long ? h('textarea', { class: 'oca-ta' }) : h('input', { class: 'oca-in', type: 'text' });
    inp.value = val;
    var isImg = (IMGK[key] || IMGK[pkey] || (key === 'icon' && /[\/.]/.test(val))) && pkey !== 'tracks';
    if (isImg) inp.placeholder = 'images/파일명.png';
    else if (pkey === 'tracks' && key === 'src') inp.placeholder = 'music/파일명.mp3';
    else if (PLACEHOLDER[key]) inp.placeholder = PLACEHOLDER[key];
    var line = h('div', { class: 'oca-line' }), prev = null, col = null;
    inp.className += ' oca-grow';
    inp.oninput = function () {
      set(inp.value); touch();
      if (prev) { prev.src = inp.value; prev.style.visibility = inp.value ? 'visible' : 'hidden'; }
      if (col && /^#[0-9a-f]{6}$/i.test(inp.value)) col.value = inp.value;
    };
    if (isImg) {
      prev = h('img', { alt: '' }); prev.src = val || ''; prev.style.visibility = val ? 'visible' : 'hidden';
      prev.onerror = function () { prev.style.visibility = 'hidden'; };
      line.appendChild(prev);
    }
    line.appendChild(inp);
    if (!long && colorKey(key, val)) {
      col = h('input', { type: 'color', 'aria-label': '색 선택' }); col.value = /^#[0-9a-f]{6}$/i.test(val) ? val : '#ffffff';
      col.oninput = function () { inp.value = col.value; set(col.value); touch(); };
      withPicker(function () { window.ColorPicker.attach(col); });
      line.appendChild(col);
    }
    return line;
  }
  function valueEd(val, set, key, pkey) {
    if (Array.isArray(val)) return arrayEd(val, key, pkey);
    if (val && typeof val === 'object') {
      return (key === 'entries' || (key === 'characters' && pkey === 'window')) ? dictEd(val, key) : objectEd(val, key);
    }
    if (typeof val === 'boolean') {
      var c = h('input', { type: 'checkbox' }); c.checked = val; c.onchange = function () { set(c.checked); touch(); };
      return h('label', { class: 'oca-line', style: 'min-height:32px' }, [c, h('span', { text: '사용' })]);
    }
    if (typeof val === 'number') {
      var n = h('input', { class: 'oca-in', type: 'number', step: 'any' }); n.value = val;
      n.oninput = function () { set(n.value === '' ? 0 : Number(n.value)); touch(); }; return n;
    }
    return stringEd(val == null ? '' : String(val), set, key, pkey);
  }
  function rowOf(k, v, set, parentKey) {
    var ed = valueEd(v, set, k, parentKey);
    if (v && typeof v === 'object') return h('details', { class: 'oca-box' }, [h('summary', { text: LABEL[k] || k }), ed]);
    return h('div', { class: 'oca-row' }, [h('div', { class: 'oca-lab', text: LABEL[k] || k }), ed]);
  }
  function objectEd(obj, key) {
    var box = h('div');
    function draw() {
      box.innerHTML = '';
      Object.keys(obj).forEach(function (k) { box.appendChild(rowOf(k, obj[k], function (nv) { obj[k] = nv; }, key)); });
      var opt = optionalFor(key);
      if (opt) {
        var missing = Object.keys(opt).filter(function (k) { return !(k in obj); });
        if (missing.length) {
          var sel = h('select', { class: 'oca-sel' }, [h('option', { value: '', text: '항목 추가' })].concat(missing.map(function (k) { return h('option', { value: k, text: LABEL[k] || k }); })));
          sel.onchange = function () { if (!sel.value) return; obj[sel.value] = clone(opt[sel.value]); touch(); draw(); };
          box.appendChild(h('div', { class: 'oca-add' }, [sel]));
        }
      }
    }
    draw(); return box;
  }
  /* 이름과 값의 목록 (달력 날짜별 기록, 타자연습 초상화) */
  function dictEd(obj, key) {
    var box = h('div');
    var ph = key === 'entries' ? 'YYYY-MM-DD' : '이름';
    function draw() {
      box.innerHTML = '';
      Object.keys(obj).forEach(function (name) {
        var v = obj[name];
        var nm = h('input', { class: 'oca-in oca-grow', type: 'text', placeholder: ph }); nm.value = name;
        nm.onchange = function () {
          var nn = nm.value.trim(); if (!nn || nn === name || (nn in obj)) { nm.value = name; return; }
          var next = {}; Object.keys(obj).forEach(function (k) { next[k === name ? nn : k] = obj[k]; });
          Object.keys(obj).forEach(function (k) { delete obj[k]; }); Object.assign(obj, next); touch(); draw();
        };
        var rm = h('button', { class: 'oca-mini', type: 'button', text: '삭제', 'aria-label': '삭제' });
        rm.onclick = function () { if (confirm('삭제할까요?')) { delete obj[name]; touch(); draw(); } };
        var body = (v && typeof v === 'object') ? objectEd(v, 'entry') : valueEd(v, function (nv) { obj[name] = nv; }, 'image', key);
        box.appendChild(h('div', { class: 'oca-box', style: 'padding-top:8px' }, [h('div', { class: 'oca-line' }, [nm, rm]), body]));
      });
      var add = h('button', { class: 'oca-btn oca-add', type: 'button', text: '+ 추가' });
      add.onclick = function () {
        var sample = Object.keys(obj).length ? obj[Object.keys(obj)[0]] : (key === 'entries' ? {} : '');
        var base = key === 'entries' ? new Date().toISOString().slice(0, 10) : '새 이름', nn = base, i = 1;
        while (nn in obj) nn = base + ' ' + (++i);
        obj[nn] = key === 'entries' ? { mark: '♥', title: '', text: '' } : (typeof sample === 'object' ? blank(sample) : 'images/');
        touch(); draw();
      };
      box.appendChild(add);
    }
    draw(); return box;
  }
  function itemTitle(item, i) {
    if (item && typeof item === 'object') {
      if (item.separator) return (i + 1) + '. 구분선';
      if (item.from) return (i + 1) + '. ' + item.from + ' → ' + (item.to || '');
      var k = ['label', 'name', 'title', 'id', 'text', 'with', 'open'].filter(function (x) { return item[x] && typeof item[x] === 'string'; })[0];
      if (k) return (i + 1) + '. ' + item[k].slice(0, 36);
    }
    return String(i + 1);
  }
  function arrayEd(arr, key, pkey) {
    var box = h('div');
    function draw() {
      box.innerHTML = '';
      var simple = arr.every(function (x) { return typeof x !== 'object'; });
      arr.forEach(function (item, i) {
        function ctl() {
          var up = h('button', { class: 'oca-mini', type: 'button', text: '↑', 'aria-label': '위로' });
          var dn = h('button', { class: 'oca-mini', type: 'button', text: '↓', 'aria-label': '아래로' });
          var rm = h('button', { class: 'oca-mini', type: 'button', text: '삭제' });
          up.onclick = function (e) { e.preventDefault(); if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); touch(); draw(); } };
          dn.onclick = function (e) { e.preventDefault(); if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); touch(); draw(); } };
          rm.onclick = function (e) { e.preventDefault(); if (confirm('이 항목을 삭제할까요?')) { arr.splice(i, 1); touch(); draw(); } };
          return [up, dn, rm];
        }
        if (simple) {
          box.appendChild(h('div', { class: 'oca-line', style: 'margin:4px 0' }, [h('div', { class: 'oca-grow' }, [valueEd(item, function (nv) { arr[i] = nv; }, key, key)])].concat(ctl())));
        } else {
          var sum = h('summary', null, [h('span', { text: itemTitle(item, i) }), h('span', { class: 'oca-sp' })].concat(ctl()));
          var d = h('details', { class: 'oca-box' }, [sum, valueEd(item, function (nv) { arr[i] = nv; }, key, key)]);
          if (ICONISH[key] && item && item.id) d.ontoggle = function () { if (d.open) { st.pvOpen = item.id; schedulePreview(); } };
          if (key === 'characters' && pkey !== 'window' && item && item.id) d.ontoggle = function () { if (d.open) { st.pvOpen = 'char-' + item.id; schedulePreview(); } };
          box.appendChild(d);
        }
      });
      var tpls = templatesFor(key, pkey);
      var add = h('button', { class: 'oca-btn oca-add', type: 'button', text: '+ 추가' });
      var menu = h('div', { class: 'oca-menu' }); menu.hidden = true;
      function push(v) { arr.push(v); touch(); menu.hidden = true; draw(); }
      add.onclick = function () {
        if (!tpls.length) { push(arr.length ? blank(arr[arr.length - 1]) : ''); return; }
        if (tpls.length === 1) { push(clone(tpls[0].value)); return; }
        if (!menu.hidden) { menu.hidden = true; return; }
        menu.innerHTML = '';
        tpls.forEach(function (t) {
          var b = h('button', { class: 'oca-mi', type: 'button', text: t.name });
          b.onclick = function () { push(clone(t.value)); }; menu.appendChild(b);
        });
        menu.hidden = false;
      };
      box.appendChild(add); box.appendChild(menu);
    }
    draw(); return box;
  }

  /* ---------- 편집 화면 ---------- */
  function renderTab(panel) {
    panel.innerHTML = '';
    var d = st.draft;
    if (st.tab === 'basic') {
      BASIC_KEYS.forEach(function (k) { if (k in d.site) panel.appendChild(rowOf(k, d.site[k], function (nv) { d.site[k] = nv; }, 'site')); });
    } else if (st.tab === 'characters') {
      panel.appendChild(valueEd(d.characters, function (nv) { d.characters = nv; }, 'characters', ''));
    } else if (st.tab === 'relations') {
      panel.appendChild(valueEd(d.relations, function (nv) { d.relations = nv; }, 'relations', ''));
    } else {
      panel.appendChild(valueEd(d.site[st.tab], function (nv) { d.site[st.tab] = nv; }, st.tab, ''));
    }
  }
  function renderEditor(body) {
    var nav = h('div', { class: 'oca-nav' }), panel = h('div', { class: 'oca-panel' });
    TABS.forEach(function (t) {
      var b = h('button', { type: 'button', text: t[1] }); b.dataset.k = t[0];
      b.onclick = function () { st.tab = t[0]; st.pvOpen = ''; show(); };
      nav.appendChild(b);
    });
    function show() {
      [].forEach.call(nav.children, function (b) { b.classList.toggle('is-on', b.dataset.k === st.tab); });
      renderTab(panel);
    }
    body.appendChild(h('div', { class: 'oca-main' }, [nav, panel])); show();
  }

  /* ---------- 저장 ---------- */
  function problems() {
    var out = [], seen = {}, chars = st.draft.characters || [];
    chars.forEach(function (c, i) {
      var id = String(c.id || '').trim();
      if (!id) out.push('캐릭터 ' + (i + 1) + '번(' + (c.name || '이름 없음') + ')의 아이디를 입력하세요.');
      else if (!/^[A-Za-z0-9_-]+$/.test(id)) out.push('캐릭터 아이디 "' + id + '"는 영문, 숫자, _, -만 사용할 수 있습니다.');
      else if (seen[id]) out.push('캐릭터 아이디 "' + id + '"가 중복되었습니다.');
      seen[id] = 1;
    });
    (st.draft.relations || []).forEach(function (r, i) {
      if (r.from && !seen[r.from]) out.push('관계도 ' + (i + 1) + '번: "' + r.from + '" 캐릭터가 없습니다.');
      if (r.to && !seen[r.to]) out.push('관계도 ' + (i + 1) + '번: "' + r.to + '" 캐릭터가 없습니다.');
    });
    return out;
  }
  function save() {
    if (!isAdmin()) return toast('관리자만 저장할 수 있습니다.', true);
    var bad = problems();
    if (bad.length) return toast(bad[0] + (bad.length > 1 ? ' 외 ' + (bad.length - 1) + '건' : ''), true);
    var btn = $('#oca-save'); btn.disabled = true;
    var data = clone(st.draft), json = JSON.stringify(data);
    fb().then(function (c) {
      var rev = Date.now();
      return c.fs.setDoc(c.fs.doc(c.db, PREFIX + 'site', 'config'), { json: json, rev: rev, by: st.user.email }).then(function () {
        try { localStorage.setItem(KEY, JSON.stringify({ rev: rev, data: data })); } catch (e) {}
        st.dirty = false; $('#oca-dirty').hidden = true;
        toast('저장되었습니다. 방문자 화면은 새로고침하면 반영됩니다.');
      });
    }).catch(function (e) {
      btn.disabled = false;
      toast(e.code === 'permission-denied' ? '저장하지 못했습니다. 보안 규칙의 관리자 이메일을 확인하세요.' : '저장하지 못했습니다. ' + (e.message || ''), true);
    });
  }
  function reset() {
    if (!isAdmin()) return;
    if (!confirm('저장된 설정을 삭제하고 원래 값으로 되돌립니다.')) return;
    fb().then(function (c) { return c.fs.deleteDoc(c.fs.doc(c.db, PREFIX + 'site', 'config')); }).then(function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      toast('초기화했습니다. 새로고침하면 반영됩니다.');
    }).catch(function () { toast('초기화하지 못했습니다.', true); });
  }

  /* ---------- 설치 화면 ---------- */
  function parseCfg(text) {
    var out = {}, re = /([A-Za-z]+)\s*:\s*["']([^"']+)["']/g, m;
    while ((m = re.exec(text || ''))) out[m[1]] = m[2];
    return out;
  }
  function validEmail(s) { return /^[^\s'"\\@,]+@[^\s'"\\@,]+\.[^\s'"\\@,]+$/.test(s); }
  function rulesText(list) {
    var arr = '[' + list.map(function (e) { return "'" + e + "'"; }).join(', ') + ']', P = PREFIX;
    return "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n\n" +
      "    function isOcAdmin() {\n      return request.auth != null\n        && request.auth.token.email in " + arr + ";\n    }\n\n" +
      "    match /" + P + "layout/{doc}  { allow read: if true; allow write: if isOcAdmin(); }\n" +
      "    match /" + P + "items/{doc}   { allow read: if true; allow write: if isOcAdmin(); }\n" +
      "    match /" + P + "diary/{doc}   { allow read: if true; allow write: if isOcAdmin(); }\n" +
      "    match /" + P + "reviews/{doc} { allow read: if true; allow write: if isOcAdmin(); }\n" +
      "    match /" + P + "site/{doc}    { allow read: if true; allow write: if isOcAdmin(); }\n\n  }\n}\n";
  }
  function configText(cfg, list) {
    var keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    var lines = keys.map(function (k) { return '  ' + k + ': ' + JSON.stringify(cfg[k] || '') + ','; }).join('\n');
    return '/* firebase-config.js : 설치 화면(#setup)에서 생성한 파일입니다. */\n\n' +
      'const FIREBASE_CONFIG = {\n' + lines + '\n};\n\n' +
      'const FIREBASE_OPTIONS = {\n  enabled: true,\n  adminEmails: [' + list.map(function (e) { return JSON.stringify(e); }).join(', ') + '],\n' +
      '  showLoginInStartMenu: ' + (FBO.showLoginInStartMenu === false ? 'false' : 'true') + ',\n' +
      '  collectionPrefix: ' + JSON.stringify(PREFIX) + ',\n  sdkVersion: ' + JSON.stringify(VER) + ',\n};\n';
  }
  function renderSetup() {
    var wrap = h('div', { class: 'oca-setup' });
    var ta = h('textarea', { class: 'oca-ta', style: 'min-height:144px;font-family:Consolas,monospace;font-size:12px', placeholder: 'const firebaseConfig = {\n  apiKey: "...",\n  projectId: "...",\n  ...\n};' });
    var status = h('p', { class: 'oca-note' });
    var em = h('input', { class: 'oca-in', type: 'text', placeholder: 'name@gmail.com' }); em.value = emails().join(', ');
    var dl = h('button', { class: 'oca-btn is-main', type: 'button', text: 'firebase-config.js 다운로드', disabled: 'disabled' });
    var pre = h('pre', { class: 'oca-pre' }), cur = { cfg: {}, list: [] };
    function refresh() {
      var cfg = parseCfg(ta.value); if (!ta.value.trim() && FBC.apiKey) cfg = FBC;
      var ok = !!(cfg.apiKey && cfg.projectId && cfg.appId);
      var list = em.value.split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
      var okMail = list.length > 0 && list.every(validEmail);
      status.textContent = ok ? '프로젝트: ' + cfg.projectId : 'apiKey, projectId, appId가 필요합니다.';
      status.className = 'oca-note' + (ok ? ' oca-ok' : '');
      dl.disabled = !(ok && okMail); cur.cfg = cfg; cur.list = list;
      pre.textContent = rulesText(okMail ? list : ['name@gmail.com']);
    }
    ta.oninput = refresh; em.oninput = refresh;
    dl.onclick = function () {
      var a = h('a', { href: URL.createObjectURL(new Blob([configText(cur.cfg, cur.list)], { type: 'text/javascript' })), download: 'firebase-config.js' });
      document.body.appendChild(a); a.click(); a.remove();
    };
    var cp = h('button', { class: 'oca-btn', type: 'button', text: '규칙 복사' });
    cp.onclick = function () {
      var t = pre.textContent, done = function () { toast('복사했습니다.'); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { prompt('복사하세요', t); }); else prompt('복사하세요', t);
    };
    function step(n, title, kids) { return h('section', { class: 'oca-step' }, [h('h3', { text: n + '. ' + title })].concat(kids)); }
    wrap.appendChild(step(1, 'Firebase 설정 코드', [
      h('p', { class: 'oca-note', text: 'Firebase 콘솔의 프로젝트 설정, 일반, 내 앱, 웹 앱에서 firebaseConfig를 복사해 붙여넣습니다.' }), ta, status]));
    wrap.appendChild(step(2, '관리자 이메일', [
      h('p', { class: 'oca-note', text: '여러 개는 쉼표로 구분합니다.' }), em]));
    wrap.appendChild(step(3, '설정 파일', [
      h('p', { class: 'oca-note', text: '다운로드한 파일로 사이트의 firebase-config.js를 교체한 뒤 다시 업로드합니다.' }), dl]));
    wrap.appendChild(step(4, '보안 규칙', [
      h('p', { class: 'oca-note', text: '왼쪽 메뉴의 Firestore Database(Realtime Database 아님) → 규칙 탭에 붙여넣고 게시합니다.' }), cp,
      h('details', { class: 'oca-box', style: 'margin-top:8px' }, [h('summary', { text: '규칙 내용' }), pre])]));
    wrap.appendChild(step(5, 'Firebase 콘솔 설정', [h('ul', { class: 'oca-ul' }, [
      h('li', { text: 'Authentication에서 Google 로그인을 사용 설정합니다.' }),
      h('li', { text: 'Authentication의 승인된 도메인에 사이트 주소를 추가합니다.' }),
      h('li', { text: 'Firestore Database를 생성합니다(프로덕션 모드).' })])]));
    wrap.appendChild(h('div', { style: 'padding-top:16px;border-top:0.5px solid var(--gray-6)' }, [h('a', { class: 'oca-btn is-main', href: '#admin', text: '편집기 열기' })]));
    refresh(); return wrap;
  }

  /* ---------- 로그인과 전체 화면 ---------- */
  function loginBox() {
    var email = h('input', { class: 'oca-in', type: 'text', placeholder: '이메일' });
    var pw = h('input', { class: 'oca-in', type: 'password', placeholder: '비밀번호' });
    var g = h('button', { class: 'oca-btn is-main', type: 'button', text: 'Google로 로그인' });
    var e = h('button', { class: 'oca-btn', type: 'button', text: '로그인' });
    function fail(x) { toast(x.code === 'auth/unauthorized-domain' ? '승인된 도메인에 이 사이트 주소를 추가하세요.' : '로그인하지 못했습니다.', true); }
    g.onclick = function () { fb().then(function (c) { return c.auth.signInWithPopup(c.a, new c.auth.GoogleAuthProvider()); }).catch(fail); };
    e.onclick = function () { fb().then(function (c) { return c.auth.signInWithEmailAndPassword(c.a, email.value.trim(), pw.value); }).catch(fail); };
    return h('div', { class: 'oca-login' }, [h('h2', { text: '관리자 로그인' }), g,
      h('details', null, [h('summary', { text: '이메일로 로그인' }), email, pw, e])]);
  }
  function draw() {
    var root = st.root; root.innerHTML = '';
    var top = h('div', { class: 'oca-top' }, [h('b', { text: st.view === 'setup' ? '설치' : '사이트 편집' })]);
    top.appendChild(h('span', { class: 'oca-sp' }));
    var editing = st.view === 'admin' && CONFIGURED && emails().length && isAdmin();
    if (editing) {
      top.appendChild(h('span', { id: 'oca-dirty', class: 'oca-note', text: '저장되지 않은 변경 사항', hidden: 'hidden' }));
      var rs = h('button', { class: 'oca-btn is-quiet', type: 'button', text: '초기화' }); rs.onclick = reset; top.appendChild(rs);
    }
    if (st.user && st.view !== 'setup') {
      var lo = h('button', { class: 'oca-btn is-quiet', type: 'button', text: '로그아웃' });
      lo.onclick = function () { fb().then(function (c) { return c.auth.signOut(c.a); }); }; top.appendChild(lo);
    }
    var close = h('button', { class: 'oca-btn', type: 'button', text: '사이트로 돌아가기' });
    close.onclick = function () { if (st.dirty && !confirm('저장하지 않은 변경 사항이 있습니다. 나갈까요?')) return; location.hash = ''; };
    top.appendChild(close);
    if (editing) {
      var sv = h('button', { id: 'oca-save', class: 'oca-btn is-main', type: 'button', text: '저장', disabled: 'disabled' }); sv.onclick = save; top.appendChild(sv);
    }
    root.appendChild(top);

    if (st.view === 'setup' || !CONFIGURED || !emails().length) {
      root.appendChild(renderSetup());
    } else if (!st.user) {
      root.appendChild(loginBox());
    } else if (!isAdmin()) {
      root.appendChild(h('div', { class: 'oca-login' }, [h('h2', { text: '권한이 없습니다' }),
        h('p', { class: 'oca-note', text: '관리자 이메일 계정으로 다시 로그인하세요.' })]));
    } else {
      if (!st.draft) {
        st.draft = { site: clone(SITE), characters: clone(typeof CHARACTERS !== 'undefined' ? CHARACTERS : []),
                     relations: clone(typeof RELATIONS !== 'undefined' ? RELATIONS : []) };
      }
      if (wide()) {
        var ed = h('div', { class: 'oca-ed' }); renderEditor(ed);
        root.appendChild(h('div', { class: 'oca-split' }, [previewPane(), ed]));
      } else { st.pvFrame = null; st.pvBody = null; renderEditor(root); }
    }
    root.appendChild(h('div', { id: 'oca-toast', class: 'oca-toast' }));
  }

  /* 스포이드가 있는 공용 색상 선택기 (color-picker.js) */
  var pickerQ = [], pickerState = 0;
  function withPicker(fn) {
    if (window.ColorPicker) return fn();
    pickerQ.push(fn);
    if (pickerState) return;
    pickerState = 1;
    var s = document.createElement('script'); s.src = 'color-picker.js?v=1';
    s.onload = function () { pickerQ.splice(0).forEach(function (f) { f(); }); };
    document.head.appendChild(s);
  }
  function mount(view) {
    injectCss(); st.view = view || 'admin';
    if (!st.root) {
      st.root = h('div', { id: 'oca' }); document.body.appendChild(st.root);
      window.addEventListener('beforeunload', function (e) { if (st.dirty) { e.preventDefault(); e.returnValue = ''; } });
      if (CONFIGURED) fb().then(function (c) { c.auth.onAuthStateChanged(c.a, function (u) { st.user = u; draw(); }); }).catch(function () {});
    }
    st.root.hidden = false; draw();
  }
  function hide() { if (st.root) st.root.hidden = true; }

  window.OCAdmin = { mount: mount, hide: hide, _state: st, _draw: draw };
})();
