/* ==========================================================
   site-sync.js : 편집기에서 저장한 설정을 사이트에 적용해요
   ----------------------------------------------------------
   · 순서 : characters.js → data.js → firebase-config.js → site-sync.js → script.js
   · 편집기(#admin)에서 저장한 내용(Firestore oc_site/config)이 있으면
     data.js / characters.js 의 값 위에 덮어써요.
   · 방문자는 한 번 받은 설정을 브라우저에 보관해서 바로 쓰고,
     새 설정이 있으면 한 번만 다시 불러와요.
   · 주소 뒤에 #admin(편집기), #setup(설치 화면)을 붙이면 admin.js 를 불러와요.
   직접 고치지 않아도 돼요.
   ========================================================== */
(function () {
  'use strict';
  if (typeof SITE === 'undefined') return;                 // data.js 오류는 script.js 가 안내해요

  var KEY = 'oc-site-override-v1';
  var C = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG) || {};
  var O = (typeof FIREBASE_OPTIONS !== 'undefined' && FIREBASE_OPTIONS) || {};
  var prefix = O.collectionPrefix != null ? O.collectionPrefix : 'oc_';
  var enabled = O.enabled !== false && !!C.apiKey && !!C.projectId;
  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* 저장된 값 → SITE / CHARACTERS / RELATIONS (const 라서 내용만 바꿔요) */
  function apply(d) {
    if (!d) return;
    if (d.site) Object.keys(d.site).forEach(function (k) { SITE[k] = d.site[k]; });
    if (Array.isArray(d.characters) && typeof CHARACTERS !== 'undefined') {
      CHARACTERS.length = 0; d.characters.forEach(function (c) { CHARACTERS.push(c); });
    }
    if (Array.isArray(d.relations) && typeof RELATIONS !== 'undefined') {
      RELATIONS.length = 0; d.relations.forEach(function (r) { RELATIONS.push(r); });
    }
  }

  /* ---------- 편집기 미리보기(iframe) : 편집 중인 값을 그대로 보여줘요 ---------- */
  if (window.parent !== window && /[?&]preview=1/.test(location.search)) {
    try {
      var A = window.parent.OCAdmin;
      if (A && A._state.draft) {
        var d = clone(A._state.draft);
        var s = d.site || {};
        s.loading = Object.assign({}, s.loading, { duration: 600, clickToStart: false });   // 로딩은 짧게
        s.sounds = Object.assign({}, s.sounds, { enabled: false });                          // 소리 끄기
        s.popups = [];                                                                       // 팝업 숨기기
        if (A._state.pvOpen) {                                                               // 편집 중인 아이콘 / 캐릭터 창을 열어 두기
          s.startup = { windows: [{ open: A._state.pvOpen, left: 160, top: 40 }] };
        }
        d.site = s;
        apply(d);
      }
    } catch (e) {}
    return;
  }

  /* ---------- 저장된 설정 적용 (브라우저에 보관된 값) ---------- */
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (cached && cached.data) apply(cached.data);

  /* ---------- 편집기 / 설치 화면 불러오기 ---------- */
  function route() {
    var m = location.hash.match(/^#\/?(admin|setup)/);
    if (!m) { if (window.OCAdmin) window.OCAdmin.hide(); return; }
    if (window.OCAdmin) return window.OCAdmin.mount(m[1]);
    var s = document.createElement('script');
    s.src = 'admin.js?v=1';
    s.onload = function () { window.OCAdmin.mount(m[1]); };
    document.body.appendChild(s);
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', route);

  /* ---------- 새 설정이 있는지 확인 (Firebase SDK 없이 가벼운 요청 한 번) ---------- */
  if (!enabled || SITE.remoteSettings === false) return;
  window.addEventListener('load', function () {
    setTimeout(function () {
      var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(C.projectId) +
        '/databases/(default)/documents/' + prefix + 'site/config?key=' + encodeURIComponent(C.apiKey);
      fetch(url, { cache: 'no-store' }).then(function (r) {
        if (r.status === 404) return { none: true };
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (doc) {
        var have = cached ? cached.rev : 0;
        if (doc.none) {
          if (cached) { try { localStorage.removeItem(KEY); } catch (e) {} reload('reset'); }
          return;
        }
        var f = doc.fields || {};
        var rev = f.rev ? Number(f.rev.integerValue || f.rev.doubleValue || 0) : 0;
        if (rev === have || !f.json) return;
        var data = JSON.parse(f.json.stringValue);
        try { localStorage.setItem(KEY, JSON.stringify({ rev: rev, data: data })); } catch (e) {}
        reload(rev);
      }).catch(function () {});
    }, 400);
  });
  function reload(tag) {
    try {
      if (sessionStorage.getItem('oc-site-reloaded') === String(tag)) return;
      sessionStorage.setItem('oc-site-reloaded', String(tag));
    } catch (e) {}
    location.reload();
  }
})();
