/* =========================================================
   script.js — 동작 담당 (창, 브라우저, 음악, 달력, 로딩 등)
   ※ 내용 수정은 data.js 에서 하세요. 이 파일은 건드리지 않아도 돼요.
========================================================= */
/* ---------------- data.js 오류 알림창 ----------------
   data.js 에 쉼표, 괄호, 따옴표 실수가 있으면 하얀 화면 대신
   몇 번째 줄이 이상한지 알려주는 윈도우 오류 창을 띄워요. */
(function () {
  "use strict";

  // 브라우저가 알려주는 영어 오류를 쉬운 말로
  function explain(msg) {
    const m = String(msg || "");
    let r;
    if ((r = m.match(/Unexpected token '?(.)'?/i))) return "'" + r[1] + "' 기호가 이상한 자리에 있어요. 괄호 짝이나 쉼표를 확인해 주세요.";
    if (/Unexpected string/i.test(m)) return "줄 끝에 쉼표(,)가 빠진 것 같아요. 표시된 줄의 바로 윗줄 끝을 확인해 주세요.";
    if (/Unexpected identifier|expected property name|missing \} after property list/i.test(m)) return "쉼표(,)가 빠졌거나 따옴표가 안 닫힌 것 같아요. 표시된 줄과 바로 윗줄을 확인해 주세요.";
    if (/Invalid or unexpected token|unterminated string|unterminated template/i.test(m)) return "따옴표(\" 또는 `)가 제대로 닫히지 않은 것 같아요.";
    if (/Unexpected end of input|end of script/i.test(m)) return "괄호 { 나 [ 가 닫히지 않았어요. 지운 괄호의 짝을 찾아보세요.";
    if (/missing \)|missing \]|missing \}/i.test(m)) return "괄호 짝이 맞지 않아요.";
    if (/already been declared|redeclaration/i.test(m)) return "같은 이름이 두 번 쓰였어요. (const SITE 를 두 번 적었는지 확인)";
    if (/is not defined/i.test(m)) return "파일을 찾지 못했어요. 파일 이름과 위치(index.html 과 같은 폴더)를 확인해 주세요.";
    return m;
  }

  function showError(info) {
    const box = document.createElement("div");
    box.id = "data-error";
    box.innerHTML =
      '<div class="de-win">' +
        '<div class="de-title"></div>' +
        '<div class="de-body">' +
          '<div class="de-icon">✕</div>' +
          '<div class="de-main">' +
            '<p class="de-where"></p><p class="de-why"></p><pre class="de-code"></pre>' +
            '<p class="de-tip">확인할 것: ① 줄 끝 쉼표(,) ② 괄호 { } [ ] 짝 ③ 따옴표 " " ` ` 짝<br>고친 뒤 다시 올리고 Ctrl+F5 로 새로고침하세요.</p>' +
          "</div>" +
        "</div>" +
      "</div>";
    const fname = info.fname || "data.js";
    box.querySelector(".de-title").textContent = fname + " 오류";
    const where = box.querySelector(".de-where");
    where.textContent = info.line
      ? fname + " 파일의 " + info.line + "번째 줄 근처에 문제가 있어요."
      : fname + " 파일을 읽지 못했어요.";
    box.querySelector(".de-why").textContent = explain(info.msg);
    const code = box.querySelector(".de-code");
    code.style.display = "none";
    document.body.appendChild(box);

    // 가능하면 문제 줄 근처 내용도 보여주기 (나루에 올렸을 때 동작)
    if (info.line && window.fetch) {
      fetch(fname, { cache: "no-store" }).then(r => r.text()).then(t => {
        const lines = t.split(/\r?\n/);
        // 쉼표가 빠진 경우: 위로 올라가며 주석/빈 줄을 건너뛰고 쉼표 없이 끝난 줄 찾기
        let suspect = -1;
        if (/Unexpected (string|identifier)|expected property name|missing \} after property/i.test(info.msg)) {
          for (let i = info.line - 2; i >= 0 && i >= info.line - 30; i--) {
            const tr = lines[i].replace(/\/\/.*$/, "").trim();
            if (!tr || tr.startsWith("*") || tr.startsWith("/*")) continue;
            if (!/[,{[(]$/.test(tr)) suspect = i;
            break;
          }
        }
        const top = suspect >= 0 ? suspect : info.line - 1;
        const from = Math.max(0, Math.min(top, info.line - 1) - 2), to = Math.min(lines.length, info.line + 2);
        code.innerHTML = "";
        for (let i = from; i < to; i++) {
          const row = document.createElement("div");
          row.textContent = String(i + 1).padStart(4, " ") + " | " + lines[i];
          if (i === suspect) {
            row.className = "de-hit";
            row.textContent += "   ← 여기 끝에 쉼표(,)가 빠진 것 같아요";
          } else if (i + 1 === info.line && suspect < 0) row.className = "de-hit";
          code.appendChild(row);
        }
        if (suspect >= 0) where.textContent = fname + " 파일의 " + (suspect + 1) + "번째 줄 끝에 쉼표(,)가 빠진 것 같아요.";
        code.style.display = "";
      }).catch(() => {});
    }
  }

  window.__showDataError = showError;

  const errs = window.__dataErrors || [];
  const errIn = name => errs.filter(e => String(e.file).split("?")[0].endsWith("/" + name) || e.file === name)[0];
  const chErr = errIn("characters.js") || errIn("firebase-config.js");
  if (chErr) {
    chErr.fname = /firebase/.test(chErr.file) ? "firebase-config.js" : "characters.js";
    showError(chErr);
    window.__dataBroken = true;
  } else if (typeof SITE === "undefined") {
    const e = errIn("data.js") || { msg: "SITE is not defined", line: 0 };
    e.fname = "data.js";
    showError(e);
    window.__dataBroken = true;
  }
})();

(function () {
  "use strict";
  if (window.__dataBroken) return;   // data.js 가 망가졌으면 여기서 멈춤

  const S = SITE;  // data.js 의 내용
  const CH = (typeof CHARACTERS !== "undefined" && Array.isArray(CHARACTERS)) ? CHARACTERS : [];
  const REL = (typeof RELATIONS !== "undefined" && Array.isArray(RELATIONS)) ? RELATIONS : [];
  const charById = id => CH.find(c => c.id === id);
  const charByName = n => CH.find(c => c.name === n);

  /* characters.js 의 캐릭터마다 바탕화면 폴더 만들기 */
  (function makeCharacterFolders() {
    S.desktopIcons = S.desktopIcons || [];
    CH.forEach(c => {
      if (!c || !c.id) return;
      const name = c.name || c.id;
      const items = [];
      items.push({
        label: "프로필.txt", icon: "file",
        window: { type: "text", title: "프로필.txt - " + name, text: c.profile || "", image: c.profileImage || "" },
      });
      if (c.pictures && c.pictures.length) {
        items.push({ label: "그림", icon: "gallery", window: { type: "gallery", title: name + " 그림", images: c.pictures } });
      }
      items.push({ label: "관계도", icon: "relation", open: "relations", focus: c.id });
      if (c.pairs && c.pairs.length) {
        const pairItems = c.pairs.map(p => {
          const o = charById(p.with) || { id: p.with, name: p.with };
          const title = name + " x " + (o.name || o.id);
          const inner = [
            {
              label: "관계도", icon: "relation",
              window: {
                type: "relation", title: title, width: 460, height: 340,
                nodes: [
                  { id: c.id, name: name, image: c.face || "", color: c.folderColor, x: 22, y: 45, desc: c.intro || "", open: "char-" + c.id },
                  { id: o.id, name: o.name || o.id, image: o.face || "", color: o.folderColor, x: 78, y: 45, desc: o.intro || "", open: "char-" + o.id },
                ],
                links: [{ from: c.id, to: o.id, label: p.me || "", back: p.them || "", color: p.color || "#ff5fa2" }],
              },
            },
            { label: "페어 설정.txt", icon: "file", window: { type: "text", title: "페어 설정.txt - " + title, text: p.note || "" } },
          ];
          if (p.pictures && p.pictures.length) {
            inner.push({ label: "페어 그림", icon: "gallery", window: { type: "gallery", title: title + " 그림", images: p.pictures } });
          }
          return { label: title, icon: "folder", color: o.folderColor || "#ff9ec7", window: { type: "folder", title: title, items: inner } };
        });
        items.push({ label: "페어", icon: "folder", color: "#ff9ec7", window: { type: "folder", title: name + " - 페어", items: pairItems } });
      }
      if (c.extra && c.extra.length) {
        items.push({
          label: "추가 정보", icon: "folder", color: "#c49bff",
          window: {
            type: "folder", title: name + " - 추가 정보",
            items: c.extra.map(x => ({
              label: (x.title || "메모") + ".txt", icon: "file",
              window: { type: "text", title: (x.title || "메모") + ".txt - 메모장", text: x.text || "", image: x.image || "" },
            })),
          },
        });
      }
      (c.moreItems || []).forEach(x => items.push(x));   // 직접 만든 파일/폴더 추가
      const id = "char-" + c.id;
      if (!S.desktopIcons.some(it => it.id === id)) {
        S.desktopIcons.push({
          id: id, slot: c.slot, label: name, icon: c.icon || "folder", color: c.folderColor,
          window: { type: "folder", title: name, items: items },
        });
      }
    });
  })();
  const desktop = document.getElementById("desktop");
  const iconArea = document.getElementById("icon-area");
  const layer = document.getElementById("window-layer");
  const taskButtons = document.getElementById("task-buttons");
  const startBtn = document.getElementById("start-btn");
  const startMenu = document.getElementById("start-menu");
  const startList = document.getElementById("start-list");
  const clock = document.getElementById("clock");

  // 터치 기기(휴대폰)는 한 번 탭으로 열기, PC는 더블클릭으로 열기
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------------- 0. 작은 도우미 ---------------- */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const bodyOf = win => win.querySelector(".window-body");
  function setStatus(win, t) {
    const c = win.querySelector(".status-cell");
    if (c) c.textContent = t || "";
  }
  function setTitle(win, t) {
    win.querySelector(".title-text").textContent = t;
    if (win._btn) win._btn.querySelector(".task-text").textContent = t;
  }

  /* ---------------- 1. 기본 설정 ---------------- */
  const theme = S.theme || {};
  document.title = S.pageTitle || "My Desktop";
  document.getElementById("start-label").textContent = S.startButtonText || "시작";
  document.getElementById("start-banner-text").textContent = S.osName || "";

  (function applyTheme() {
    const r = document.documentElement.style;
    if (theme.desktop) r.setProperty("--desktop", theme.desktop);
    if (theme.titleActive) {
      r.setProperty("--title-a1", theme.titleActive[0]);
      r.setProperty("--title-a2", theme.titleActive[1]);
    }
    if (theme.titleInactive) {
      r.setProperty("--title-i1", theme.titleInactive[0]);
      r.setProperty("--title-i2", theme.titleInactive[1]);
    }
    if (theme.selection) r.setProperty("--select", theme.selection);
    if (theme.wallpaper) {
      desktop.style.backgroundImage = 'url("' + theme.wallpaper + '")';
      desktop.classList.add(theme.wallpaperMode === "cover" ? "wp-cover" : "wp-tile");
    }
  })();

  /* ---------------- 2. 도트 아이콘 그림 ---------------- */
  function shade(hex, amt) {
    let h = String(hex).replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const n = parseInt(h, 16);
    if (isNaN(n)) return hex;
    const t = amt > 0 ? 255 : 0, a = Math.abs(amt);
    const mix = v => Math.round(v + (t - v) * a);
    return "rgb(" + mix((n >> 16) & 255) + "," + mix((n >> 8) & 255) + "," + mix(n & 255) + ")";
  }
  const px = (x, y, w, h, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
  const circ = (r, c) => '<circle cx="8" cy="8" r="' + r + '" fill="' + c + '"/>';

  function iconSVG(type, color) {
    let b = "";
    switch (type) {
      case "file":
        b = px(3, 1, 10, 14, "#000") + px(4, 2, 8, 12, color || "#fff") +
            px(5, 4, 6, 1, "#000080") + px(5, 6, 6, 1, "#000080") +
            px(5, 8, 6, 1, "#000080") + px(5, 10, 4, 1, "#000080");
        break;
      case "image":
        b = px(1, 2, 14, 12, "#000") + px(2, 3, 12, 10, color || "#8fd3ff") +
            px(10, 4, 2, 2, "#ffe14d") +
            px(5, 6, 1, 1, "#2fa84f") + px(4, 7, 3, 1, "#2fa84f") + px(3, 8, 5, 1, "#2fa84f") +
            px(9, 8, 2, 1, "#3d8b3d") + px(8, 9, 5, 1, "#3d8b3d") + px(2, 9, 12, 4, "#2fa84f");
        break;
      case "computer":
        b = px(1, 1, 14, 10, "#000") + px(2, 2, 12, 8, "#c0c0c0") +
            px(3, 3, 10, 6, "#000") + px(4, 4, 8, 4, color || "#008080") +
            px(4, 4, 3, 1, "#7fd6d6") + px(6, 11, 4, 1, "#808080") +
            px(1, 12, 14, 3, "#000") + px(2, 13, 12, 1, "#c0c0c0");
        break;
      case "trash":
        b = px(2, 1, 12, 3, "#000") + px(3, 2, 10, 1, "#e8e8e8") +
            px(3, 4, 10, 11, "#000") + px(4, 4, 8, 10, color || "#d0d0d0") +
            px(6, 6, 1, 7, "#808080") + px(9, 6, 1, 7, "#808080");
        break;
      case "browser":
        b = circ(7.5, "#000") + circ(6.5, color || "#1a5cff") +
            px(4, 4, 3, 2, "#2fa84f") + px(3, 6, 4, 2, "#2fa84f") + px(5, 8, 2, 2, "#2fa84f") +
            px(9, 7, 3, 4, "#2fa84f") + px(10, 4, 2, 2, "#2fa84f") + px(5, 3, 2, 1, "#9cc4ff");
        break;
      case "music": {
        const c = color || "#7a3cff";
        b = px(5, 2, 8, 2, c) + px(5, 4, 1, 8, c) + px(12, 4, 1, 6, c) +
            px(2, 10, 4, 3, c) + px(9, 8, 4, 3, c) +
            px(3, 10, 1, 1, "#fff") + px(10, 8, 1, 1, "#fff");
        break;
      }
      case "calendar": {
        const c = color || "#e23b3b";
        b = px(1, 2, 14, 13, "#000") + px(2, 3, 12, 3, c) + px(2, 6, 12, 8, "#fff") +
            px(4, 1, 1, 3, "#000") + px(11, 1, 1, 3, "#000");
        [7, 9, 11].forEach(y => [3, 5, 7, 9, 11].forEach(x => { b += px(x, y, 1, 1, "#808080"); }));
        b += px(9, 11, 2, 2, c);
        break;
      }
      case "warning": {
        // 노란 삼각형 + 느낌표
        for (let y = 2; y <= 14; y++) {
          const hw = Math.floor((y - 2) / 2) + 1;
          b += px(8 - hw, y, hw * 2, 1, "#000");
          if (y >= 4 && y <= 13) b += px(9 - hw, y, hw * 2 - 2, 1, color || "#ffd84a");
        }
        b += px(7, 6, 2, 4, "#000") + px(7, 11, 2, 2, "#000");
        break;
      }
      case "question":
        b = circ(7.5, "#000") + circ(6.5, color || "#1a5cff") +
            px(6, 3, 4, 1, "#fff") + px(5, 4, 2, 2, "#fff") + px(9, 4, 2, 3, "#fff") +
            px(8, 7, 2, 1, "#fff") + px(7, 8, 2, 2, "#fff") + px(7, 11, 2, 2, "#fff");
        break;
      case "error":
        b = circ(7.5, "#000") + circ(6.5, color || "#e02424") +
            px(4, 4, 2, 2, "#fff") + px(10, 4, 2, 2, "#fff") + px(5, 5, 2, 2, "#fff") + px(9, 5, 2, 2, "#fff") +
            px(6, 6, 4, 4, "#fff") + px(5, 9, 2, 2, "#fff") + px(9, 9, 2, 2, "#fff") +
            px(4, 10, 2, 2, "#fff") + px(10, 10, 2, 2, "#fff");
        break;
      case "relation":
        b = px(6, 3, 4, 1, "#555") + px(4, 6, 1, 2, "#555") + px(5, 8, 1, 2, "#555") +
            px(11, 6, 1, 2, "#555") + px(10, 8, 1, 2, "#555") +
            px(0, 0, 6, 6, "#000") + px(1, 1, 4, 4, "#ff9ec7") +
            px(10, 0, 6, 6, "#000") + px(11, 1, 4, 4, "#8fd3ff") +
            px(5, 10, 6, 6, "#000") + px(6, 11, 4, 4, color || "#f7d64a");
        break;
      case "gallery":
        b = px(4, 0, 12, 10, "#000") + px(5, 1, 10, 8, "#fff") + px(6, 2, 8, 6, "#ffd0e0") +
            px(0, 5, 12, 11, "#000") + px(1, 6, 10, 9, color || "#8fd3ff") +
            px(1, 11, 10, 4, "#2fa84f") + px(3, 10, 3, 1, "#2fa84f") + px(7, 7, 2, 2, "#ffe14d");
        break;
      case "person": {
        const c = color || "#1a5cff";
        b = px(5, 1, 6, 6, "#000") + px(6, 2, 4, 4, "#ffd9b3") +
            px(3, 8, 10, 8, "#000") + px(4, 9, 8, 7, c) + px(7, 9, 2, 2, "#fff");
        break;
      }
      case "keyboard":
        b = px(0, 4, 16, 9, "#000") + px(1, 5, 14, 7, color || "#d8d8d8");
        [6, 8].forEach(y => { for (let x = 2; x <= 13; x += 2) b += px(x, y, 1, 1, "#555"); });
        b += px(4, 10, 8, 1, "#555");
        break;
      case "pudding": {
        const c = color || "#ffd54a";
        b = px(1, 12, 14, 2, "#000") + px(2, 12, 12, 1, "#f2f2f2") +
            px(5, 2, 6, 1, "#000") + px(4, 3, 8, 1, "#000") + px(3, 5, 1, 2, "#000") + px(12, 5, 1, 2, "#000") +
            px(2, 7, 1, 5, "#000") + px(13, 7, 1, 5, "#000") +
            px(5, 3, 6, 1, "#7a3b12") + px(4, 4, 8, 2, "#8b4513") +
            px(3, 6, 10, 1, c) + px(3, 7, 10, 5, c) + px(4, 7, 2, 2, "#fff6c8");
        break;
      }
      case "info":
        b = circ(7.5, "#000") + circ(6.5, color || "#1a5cff") +
            px(7, 3, 2, 2, "#fff") + px(7, 6, 2, 6, "#fff");
        break;
      case "power":
        b = circ(7.5, "#000") + circ(6.5, color || "#2fa84f") +
            px(7, 3, 2, 6, "#fff") + px(5, 5, 1, 1, "#fff") + px(10, 5, 1, 1, "#fff") +
            px(4, 6, 1, 4, "#fff") + px(11, 6, 1, 4, "#fff") +
            px(5, 10, 1, 1, "#fff") + px(10, 10, 1, 1, "#fff") + px(6, 11, 4, 1, "#fff");
        break;
      case "heart": {
        const c = color || "#ff5fa2";
        b = px(3, 3, 4, 1, c) + px(9, 3, 4, 1, c) + px(2, 4, 12, 3, c) +
            px(3, 7, 10, 1, c) + px(4, 8, 8, 1, c) + px(5, 9, 6, 1, c) +
            px(6, 10, 4, 1, c) + px(7, 11, 2, 1, c) + px(4, 4, 2, 1, "#fff");
        break;
      }
      default: { // folder
        const c = color || "#f7d64a";
        b = px(1, 2, 6, 3, "#000") + px(0, 4, 16, 11, "#000") +
            px(2, 3, 4, 2, c) + px(1, 5, 14, 9, c) +
            px(1, 5, 14, 1, shade(c, 0.5)) + px(1, 13, 14, 1, shade(c, -0.3));
      }
    }
    return '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">' + b + "</svg>";
  }

  function iconHTML(item) {
    const t = item.icon || "folder";
    if (t.indexOf("/") !== -1 || t.indexOf(".") !== -1) {
      return '<img src="' + t + '" alt="" draggable="false">';
    }
    return iconSVG(t, item.color);
  }

  // 작은 버튼용 그림
  const g = (w, h, rects) => '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" shape-rendering="crispEdges">' + rects.map(r => px(r[0], r[1], r[2], r[3], "#000")).join("") + "</svg>";
  const GLYPH = {
    min: g(8, 7, [[1, 5, 6, 2]]),
    max: g(9, 9, [[0, 0, 9, 2], [0, 2, 1, 7], [8, 2, 1, 7], [0, 8, 9, 1]]),
    close: g(8, 7, [[0, 0, 2, 1], [6, 0, 2, 1], [1, 1, 2, 1], [5, 1, 2, 1], [2, 2, 4, 1], [3, 3, 2, 1], [2, 4, 4, 1], [1, 5, 2, 1], [5, 5, 2, 1], [0, 6, 2, 1], [6, 6, 2, 1]]),
    back: g(6, 9, [[4, 0, 1, 9], [3, 1, 1, 7], [2, 2, 1, 5], [1, 3, 1, 3], [0, 4, 1, 1]]),
    fwd: g(6, 9, [[1, 0, 1, 9], [2, 1, 1, 7], [3, 2, 1, 5], [4, 3, 1, 3], [5, 4, 1, 1]]),
    home: g(9, 9, [[4, 0, 1, 1], [3, 1, 3, 1], [2, 2, 5, 1], [1, 3, 7, 1], [0, 4, 9, 1], [1, 5, 2, 4], [6, 5, 2, 4], [3, 5, 3, 1]]),
    play: g(8, 9, [[1, 0, 1, 9], [2, 1, 1, 7], [3, 2, 1, 5], [4, 3, 1, 3], [5, 4, 1, 1]]),
    pause: g(8, 9, [[1, 0, 2, 9], [5, 0, 2, 9]]),
    stop: g(8, 9, [[1, 1, 7, 7]]),
    prev: g(9, 9, [[0, 0, 2, 9], [7, 0, 1, 9], [6, 1, 1, 7], [5, 2, 1, 5], [4, 3, 1, 3], [3, 4, 1, 1]]),
    next: g(9, 9, [[7, 0, 2, 9], [1, 0, 1, 9], [2, 1, 1, 7], [3, 2, 1, 5], [4, 3, 1, 3], [5, 4, 1, 1]]),
  };

  /* ---------------- 3. 아이콘 만들기 ---------------- */
  // Firebase(관리자 기능) 상태 — 자세한 건 아래 "11. Firebase" 부분
  const FBS = { on: false, admin: false, user: null, db: null, auth: null, slots: {}, items: [], diary: {}, reviews: [], objs: {} };

  function makeIcon(item, onDesktop) {
    const icon = el("div", "icon", '<div class="icon-img">' + iconHTML(item) + '</div><div class="icon-label"></div>');
    icon.tabIndex = 0;
    icon.querySelector(".icon-label").textContent = item.label || "";
    icon._item = item;

    icon.addEventListener("click", e => {
      e.stopPropagation();
      if (icon._dragged) return;
      selectIcon(icon);
      if (isTouch) openItem(item);
    });
    icon.addEventListener("dblclick", e => {
      e.stopPropagation();
      if (icon._dragged) return;
      if (!isTouch) openItem(item);
    });
    if (onDesktop) enableIconDrag(icon, item);
    icon.addEventListener("contextmenu", e => {
      if (!FBS.admin) return;
      e.preventDefault();
      e.stopPropagation();
      selectIcon(icon);
      iconMenu(e, item);
    });
    icon.addEventListener("keydown", e => {
      if (e.key === "Enter") openItem(item);
    });
    return icon;
  }

  function selectIcon(icon) {
    clearSelection(icon.parentElement);
    icon.classList.add("selected");
  }
  function clearSelection(container) {
    container.querySelectorAll(".icon.selected").forEach(x => x.classList.remove("selected"));
  }

  /* 바탕화면 칸 배치
     칸 번호는 세로줄부터 셉니다. (rows 가 10이면)
       1  11  21 ...
       2  12  22
       …
       10 20  30
     slot 을 안 적은 아이콘은 비어있는 칸에 순서대로 들어가요. */
  const GRID = S.desktopGrid || {};
  const ROWS = Math.max(1, GRID.rows || 10);
  const CELL_W = GRID.cellWidth || 80;
  let deskIcons = [];
  let cellH = 60;

  // 폴더에 id 가 없으면 "부모id/이름" 으로 붙여주기 (관리자가 그 폴더에 파일을 넣을 때 필요)
  (function ensureIds(list, prefix) {
    (list || []).forEach(it => {
      if (it.window && it.window.type === "folder") {
        if (!it.id) it.id = prefix + it.label;
        ensureIds(it.window.items, it.id + "/");
      }
    });
    return ensureIds;
  })(S.desktopIcons, "")(S.programs, "");

  function renderDesktop() {
    iconArea.querySelectorAll(":scope > .icon").forEach(n => n.remove());
    const list = (S.desktopIcons || []).concat(fbChildren("desktop"));
    deskIcons = list.map(item => {
      if (!item.id) item.id = "desk-" + item.label;   // 자리 저장용 이름표
      const icon = makeIcon(item, true);
      iconArea.appendChild(icon);
      return { item, icon };
    });
    layoutDesktop();
  }

  // 아이콘 칸 번호: 관리자가 옮긴 자리(Firebase) > data.js 의 slot > 빈칸
  const slotOf = item => {
    const v = item.id && FBS.slots[item.id] != null ? FBS.slots[item.id] : item.slot;
    return parseInt(v, 10);
  };

  function layoutDesktop() {
    const areaH = iconArea.clientHeight;
    const areaW = iconArea.clientWidth;
    cellH = Math.max(GRID.minCellHeight || 58, Math.floor(areaH / ROWS));

    // 1) slot 적은 아이콘부터 자리 잡기 (겹치면 뒤로 밀림)
    const used = new Set();
    const pos = new Map();
    const take = n => { while (used.has(n)) n++; used.add(n); return n; };
    deskIcons.forEach(d => {
      const s = slotOf(d.item);
      if (s >= 1) pos.set(d, take(s));
    });
    // 2) 나머지는 빈칸에 순서대로
    deskIcons.forEach(d => { if (!pos.has(d)) pos.set(d, take(1)); });

    pos.forEach((slot, d) => {
      const i = slot - 1;
      d.slot = slot;
      d.icon.style.left = Math.floor(i / ROWS) * CELL_W + "px";
      d.icon.style.top = (i % ROWS) * cellH + "px";
      d.icon.style.width = CELL_W + "px";
    });

    // 칸 번호 보기
    iconArea.querySelectorAll(".grid-cell").forEach(c => c.remove());
    if (GRID.showNumbers) {
      const cols = Math.max(1, Math.floor(areaW / CELL_W));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ROWS; r++) {
          const cell = el("div", "grid-cell");
          cell.textContent = c * ROWS + r + 1;
          cell.style.left = c * CELL_W + "px";
          cell.style.top = r * cellH + "px";
          cell.style.width = CELL_W - 2 + "px";
          cell.style.height = cellH - 2 + "px";
          iconArea.insertBefore(cell, iconArea.firstChild);
        }
      }
    }
  }
  renderDesktop();
  window.addEventListener("resize", layoutDesktop);

  desktop.addEventListener("pointerdown", e => {
    if (e.target === desktop || e.target === iconArea) clearSelection(iconArea);
  });

  /* ---------------- 4. 창 공통 ---------------- */
  let zTop = 100;
  let cascade = 0;
  const opened = new Map(); // 아이콘 → 열린 창

  let findById = function (id, list) {
    for (const it of list || []) {
      if (it.id === id) return it;
      const kids = it.window && it.window.items;
      if (kids) {
        const f = findById(id, kids);
        if (f) return f;
      }
    }
    return null;
  };

  function openById(id, focus) {
    const t = findById(id, S.desktopIcons) || findById(id, S.programs);
    if (t) {
      openItem(t);
      const win = opened.get(t);
      if (focus && win && win._focus) win._focus(focus);   // 관계도에서 특정 인물 강조 등
    }
    else showDialog({ title: "알림", text: "'" + id + "'을(를) 찾을 수 없어요." });
  }

  // at = { left, top, right, bottom } 처음 뜨는 위치 (없으면 자동)
  function openItem(item, at) {
    if (item.link && !item.window) return window.open(item.link, "_blank", "noopener");   // 인터넷 주소
    if (item.open && !item.window) return openById(item.open, item.focus);   // 바로가기
    if (!item.window) {
      showDialog({ title: "알림", text: "'" + item.label + "'은(는) 아직 준비 중이에요!" });
      return;
    }
    const w = opened.get(item);
    if (w) { restore(w); return; }
    createWindow(item, at);
  }

  // 창의 공통 뼈대
  function shell(opts) {
    const win = el("div", "window bevel-out" + (opts.dialog ? " dialog" : ""));

    const btns = opts.dialog
      ? '<button class="tb-btn bevel-out" data-act="close" aria-label="닫기">' + GLYPH.close + "</button>"
      : '<button class="tb-btn bevel-out" data-act="min" aria-label="최소화">' + GLYPH.min + "</button>" +
        '<button class="tb-btn bevel-out" data-act="max" aria-label="최대화">' + GLYPH.max + "</button>" +
        '<button class="tb-btn bevel-out" data-act="close" aria-label="닫기">' + GLYPH.close + "</button>";

    const menu = opts.menu
      ? '<div class="menu-bar">' + (S.menuBar || []).map(m => "<span>" + m + "</span>").join("") + "</div>"
      : "";

    win.innerHTML =
      '<div class="title-bar">' +
        (opts.iconHtml ? '<div class="title-icon">' + opts.iconHtml + "</div>" : "") +
        '<div class="title-text"></div>' +
        '<div class="title-btns">' + btns + "</div>" +
      "</div>" + menu +
      '<div class="window-body"></div>' +
      (opts.status ? '<div class="status-bar"><div class="status-cell"></div></div>' : "");

    win.querySelector(".title-text").textContent = opts.title || "";
    layer.appendChild(win);

    win.querySelector(".title-btns").addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.act;
      if (act === "min") minimize(win);
      else if (act === "max") win.classList.toggle("maximized");
      else if (act === "close") closeWin(win);
    });
    if (!opts.dialog) {
      win.querySelector(".title-bar").addEventListener("dblclick", e => {
        if (!e.target.closest("button")) win.classList.toggle("maximized");
      });
    }
    win.addEventListener("pointerdown", () => focusWin(win));
    makeDraggable(win);
    return win;
  }

  // 창 종류별 기본 크기 [가로, 세로]
  const SIZE = {
    folder: [380, 280], text: [360, 280], image: [320, 260],
    browser: [620, 470], music: [330, 400], calendar: [340, 400],
    typing: [760, 520], stack: [360, 500],
    gallery: [440, 380], relation: [600, 480],
  };

  function createWindow(item, at) {
    playSound("open");
    const w = item.window;
    const type = BUILD[w.type] ? w.type : "text";
    const win = shell({ title: w.title || item.label, iconHtml: iconHTML(item), menu: true, status: true });
    win._item = item;
    win._btn = makeTaskButton(item, win);
    opened.set(item, win);

    setStatus(win, BUILD[type](win, w));
    place(win, w.width || SIZE[type][0], w.height || SIZE[type][1]);
    applyPos(win, at || w);
    focusWin(win);
  }

  // left / top / right / bottom (px) 로 위치 지정
  function applyPos(win, p) {
    if (!p) return;
    const has = k => typeof p[k] === "number";
    if (!has("left") && !has("top") && !has("right") && !has("bottom")) return;
    win._anchor = p;   // 화면 크기가 바뀌면 다시 계산하려고 기억
    const dw = desktop.clientWidth, dh = desktop.clientHeight;
    if (has("left")) win.style.left = p.left + "px";
    else if (has("right")) win.style.left = dw - win.offsetWidth - p.right + "px";
    if (has("top")) win.style.top = p.top + "px";
    else if (has("bottom")) win.style.top = dh - win.offsetHeight - p.bottom + "px";
    clampPos(win);
  }

  // 화면 크기가 바뀌거나 바탕화면이 보일 때 창 위치 다시 맞추기
  function relayoutWindows() {
    layer.querySelectorAll(".window").forEach(win => {
      if (win._center != null) return centerDialog(win);
      if (win._size) sizeWin(win);
      if (win._anchor) applyPos(win, win._anchor);
      else clampPos(win);
    });
  }
  window.addEventListener("resize", relayoutWindows);

  // 홈페이지에 들어오면 처음부터 열려 있는 창
  function openStartup() {
    const st = S.startup || {};
    (st.windows || []).forEach(s => {
      const item = findById(s.open, S.desktopIcons) || findById(s.open, S.programs);
      if (item) openItem(item, s);
    });
  }

  // 창 크기: 원래 크기를 기억해두고, 화면보다 크면 화면에 맞춰 줄임
  function sizeWin(win) {
    const dw = desktop.clientWidth, dh = desktop.clientHeight;
    win.style.width = Math.max(200, Math.min(win._size[0], dw - 16)) + "px";
    win.style.height = Math.max(120, Math.min(win._size[1], dh - 16)) + "px";
  }

  function place(win, width, height) {
    win._size = [width, height];
    sizeWin(win);
    const left = 110 + (cascade % 8) * 26;
    const top = 20 + (cascade % 8) * 26;
    cascade++;
    win.style.left = left + "px";
    win.style.top = top + "px";
    clampPos(win);
  }

  function clampPos(win) {
    const dw = desktop.clientWidth, dh = desktop.clientHeight;
    win.style.left = Math.max(0, Math.min(win.offsetLeft, dw - win.offsetWidth)) + "px";
    win.style.top = Math.max(0, Math.min(win.offsetTop, dh - win.offsetHeight)) + "px";
  }

  function makeTaskButton(item, win) {
    const b = el("button", "task-btn bevel-out", '<span class="task-icon">' + iconHTML(item) + '</span><span class="task-text"></span>');
    b.querySelector(".task-text").textContent = win.querySelector(".title-text").textContent;
    b.addEventListener("click", () => {
      if (win.classList.contains("minimized")) restore(win);
      else if (win.classList.contains("active")) minimize(win);
      else focusWin(win);
    });
    taskButtons.appendChild(b);
    return b;
  }

  function focusWin(win) {
    if (win.classList.contains("active")) return;
    layer.querySelectorAll(".window.active").forEach(w => w.classList.remove("active"));
    taskButtons.querySelectorAll(".task-btn.active").forEach(b => b.classList.remove("active"));
    win.classList.add("active");
    win.style.zIndex = ++zTop;
    if (win._btn) win._btn.classList.add("active");
  }

  function focusTopmost() {
    let top = null;
    layer.querySelectorAll(".window:not(.minimized)").forEach(w => {
      if (!top || +w.style.zIndex > +top.style.zIndex) top = w;
    });
    if (top) focusWin(top);
  }

  function minimize(win) {
    win.classList.add("minimized");
    win.classList.remove("active");
    if (win._btn) win._btn.classList.remove("active");
    focusTopmost();
  }

  function restore(win) {
    win.classList.remove("minimized");
    focusWin(win);
  }

  function closeWin(win) {
    if (win._onClose) win._onClose();
    win.remove();
    if (win._btn) win._btn.remove();
    if (win._item) opened.delete(win._item);
    focusTopmost();
  }

  // 제목줄 잡고 끌기
  function makeDraggable(win) {
    const bar = win.querySelector(".title-bar");
    bar.addEventListener("pointerdown", e => {
      if (e.target.closest("button") || win.classList.contains("maximized")) return;
      const sx = e.clientX, sy = e.clientY;
      const ox = win.offsetLeft, oy = win.offsetTop;
      win._anchor = null;   // 직접 옮긴 창은 그 자리 유지
      win._center = null;
      bar.setPointerCapture(e.pointerId);
      const move = ev => {
        const dw = desktop.clientWidth, dh = desktop.clientHeight;
        let nx = ox + ev.clientX - sx;
        let ny = oy + ev.clientY - sy;
        nx = Math.max(60 - win.offsetWidth, Math.min(nx, dw - 60));
        ny = Math.max(0, Math.min(ny, dh - 24));
        win.style.left = nx + "px";
        win.style.top = ny + "px";
      };
      const up = () => {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });
  }

  /* ---------------- 5. 창 종류별 내용 ---------------- */

  // [폴더]
  function buildFolder(win, w) {
    const view = el("div", "folder-view bevel-in");
    const folderId = win._item && win._item.id;
    function fill() {
      view.innerHTML = "";
      const items = (w.items || []).concat(folderId ? fbChildren(folderId) : []);
      items.forEach(child => view.appendChild(makeIcon(child)));
      setStatus(win, w.status || items.length + "개 개체");
      return items.length;
    }
    view.addEventListener("pointerdown", e => { if (e.target === view) clearSelection(view); });
    // 관리자: 폴더 빈 곳 오른쪽 클릭 → 새로 만들기
    view.addEventListener("contextmenu", e => {
      if (!FBS.admin || e.target !== view) return;
      e.preventDefault();
      newMenu(e, folderId);
    });
    bodyOf(win).appendChild(view);
    win._refresh = fill;
    const n = fill();
    return w.status || n + "개 개체";
  }

  // [메모장]
  function buildText(win, w) {
    const view = el("div", "text-view bevel-in");
    if (w.image) {
      const img = el("img", "tv-img");
      img.alt = "";
      img.src = w.image;
      view.appendChild(img);
    }
    const t = el("div", "tv-text");
    t.textContent = w.text || "";
    view.appendChild(t);
    bodyOf(win).appendChild(view);
    return w.status || "";
  }

  // [그림 보기]
  function buildImage(win, w) {
    const view = el("div", "img-view bevel-in");
    const img = el("img");
    img.alt = "";
    img.draggable = false;
    if (w.pixel) img.style.imageRendering = "pixelated";
    view.appendChild(img);
    bodyOf(win).appendChild(view);

    img.addEventListener("load", () => {
      setStatus(win, img.naturalWidth + " x " + img.naturalHeight);
      if (w.width || w.height) return;
      // 그림 크기에 맞춰 창 크기 조절
      const dw = desktop.clientWidth, dh = desktop.clientHeight;
      const cw = win.offsetWidth - view.clientWidth + 8;
      const ch = win.offsetHeight - view.clientHeight + 8;
      win._size = [Math.max(img.naturalWidth + cw, 220), Math.max(img.naturalHeight + ch, 140)];
      sizeWin(win);
      if (win._anchor) applyPos(win, win._anchor); else clampPos(win);
    });
    img.addEventListener("error", () => {
      view.innerHTML = "";
      const m = el("div", "img-missing");
      m.textContent = "이미지를 찾을 수 없어요\n" + (w.src || "");
      view.appendChild(m);
      setStatus(win, "");
    });
    img.src = w.src || "";
    return "불러오는 중...";
  }

  // [브라우저]
  function buildBrowser(win, w) {
    const pages = w.pages || [];
    const SH = w.searchHome || {};
    const find = id => pages.find(p => p.id === id);
    const body = bodyOf(win);
    body.innerHTML =
      '<div class="br-tabs"><div class="br-tab"><span class="br-tab-icon">' + iconSVG("browser") + '</span><span class="br-tab-text"></span></div></div>' +
      '<div class="br-toolbar">' +
        '<button class="br-btn bevel-out" data-nav="back" aria-label="뒤로">' + GLYPH.back + "</button>" +
        '<button class="br-btn bevel-out" data-nav="fwd" aria-label="앞으로">' + GLYPH.fwd + "</button>" +
        '<button class="br-btn bevel-out" data-nav="home" aria-label="홈">' + GLYPH.home + "</button>" +
        '<div class="br-addr-wrap">' +
          '<input class="br-addr" type="text" spellcheck="false" autocomplete="off">' +
          '<div class="br-history bevel-out hidden"></div>' +
        "</div>" +
        '<button class="br-go bevel-out">이동</button>' +
      "</div>" +
      '<div class="br-bookmarks"></div>' +
      '<div class="br-page bevel-in"></div>';

    const input = body.querySelector(".br-addr");
    const page = body.querySelector(".br-page");
    const tabText = body.querySelector(".br-tab-text");
    input.placeholder = w.placeholder || "검색어 또는 주소 입력";

    let stack = [], pos = -1;

    // 검색 기록 / 즐겨찾기 항목을 눌렀을 때
    function runEntry(h) {
      if (h.open) openById(h.open);
      else if (h.link) window.open(h.link, "_blank", "noopener");
      else if (h.page) go(h.page);
      else search(h.text);
    }

    // 검색창 아래로 펼쳐지는 검색 기록 (주소창, 검색 사이트 둘 다 사용)
    function attachHistory(inp, box) {
      const show = () => {
        const list = w.history || [];
        box.innerHTML = '<div class="br-hist-head">최근 검색 기록</div>';
        if (!list.length) box.appendChild(el("div", "br-hist-empty", "기록 없음"));
        list.forEach(h => {
          const row = el("div", "br-hist-item", '<span class="br-hist-icon">' + iconSVG("browser") + "</span><span></span>");
          row.lastChild.textContent = h.text || h.page || "";
          row.addEventListener("pointerdown", e => e.preventDefault()); // 검색창 포커스 유지
          row.addEventListener("click", () => { hide(); inp.blur(); runEntry(h); });
          box.appendChild(row);
        });
        box.classList.remove("hidden");
      };
      const hide = () => box.classList.add("hidden");
      inp.addEventListener("focus", () => { inp.select(); show(); });
      inp.addEventListener("click", show);
      inp.addEventListener("blur", () => setTimeout(hide, 120));
      inp.addEventListener("input", hide);   // 글자를 치기 시작하면 기록 목록 닫기
      inp.addEventListener("keydown", e => {
        if (e.key === "Enter") { hide(); inp.blur(); search(inp.value); }
        else if (e.key === "Escape") { hide(); inp.blur(); }
      });
      return hide;
    }

    // 검색 사이트 첫 화면
    function renderSearchHome(p) {
      const wrap = el("div", "sh-wrap");
      const logo = el("div", "sh-logo");
      if (SH.logoImage) {
        logo.innerHTML = '<img src="' + SH.logoImage + '" alt="">';
      } else {
        const colors = SH.logoColors || ["#ff5fa2", "#ffb800", "#3cb371", "#1a5cff", "#9b59ff", "#ff7a45"];
        let k = 0;
        Array.from(SH.logo || p.title || "Search").forEach(ch => {
          const sp = el("span");
          sp.textContent = ch;
          if (ch.trim()) sp.style.color = colors[k++ % colors.length];
          logo.appendChild(sp);
        });
      }
      wrap.appendChild(logo);
      if (SH.subtitle) {
        const sub = el("div", "sh-sub");
        sub.textContent = SH.subtitle;
        wrap.appendChild(sub);
      }
      const box = el("div", "sh-box",
        '<input class="sh-input" type="text" spellcheck="false" autocomplete="off">' +
        '<div class="br-history bevel-out hidden"></div>');
      wrap.appendChild(box);
      const sInput = box.querySelector(".sh-input");
      sInput.placeholder = SH.placeholder || "";
      const hide = attachHistory(sInput, box.querySelector(".br-history"));

      const btns = el("div", "sh-btns");
      const b1 = el("button", "btn bevel-out");
      b1.textContent = SH.searchButton || "검색";
      b1.addEventListener("click", () => { hide(); search(sInput.value); });
      btns.appendChild(b1);
      if (SH.luckyButton !== "") {
        const b2 = el("button", "btn bevel-out");
        b2.textContent = SH.luckyButton || "아무 페이지나!";
        b2.addEventListener("click", () => {
          hide();
          const pool = pages.filter(x => !x.searchHome);
          if (pool.length) push(pool[Math.floor(Math.random() * pool.length)]);
        });
        btns.appendChild(b2);
      }
      wrap.appendChild(btns);
      if (p.html) wrap.appendChild(el("div", "br-html sh-extra", p.html));
      page.appendChild(wrap);
    }

    // ── 감상 기록 (리뷰) ──
    const stars = n => {
      n = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
      return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
    };
    function reviewThumb(r) {
      return r.image
        ? '<img src="' + r.image + '" alt="">'
        : iconSVG(r.icon || "file", r.color);
    }
    function renderReviews(p) {
      const R = p.reviews;
      const items = (R.items || []).concat(R.useOnline === false ? [] : FBS.reviews);   // 관리자가 쓴 감상 합치기
      const wrap = el("div", "rv-wrap");
      const h = el("h1", "rv-title");
      h.textContent = R.heading || p.title || "";
      wrap.appendChild(h);
      if (R.intro) {
        const it = el("p", "rv-intro");
        it.textContent = R.intro;
        wrap.appendChild(it);
      }
      // 분류 버튼 (전체 / 책 / 영화 ...)
      const cats = [];
      items.forEach(r => { if (r.category && cats.indexOf(r.category) === -1) cats.push(r.category); });
      const filter = el("div", "rv-filter");
      const list = el("div", "rv-list");
      let current = "";
      ["", ...cats].forEach(c => {
        const b = el("button", "rv-chip bevel-out");
        b.textContent = c || "전체";
        b.addEventListener("click", () => { current = c; draw(); });
        filter.appendChild(b);
      });
      if (cats.length) wrap.appendChild(filter);
      if (FBS.admin && R.useOnline !== false) {
        const add = el("button", "btn bevel-out rv-add");
        add.textContent = "＋ 새 감상 쓰기";
        add.addEventListener("click", () => reviewForm(null));
        wrap.appendChild(add);
      }
      wrap.appendChild(list);
      function draw() {
        filter.querySelectorAll(".rv-chip").forEach((b, i) => b.classList.toggle("on", (i === 0 ? "" : cats[i - 1]) === current));
        list.innerHTML = "";
        const shown = items.filter(r => !current || r.category === current);
        if (!shown.length) list.appendChild(el("p", "rv-empty", "아직 기록이 없어요."));
        shown.forEach(r => {
          const row = el("div", "rv-item",
            '<div class="rv-thumb">' + reviewThumb(r) + "</div>" +
            '<div class="rv-info"><div class="rv-name"></div><div class="rv-meta"></div>' +
            '<div class="rv-stars"></div><div class="rv-short"></div></div>');
          row.querySelector(".rv-name").textContent = (r.category ? "[" + r.category + "] " : "") + (r.title || "");
          row.querySelector(".rv-meta").textContent = [r.creator, r.date].filter(Boolean).join(" · ");
          row.querySelector(".rv-stars").textContent = r.rating != null ? stars(r.rating) : "";
          row.querySelector(".rv-short").textContent = r.short || "";
          row.addEventListener("click", () => push({
            _review: r,
            title: r.title,
            address: (p.address || "oc://review") + "/" + (items.indexOf(r) + 1),
          }));
          list.appendChild(row);
        });
      }
      draw();
      page.appendChild(wrap);
    }
    function renderReviewDetail(p) {
      const r = p._review;
      const wrap = el("div", "rv-detail");
      if (r.image) {
        const im = el("img", "rv-cover");
        im.alt = "";
        im.src = r.image;
        wrap.appendChild(im);
      }
      const h = el("h1");
      h.textContent = r.title || "";
      wrap.appendChild(h);
      const meta = el("div", "rv-meta");
      meta.textContent = [r.category, r.creator, r.date].filter(Boolean).join(" · ");
      wrap.appendChild(meta);
      if (r.rating != null) {
        const st = el("div", "rv-stars big");
        st.textContent = stars(r.rating);
        wrap.appendChild(st);
      }
      if (r.short) {
        const sh = el("p", "rv-quote");
        sh.textContent = r.short;
        wrap.appendChild(sh);
      }
      const t = el("div", "rv-text");
      t.textContent = r.text || "";
      wrap.appendChild(t);
      if (FBS.admin && r._fb) {
        const bar = el("p", "rv-admin");
        const b1 = el("button", "btn bevel-out");
        b1.textContent = "수정";
        b1.addEventListener("click", () => reviewForm(r));
        const b2 = el("button", "btn bevel-out");
        b2.textContent = "삭제";
        b2.addEventListener("click", () => confirmDelete("'" + (r.title || "") + "' 감상", () => FBS.db.collection(col("reviews")).doc(r._fb).delete()));
        bar.appendChild(b1);
        bar.appendChild(b2);
        wrap.appendChild(bar);
      }
      const back = el("p", "", '<a class="rv-back">← 목록으로</a>');
      back.querySelector("a").addEventListener("click", () => { if (pos > 0) render(stack[--pos]); });
      wrap.appendChild(back);
      page.appendChild(wrap);
    }

    function render(p) {
      page.innerHTML = "";
      page.scrollTop = 0;
      page.classList.toggle("is-search-home", !!p.searchHome);
      if (p.searchHome) {
        renderSearchHome(p);
      } else if (p.reviews) {
        renderReviews(p);
      } else if (p._review) {
        renderReviewDetail(p);
      } else {
        if (p.image) {
          const im = el("img", "br-img");
          im.alt = "";
          im.src = p.image;
          page.appendChild(im);
        }
        if (p.html) {
          page.appendChild(el("div", "br-html", p.html));
        } else {
          const t = el("div", "br-text");
          t.textContent = p.text || "";
          page.appendChild(t);
        }
      }
      input.value = p.address || "oc://" + (p.id || "");
      tabText.textContent = p.title || "새 탭";
      setTitle(win, (p.title ? p.title + " - " : "") + (w.title || "브라우저"));
      setStatus(win, "완료");
    }
    function push(p) {
      stack = stack.slice(0, pos + 1);
      stack.push(p);
      pos = stack.length - 1;
      render(p);
    }
    function notFound(q) {
      return { address: "oc://search?q=" + q, title: "검색 결과", text: "'" + q + "'에 대한 검색 결과가 없습니다." };
    }
    function go(id) { push(find(id) || notFound(id)); }
    function search(q) {
      q = String(q || "").trim();
      if (!q) return;
      const lower = q.toLowerCase();
      const hit = pages.find(p =>
        p.id === q || p.address === q ||
        [p.title, p.keyword].some(k => k && String(k).toLowerCase().indexOf(lower) !== -1) ||
        String(p.keyword || "").toLowerCase().split(/\s+/).some(k => k && lower.indexOf(k) !== -1)
      );
      if (hit) return push(hit);
      // 감상 기록 제목으로도 찾기
      for (const pg of pages) {
        const items = (pg.reviews && pg.reviews.items) || [];
        const r = items.find(x => [x.title, x.creator].some(k => k && String(k).toLowerCase().indexOf(lower) !== -1));
        if (r) return push({ _review: r, title: r.title, address: (pg.address || "oc://review") + "/" + (items.indexOf(r) + 1) });
      }
      push(notFound(q));
    }

    // 주소창
    const hideAddr = attachHistory(input, body.querySelector(".br-addr-wrap .br-history"));
    body.querySelector(".br-go").addEventListener("click", () => { hideAddr(); search(input.value); });

    // 즐겨찾기 줄
    const bm = body.querySelector(".br-bookmarks");
    const marks = w.bookmarks || [];
    if (!marks.length) bm.style.display = "none";
    marks.forEach(m => {
      const a = el("button", "br-mark", '<span class="br-mark-icon">' + iconSVG(m.icon || "file") + "</span><span></span>");
      a.lastChild.textContent = m.text || "";
      a.addEventListener("click", () => runEntry(m));
      bm.appendChild(a);
    });

    body.querySelector(".br-toolbar").addEventListener("click", e => {
      const b = e.target.closest("[data-nav]");
      if (!b) return;
      const nav = b.dataset.nav;
      if (nav === "back" && pos > 0) render(stack[--pos]);
      else if (nav === "fwd" && pos < stack.length - 1) render(stack[++pos]);
      else if (nav === "home") go(w.home || (pages[0] && pages[0].id));
    });

    // 페이지 안의 링크
    page.addEventListener("click", e => {
      const a = e.target.closest("a");
      if (!a) return;
      if (a.dataset.page) { e.preventDefault(); go(a.dataset.page); }
      else if (a.dataset.open) { e.preventDefault(); openById(a.dataset.open); }
      else if (a.href) { e.preventDefault(); window.open(a.href, "_blank", "noopener"); }
    });

    // 관리자가 감상을 쓰거나 고치면 보고 있던 페이지 다시 그리기
    win._refresh = () => {
      const p = stack[pos];
      if (!p) return;
      if (p._review && p._review._fb) {
        const fresh = FBS.reviews.find(x => x._fb === p._review._fb);
        if (!fresh) { if (pos > 0) { pos--; render(stack[pos]); } return; }
        p._review = fresh;
        p.title = fresh.title;
      }
      if (p.reviews || p._review) render(p);
    };

    const home = w.home || (pages[0] && pages[0].id);
    if (home) go(home);
    else push({ title: "", text: "페이지가 없어요." });
    return "완료";
  }

  // [뮤직플레이어]
  function buildMusic(win, w) {
    const tracks = w.tracks || [];
    const body = bodyOf(win);
    body.innerHTML =
      '<div class="mp-screen"><div class="mp-cover"></div>' +
        '<div class="mp-info"><div class="mp-title"></div><div class="mp-artist"></div><div class="mp-time">00:00 / 00:00</div></div>' +
      "</div>" +
      '<input class="mp-seek" type="range" min="0" max="1000" value="0" aria-label="재생 위치">' +
      '<div class="mp-controls">' +
        ["prev", "play", "stop", "next"].map(k => '<button class="mp-btn bevel-out" data-mp="' + k + '" aria-label="' + k + '">' + GLYPH[k] + "</button>").join("") +
        '<div class="mp-vol"><span>볼륨</span><input class="mp-volume" type="range" min="0" max="100" aria-label="볼륨"></div>' +
      "</div>" +
      '<div class="mp-list bevel-in"></div>';

    const $ = s => body.querySelector(s);
    const coverEl = $(".mp-cover"), titleEl = $(".mp-title"), artistEl = $(".mp-artist"), timeEl = $(".mp-time");
    const seek = $(".mp-seek"), vol = $(".mp-volume"), list = $(".mp-list");
    const playBtn = body.querySelector('[data-mp="play"]');

    const audio = new Audio();
    audio.preload = "metadata";
    let cur = 0, seeking = false;

    vol.value = w.volume != null ? w.volume : 70;
    audio.volume = vol.value / 100;

    const fmt = s => {
      if (!isFinite(s)) return "00:00";
      s = Math.floor(s);
      return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    };
    const setPlayIcon = on => { playBtn.innerHTML = on ? GLYPH.pause : GLYPH.play; };

    tracks.forEach((t, i) => {
      const row = el("div", "mp-row");
      row.textContent = (i + 1) + ". " + (t.title || "") + (t.artist ? " - " + t.artist : "");
      row.addEventListener("click", () => { load(i); play(); });
      list.appendChild(row);
    });

    function load(i) {
      if (!tracks.length) return;
      cur = (i + tracks.length) % tracks.length;
      const t = tracks[cur];
      audio.src = t.src || "";
      titleEl.textContent = t.title || "";
      artistEl.textContent = t.artist || "";
      const c = t.cover || w.cover;
      coverEl.innerHTML = c ? '<img src="' + c + '" alt="">' : iconSVG("music", "#3dff7a");
      list.querySelectorAll(".mp-row").forEach((r, k) => r.classList.toggle("active", k === cur));
      seek.value = 0;
      timeEl.textContent = "00:00 / 00:00";
      setPlayIcon(false);
    }
    function play() {
      if (!tracks.length) return;
      audio.play().then(() => { setPlayIcon(true); setStatus(win, "재생 중"); }).catch(() => {});
    }
    function pause() { audio.pause(); setPlayIcon(false); setStatus(win, "일시정지"); }

    body.querySelector(".mp-controls").addEventListener("click", e => {
      const b = e.target.closest("[data-mp]");
      if (!b) return;
      const k = b.dataset.mp;
      if (k === "play") audio.paused ? play() : pause();
      else if (k === "stop") { audio.pause(); audio.currentTime = 0; setPlayIcon(false); setStatus(win, "정지"); }
      else if (k === "prev") { load(cur - 1); play(); }
      else if (k === "next") { load(cur + 1); play(); }
    });

    audio.addEventListener("timeupdate", () => {
      if (seeking) return;
      seek.value = audio.duration ? (audio.currentTime / audio.duration) * 1000 : 0;
      timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
    });
    audio.addEventListener("loadedmetadata", () => {
      timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
    });
    audio.addEventListener("ended", () => { load(cur + 1); play(); });
    audio.addEventListener("error", () => {
      if (!audio.getAttribute("src")) return;
      setPlayIcon(false);
      const src = String((tracks[cur] && tracks[cur].src) || "");
      setStatus(win, "파일을 찾을 수 없어요" + (src.indexOf("data:") === 0 ? "" : ": " + src.split("/").pop()));
    });

    seek.addEventListener("input", () => {
      seeking = true;
      if (audio.duration) timeEl.textContent = fmt((seek.value / 1000) * audio.duration) + " / " + fmt(audio.duration);
    });
    seek.addEventListener("change", () => {
      if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
      seeking = false;
    });
    vol.addEventListener("input", () => { audio.volume = vol.value / 100; });

    // 창을 닫으면 음악도 멈춤
    win._onClose = () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };

    if (tracks.length) {
      load(0);
      if (w.autoplay) play();
      return "재생 대기";
    }
    titleEl.textContent = "재생할 곡이 없어요";
    coverEl.innerHTML = iconSVG("music", "#3dff7a");
    return "곡 없음";
  }

  // [달력]
  const entryItems = new Map(); // 달력 기록 → 열리는 창
  function openEntry(key, e) {
    if (e.open) return openById(e.open);
    let item = entryItems.get(e);
    if (!item) {
      const t = e.title || key;
      const onlyImage = e.image && !e.text;
      item = {
        label: t,
        icon: onlyImage ? "image" : "file",
        window: onlyImage
          ? { type: "image", title: key + " - " + t, src: e.image }
          : { type: "text", title: key + " - " + t, text: e.text || "", image: e.image },
      };
      entryItems.set(e, item);
    }
    openItem(item);
  }

  function buildCalendar(win, w) {
    let entries = {};
    const today = new Date();
    let y = today.getFullYear(), m = today.getMonth();
    if (w.startMonth) {
      const p = String(w.startMonth).split("-").map(Number);
      if (p[0] && p[1]) { y = p[0]; m = p[1] - 1; }
    }
    const body = bodyOf(win);
    body.innerHTML =
      '<div class="cal-head">' +
        '<button class="br-btn bevel-out" data-cal="-1" aria-label="이전 달">' + GLYPH.back + "</button>" +
        '<div class="cal-label"></div>' +
        '<button class="br-btn bevel-out" data-cal="1" aria-label="다음 달">' + GLYPH.fwd + "</button>" +
      "</div>" +
      '<div class="cal-box bevel-in"><div class="cal-week"></div><div class="cal-grid"></div></div>' +
      '<div class="cal-note"></div>';

    const label = body.querySelector(".cal-label");
    const week = body.querySelector(".cal-week");
    const grid = body.querySelector(".cal-grid");
    const note = body.querySelector(".cal-note");
    const hint = w.hint || "표시된 날짜를 눌러보세요";

    (w.weekdays || ["일", "월", "화", "수", "목", "금", "토"]).forEach((d, i) => {
      const c = el("div", "cal-wd" + (i === 0 ? " sun" : i === 6 ? " sat" : ""));
      c.textContent = d;
      week.appendChild(c);
    });

    const key = (yy, mm, dd) => yy + "-" + String(mm + 1).padStart(2, "0") + "-" + String(dd).padStart(2, "0");

    function render() {
      entries = Object.assign({}, w.entries || {}, w.useOnline === false ? {} : FBS.diary);   // 관리자가 쓴 일기 합치기
      label.textContent = y + "년 " + (m + 1) + "월";
      note.textContent = hint;
      grid.innerHTML = "";
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      let count = 0;
      for (let i = 0; i < first; i++) grid.appendChild(el("div", "cal-blank"));
      for (let d = 1; d <= days; d++) {
        const k = key(y, m, d);
        const e = entries[k];
        const dow = (first + d - 1) % 7;
        const isToday = y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
        const cell = el("button",
          "cal-day" + (dow === 0 ? " sun" : dow === 6 ? " sat" : "") + (e ? " has" : "") + (isToday ? " today" : ""),
          '<span class="cal-num">' + d + "</span>" + (e ? '<span class="cal-mark"></span>' : ""));
        if (e) {
          count++;
          cell.querySelector(".cal-mark").textContent = e.mark || "●";
        }
        cell.addEventListener("click", () => {
          grid.querySelectorAll(".cal-day.sel").forEach(x => x.classList.remove("sel"));
          cell.classList.add("sel");
          if (e) {
            note.textContent = k + "  " + (e.title || "");
            openEntry(k, e);
          } else {
            note.textContent = k + "  기록 없음";
          }
          // 관리자: 이 날짜에 일기 쓰기 / 수정 / 삭제
          if (FBS.admin && w.useOnline !== false) {
            const bar = el("span", "cal-admin");
            const isMine = e && e._fb;
            const b1 = el("button", "btn bevel-out mini");
            b1.textContent = isMine ? "수정" : "일기 쓰기";
            b1.addEventListener("click", () => diaryForm(k, isMine ? e : null));
            bar.appendChild(b1);
            if (isMine) {
              const b2 = el("button", "btn bevel-out mini");
              b2.textContent = "삭제";
              b2.addEventListener("click", () => confirmDelete("'" + k + "' 일기", () => FBS.db.collection(col("diary")).doc(k).delete()));
              bar.appendChild(b2);
            }
            note.appendChild(bar);
          }
        });
        grid.appendChild(cell);
      }
      setStatus(win, "이번 달 기록 " + count + "개");
    }

    body.querySelector(".cal-head").addEventListener("click", e => {
      const b = e.target.closest("[data-cal]");
      if (!b) return;
      m += Number(b.dataset.cal);
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      render();
    });

    win._refresh = render;
    render();
    return win.querySelector(".status-cell").textContent;
  }

  // [타자연습]
  // 한글 타수 계산용: 글자 하나를 치는 데 필요한 자판 수
  function strokes(ch) {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) return 1;
    const jung = Math.floor(c / 28) % 21, jong = c % 28;
    let n = 2;
    if ([9, 10, 11, 14, 15, 16, 19].indexOf(jung) !== -1) n++;
    if (jong) {
      n++;
      if ([3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18].indexOf(jong) !== -1) n++;
    }
    return n;
  }

  function buildTyping(win, w) {
    const all = (w.sentences || []).map(x => (typeof x === "string" ? { text: x } : x)).filter(x => x.text);
    const T = w.theme || {};
    const perPage = Math.max(1, w.linesPerPage || 5);
    const maxCpm = w.maxCpm || 600;
    const chars = w.characters || {};
    const body = bodyOf(win);

    body.innerHTML =
      '<div class="ty">' +
        '<div class="ty-head"><div class="ty-plaque"></div></div>' +
        '<div class="ty-main">' +
          '<div class="ty-paper"></div>' +
          '<div class="ty-side">' +
            '<div class="ty-name"></div>' +
            '<div class="ty-portrait"></div>' +
            '<div class="ty-timebox"><div class="ty-label"></div><div class="ty-timer">00:00</div></div>' +
            '<div class="ty-nowline"></div>' +
            '<div class="ty-page"></div>' +
          "</div>" +
        "</div>" +
        '<div class="ty-bottom">' +
          '<div class="ty-row"><span class="ty-k">타&nbsp;&nbsp;&nbsp;수</span><span class="ty-v ty-cpm">0타/분</span><div class="ty-bar"><i class="ty-cpm-bar"></i></div></div>' +
          '<div class="ty-row"><span class="ty-k">정확도</span><span class="ty-v ty-acc">100 %</span><div class="ty-bar"><i class="ty-acc-bar"></i></div></div>' +
        "</div>" +
        '<div class="ty-result hidden"><div class="ty-rbox">' +
          '<div class="ty-plaque small"></div>' +
          '<div class="ty-rmain"><div class="ty-rstats"></div><div class="ty-portrait ty-rportrait"></div></div>' +
          '<div class="ty-rbtns"><button class="btn bevel-out" data-ty="again">계속</button><button class="btn bevel-out" data-ty="quit">그만</button></div>' +
        "</div></div>" +
      "</div>";

    const root = body.querySelector(".ty");
    const $ = q => body.querySelector(q);
    // 색 바꾸기
    const setVar = (k, v) => { if (v) root.style.setProperty(k, v); };
    setVar("--ty-paper", T.paper); setVar("--ty-orig", T.textColor);
    setVar("--ty-bar", T.barColor); setVar("--ty-panel", T.panel);

    $(".ty-head .ty-plaque").textContent = w.heading || w.title || "타자연습";
    $(".ty-result .ty-plaque").textContent = (w.heading || w.title || "타자연습") + " 결과";
    $(".ty-label").textContent = w.timerLabel || "연습 시간";

    const paper = $(".ty-paper"), nameEl = $(".ty-name"), portrait = $(".ty-portrait");
    const timerEl = $(".ty-timer"), nowEl = $(".ty-nowline"), pageEl = $(".ty-page");
    const cpmEl = $(".ty-cpm"), accEl = $(".ty-acc"), cpmBar = $(".ty-cpm-bar"), accBar = $(".ty-acc-bar");
    const result = $(".ty-result");

    let list = [], idx = 0, composing = false, timer = 0;
    let startTime = 0, lineStart = 0, totalStrokes = 0, totalMs = 0, totalOk = 0, totalLen = 0;
    let typedLines = [];   // 다 친 줄들의 입력 내용
    let input = null, origSpans = null;

    const esc = ch => (ch === " " ? "&nbsp;" : ch.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
    const mmss = ms => {
      const t = Math.floor(ms / 1000);
      return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
    };

    function portraitOf(line) {
      const ch = line && line.who ? charByName(line.who) : null;
      const src = (line && (line.image || chars[line.who])) || (ch && ch.face) || w.portrait;
      return src ? '<img src="' + src + '" alt="">' : iconSVG("keyboard");
    }

    function start() {
      list = all.slice();
      if (w.order === "random") list.sort(() => Math.random() - 0.5);
      if (w.count) list = list.slice(0, w.count);
      idx = 0; startTime = 0; lineStart = 0;
      totalStrokes = 0; totalMs = 0; totalOk = 0; totalLen = 0;
      typedLines = [];
      clearInterval(timer);
      timerEl.textContent = "00:00";
      result.classList.add("hidden");
      updateStats(0, 100);
      drawPage();
    }

    // 지금 쪽(page)의 줄들 그리기
    function drawPage() {
      const pageNo = Math.floor(idx / perPage);
      const from = pageNo * perPage, to = Math.min(list.length, from + perPage);
      paper.innerHTML = "";
      for (let i = from; i < to; i++) {
        const line = list[i];
        const row = el("div", "ty-line" + (i === idx ? " now" : ""));
        const orig = el("div", "ty-orig");
        orig.innerHTML = Array.from(line.text).map(c => "<span>" + esc(c) + "</span>").join("");
        row.appendChild(orig);
        if (i < idx) {
          // 이미 친 줄: 틀린 글자 빨갛게
          const typed = el("div", "ty-typed");
          const v = typedLines[i] || "";
          typed.innerHTML = Array.from(v).map((c, k) => '<span class="' + (c === line.text[k] ? "" : "bad") + '">' + esc(c) + "</span>").join("");
          row.appendChild(typed);
        } else if (i === idx) {
          input = el("input", "ty-input");
          input.type = "text";
          input.spellcheck = false;
          input.autocomplete = "off";
          row.appendChild(input);
          origSpans = orig.querySelectorAll("span");
          bindInput();
        } else {
          row.appendChild(el("div", "ty-typed empty", "&nbsp;"));
        }
        paper.appendChild(row);
      }
      const cur = list[idx];
      nameEl.textContent = (cur && cur.who) || w.defaultName || "";
      nameEl.style.visibility = nameEl.textContent ? "" : "hidden";
      portrait.innerHTML = portraitOf(cur);
      nowEl.textContent = cur ? cur.text : "";
      pageEl.innerHTML = '<span class="ty-pg-box"></span>' + (pageNo + 1) + "쪽 / 총 " + Math.ceil(list.length / perPage) + "쪽";
      if (input) input.focus({ preventScroll: true });
    }

    function paint() {
      const t = list[idx].text, v = input.value;
      let ok = 0, okStrokes = 0;
      origSpans.forEach((sp, i) => {
        let cls = "";
        if (i < v.length) {
          if (composing && i === v.length - 1) cls = "cur";
          else if (v[i] === t[i]) { ok++; okStrokes += strokes(t[i]); }
          else cls = "bad";
        } else if (i === v.length) cls = "cur";
        sp.className = cls;
      });
      const judged = Math.min(v.length - (composing ? 1 : 0), t.length);
      const lineAcc = judged > 0 ? (ok / judged) * 100 : 100;
      const sumOk = totalOk + ok, sumLen = totalLen + Math.max(0, judged);
      const acc = sumLen ? (sumOk / sumLen) * 100 : lineAcc;
      const ms = totalMs + (lineStart ? Date.now() - lineStart : 0);
      const cpm = ms < 1000 ? 0 : ((totalStrokes + okStrokes) / ms) * 60000;
      updateStats(cpm, acc);
      return { ok, okStrokes };
    }

    function updateStats(cpm, acc) {
      cpmEl.textContent = Math.round(cpm) + "타/분";
      accEl.textContent = Math.round(acc) + " %";
      cpmBar.style.width = Math.min(100, (cpm / maxCpm) * 100) + "%";
      accBar.style.width = Math.max(0, Math.min(100, acc)) + "%";
    }

    function bindInput() {
      input.addEventListener("compositionstart", () => { composing = true; });
      input.addEventListener("compositionend", () => { composing = false; check(); });
      input.addEventListener("input", () => {
        if (!startTime) {
          startTime = Date.now();
          timer = setInterval(() => { timerEl.textContent = mmss(Date.now() - startTime); }, 250);
        }
        if (!lineStart && input.value) lineStart = Date.now();
        check();
      });
      input.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.isComposing && input.value) { e.preventDefault(); finishLine(); }
      });
    }
    function check() {
      paint();
      if (!composing && input.value === list[idx].text) setTimeout(() => { if (input && input.value === list[idx].text) finishLine(); }, 120);
    }

    function finishLine() {
      const t = list[idx].text, v = input.value;
      const r = paint();
      totalStrokes += r.okStrokes;
      totalMs += lineStart ? Date.now() - lineStart : 0;
      totalOk += r.ok;
      totalLen += Math.max(t.length, v.length);
      typedLines[idx] = v;
      lineStart = 0;
      input = null;
      idx++;
      if (idx >= list.length) finish();
      else drawPage();
    }

    function finish() {
      clearInterval(timer);
      const cpm = totalMs >= 1000 ? Math.round((totalStrokes / totalMs) * 60000) : 0;
      const acc = totalLen ? Math.round((totalOk / totalLen) * 100) : 100;
      updateStats(cpm, acc);
      drawPage();
      const total = startTime ? Date.now() - startTime : 0;
      const stats = $(".ty-rstats");
      stats.innerHTML = '<div class="ty-rtitle"></div>' +
        "<div>평균타수 : " + cpm + "타</div>" +
        "<div>정확도 : " + acc + "%</div>" +
        "<div>연습시간 : " + Math.floor(total / 60000) + "분 " + Math.floor((total % 60000) / 1000) + "초</div>";
      stats.querySelector(".ty-rtitle").textContent = w.endText || "수고했어요!";
      $(".ty-rportrait").innerHTML = portraitOf(w.resultPortrait ? { image: w.resultPortrait } : list[list.length - 1]);
      result.classList.remove("hidden");
    }

    result.addEventListener("click", e => {
      const b = e.target.closest("[data-ty]");
      if (!b) return;
      if (b.dataset.ty === "again") start();
      else closeWin(win);
    });
    paper.addEventListener("click", () => { if (input) input.focus(); });
    win._onClose = () => clearInterval(timer);

    if (!all.length) {
      paper.textContent = "data.js 에 문장을 넣어주세요!";
      return "문장 없음";
    }
    start();
    return "Enter: 다음 줄";
  }

  // [쌓기 게임]
  function buildStack(win, w) {
    const body = bodyOf(win);
    body.innerHTML =
      '<div class="st-bar"><span>높이 <b class="st-score">0</b></span><span>최고 <b class="st-best">0</b></span></div>' +
      '<div class="st-stage bevel-in"><canvas class="st-canvas"></canvas></div>';
    const stage = body.querySelector(".st-stage");
    const canvas = body.querySelector(".st-canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = body.querySelector(".st-score"), bestEl = body.querySelector(".st-best");
    const bestKey = "oc-stack-best-" + (w.title || "stack");
    let best = 0;
    try { best = +localStorage.getItem(bestKey) || 0; } catch (e) { /* 저장 안 되는 환경 */ }
    bestEl.textContent = best;

    // 쌓을 그림들 불러오기 (없으면 기본 푸딩 그림)
    const imgs = (w.images || []).map(src => { const im = new Image(); im.src = src; return im; });
    const IW = w.itemWidth || 70;
    const speedMul = w.speed || 1;

    let W = 300, H = 400;
    let state = "ready", score = 0, stackArr = [], cur = null, cam = 0, raf = 0, fallen = null;

    function resize() {
      W = Math.max(200, stage.clientWidth - 4);
      H = Math.max(200, stage.clientHeight - 4);
      canvas.width = W;
      canvas.height = H;
      draw();
    }

    const pickImg = () => (imgs.length ? imgs[Math.floor(Math.random() * imgs.length)] : null);
    const sizeOf = im => {
      const ok = im && im.complete && im.naturalWidth;
      return { w: IW, h: ok ? Math.round(IW * (im.naturalHeight / im.naturalWidth)) : Math.round(IW * 0.7) };
    };
    const base = () => ({ x: W / 2, y: H - 24, w: Math.max(IW * 1.8, 110), h: 0 });
    const top = () => (stackArr.length ? stackArr[stackArr.length - 1] : base());

    function spawn() {
      const im = pickImg(), sz = sizeOf(im);
      const t = top();
      cur = { img: im, w: sz.w, h: sz.h, x: sz.w / 2 + 6, y: t.y - t.h - 170, vx: 0, vy: 0, falling: false };
      const sp = Math.min(2.2 + score * 0.18, 7) * speedMul;
      cur.vx = Math.random() < 0.5 ? sp : -sp;
      if (cur.vx < 0) cur.x = W - sz.w / 2 - 6;
    }

    function reset() {
      score = 0; stackArr = []; cam = 0; fallen = null;
      scoreEl.textContent = 0;
      spawn();
    }

    function drop() {
      if (state === "ready") { state = "play"; reset(); return; }
      if (state === "over") { state = "play"; reset(); return; }
      if (cur && !cur.falling) cur.falling = true;
    }

    function step() {
      if (state === "play" && cur) {
        if (!cur.falling) {
          cur.x += cur.vx;
          if (cur.x < cur.w / 2 + 4 || cur.x > W - cur.w / 2 - 4) cur.vx *= -1;
        } else {
          cur.vy += 0.7;
          cur.y += cur.vy;
          const t = top();
          const surface = t.y - t.h;
          if (cur.y >= surface) {
            const off = cur.x - t.x;
            if (Math.abs(off) <= (t.w / 2 + cur.w / 2) * 0.7) {
              cur.y = surface;
              stackArr.push({ img: cur.img, x: cur.x, y: cur.y, w: cur.w, h: cur.h });
              score++;
              scoreEl.textContent = score;
              spawn();
            } else {
              fallen = { img: cur.img, x: cur.x, y: cur.y, w: cur.w, h: cur.h, vy: cur.vy * 0.3, vx: off > 0 ? 2.5 : -2.5, rot: 0 };
              cur = null;
              state = "falling";
            }
          }
        }
      }
      if (state === "falling" && fallen) {
        fallen.vy += 0.6;
        fallen.y += fallen.vy;
        fallen.x += fallen.vx;
        fallen.rot += fallen.vx * 0.03;
        if (fallen.y - cam > H + 120) gameOver();
      }
      // 탑이 높아지면 화면이 따라 올라감
      const t = top();
      const want = Math.min(0, (t.y - t.h) - H * 0.55);
      cam += (want - cam) * 0.08;
    }

    function gameOver() {
      state = "over";
      fallen = null;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        try { localStorage.setItem(bestKey, String(best)); } catch (e) { /* 무시 */ }
      }
    }

    // 기본 푸딩 그림 (이미지가 없을 때)
    function drawPudding(x, y, w, h) {
      const l = x - w / 2, tp = y - h;
      ctx.fillStyle = "#f4f4f4"; ctx.fillRect(l - 4, y - 5, w + 8, 5);
      ctx.fillStyle = "#000"; ctx.fillRect(l - 4, y - 1, w + 8, 1);
      ctx.fillStyle = "#ffd54a";
      ctx.beginPath();
      ctx.moveTo(l + w * 0.18, tp + h * 0.18); ctx.lineTo(l + w * 0.82, tp + h * 0.18);
      ctx.lineTo(l + w, y - 5); ctx.lineTo(l, y - 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#8b4513";
      ctx.fillRect(l + w * 0.18, tp, w * 0.64, h * 0.22);
      ctx.strokeRect(l + w * 0.18, tp, w * 0.64, h * 0.22);
      ctx.fillStyle = "#fff6c8"; ctx.fillRect(l + w * 0.12, tp + h * 0.35, w * 0.1, h * 0.2);
    }
    function drawItem(it, rot) {
      ctx.save();
      ctx.translate(it.x, it.y - cam);
      if (rot) ctx.rotate(rot);
      const ok = it.img && it.img.complete && it.img.naturalWidth;
      if (ok) {
        ctx.imageSmoothingEnabled = !w.pixel;
        ctx.drawImage(it.img, -it.w / 2, -it.h, it.w, it.h);
      } else {
        drawPudding(0, 0, it.w, it.h);
      }
      ctx.restore();
    }

    function draw() {
      ctx.fillStyle = w.background || "#fff4e0";
      ctx.fillRect(0, 0, W, H);
      // 접시(바닥)
      const b = base();
      ctx.fillStyle = w.groundColor || "#c8a27a";
      ctx.fillRect(b.x - b.w / 2, b.y - cam, b.w, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(b.x - b.w / 2, b.y - cam + 8, b.w, 2);
      stackArr.forEach(it => drawItem(it));
      if (cur) drawItem(cur);
      if (fallen) drawItem(fallen, fallen.rot);

      if (state !== "play" && state !== "falling") {
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.fillRect(0, H / 2 - 52, W, 104);
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "bold 18px Galmuri14, Galmuri11, sans-serif";
        if (state === "ready") {
          ctx.fillText(w.title || "쌓기 게임", W / 2, H / 2 - 12);
          ctx.font = "12px Galmuri11, sans-serif";
          ctx.fillText(w.startText || "클릭하거나 스페이스바로 떨어뜨리기!", W / 2, H / 2 + 18);
        } else {
          ctx.fillText((w.overText || "와르르!") + "  높이 " + score, W / 2, H / 2 - 12);
          ctx.font = "12px Galmuri11, sans-serif";
          ctx.fillText("클릭해서 다시 하기", W / 2, H / 2 + 18);
        }
      }
    }

    function loop() {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    }

    canvas.addEventListener("pointerdown", e => { e.preventDefault(); drop(); });
    const onKey = e => {
      if ((e.code === "Space" || e.key === " ") && win.classList.contains("active") && !win.classList.contains("minimized")) {
        e.preventDefault();
        drop();
      }
    };
    document.addEventListener("keydown", onKey);
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    win._onClose = () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      ro.disconnect();
    };

    resize();
    raf = requestAnimationFrame(loop);
    return "클릭 또는 스페이스바";
  }

  // [그림 모음]
  function buildGallery(win, w) {
    const pics = (w.images || []).map(x => (typeof x === "string" ? { src: x } : x));
    const body = bodyOf(win);
    body.innerHTML =
      '<div class="gl-grid bevel-in"></div>' +
      '<div class="gl-view hidden">' +
        '<div class="gl-stage bevel-in"><img alt=""></div>' +
        '<div class="gl-cap"><b class="gl-title"></b> <span class="gl-date"></span><div class="gl-text"></div></div>' +
        '<div class="gl-nav">' +
          '<button class="btn bevel-out" data-gl="prev">◀ 이전</button>' +
          '<button class="btn bevel-out" data-gl="list">목록</button>' +
          '<button class="btn bevel-out" data-gl="next">다음 ▶</button>' +
        "</div>" +
      "</div>";
    const grid = body.querySelector(".gl-grid"), view = body.querySelector(".gl-view");
    const img = body.querySelector(".gl-stage img");
    let cur = -1;
    const nameOf = p => p.title || String(p.src || "").split("/").pop();

    pics.forEach((p, i) => {
      const it = el("div", "gl-item", '<div class="gl-thumb"><img alt="" loading="lazy"></div><div class="gl-name"></div>');
      it.querySelector("img").src = p.thumb || p.src;
      it.querySelector(".gl-name").textContent = nameOf(p);
      it.addEventListener("click", () => show(i));
      grid.appendChild(it);
    });
    if (!pics.length) grid.appendChild(el("div", "gl-empty", "아직 그림이 없어요."));

    function show(i) {
      cur = (i + pics.length) % pics.length;
      const p = pics[cur];
      img.src = p.src;
      img.style.imageRendering = p.pixel || w.pixel ? "pixelated" : "";
      body.querySelector(".gl-title").textContent = nameOf(p);
      body.querySelector(".gl-date").textContent = p.date || "";
      body.querySelector(".gl-text").textContent = p.caption || "";
      grid.classList.add("hidden");
      view.classList.remove("hidden");
      setStatus(win, (cur + 1) + " / " + pics.length);
    }
    function list() {
      cur = -1;
      view.classList.add("hidden");
      grid.classList.remove("hidden");
      setStatus(win, pics.length + "개 그림");
    }
    view.querySelector(".gl-nav").addEventListener("click", e => {
      const b = e.target.closest("[data-gl]");
      if (!b) return;
      if (b.dataset.gl === "prev") show(cur - 1);
      else if (b.dataset.gl === "next") show(cur + 1);
      else list();
    });
    const onKey = e => {
      if (cur < 0 || !win.classList.contains("active")) return;
      if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
      else if (e.key === "Escape") list();
    };
    document.addEventListener("keydown", onKey);
    win._onClose = () => document.removeEventListener("keydown", onKey);
    return pics.length + "개 그림";
  }

  // [관계도]
  function buildRelation(win, w) {
    let nodes = w.nodes && w.nodes.length ? w.nodes : null;
    if (!nodes) {
      // characters.js 의 캐릭터로 인물 만들기 (위치 없으면 동그랗게 자동 배치)
      nodes = CH.map((c, i) => {
        const ang = -Math.PI / 2 + (i / Math.max(1, CH.length)) * Math.PI * 2;
        const pos = c.relationPos || { x: 50 + Math.cos(ang) * 32, y: 50 + Math.sin(ang) * 32 };
        return { id: c.id, name: c.name || c.id, image: c.face || "", color: c.folderColor, x: pos.x, y: pos.y, desc: c.intro || "", open: "char-" + c.id };
      });
    }
    const links = w.links && w.links.length ? w.links : REL;
    const body = bodyOf(win);
    body.innerHTML =
      '<div class="rl-stage bevel-in"><svg class="rl-svg" xmlns="http://www.w3.org/2000/svg"></svg><div class="rl-layer"></div></div>' +
      '<div class="rl-info"></div>';
    const stage = body.querySelector(".rl-stage"), svg = body.querySelector(".rl-svg");
    const layer2 = body.querySelector(".rl-layer"), info = body.querySelector(".rl-info");
    if (w.background) stage.style.background = w.background;
    const hint = w.hint || "인물이나 관계를 눌러보세요. (인물 더블클릭: 그 캐릭터 폴더 열기)";
    info.textContent = hint;

    const byId = {};
    const nodeEls = {};
    nodes.forEach(n => {
      byId[n.id] = n;
      const d = el("div", "rl-node", '<div class="rl-pic"></div><div class="rl-name"></div>');
      d.querySelector(".rl-pic").innerHTML = n.image ? '<img src="' + n.image + '" alt="">' : iconSVG("person", n.color);
      d.querySelector(".rl-name").textContent = n.name || n.id;
      if (n.color) d.style.setProperty("--rl-color", n.color);
      d.addEventListener("click", e => { e.stopPropagation(); select(n.id); });
      d.addEventListener("dblclick", e => { e.stopPropagation(); if (n.open) openById(n.open); });
      layer2.appendChild(d);
      nodeEls[n.id] = d;
    });

    let labelEls = [];
    let selected = null;

    // 사각형 테두리에서 선이 끝나는 점
    function edge(cx, cy, hw, hh, tx, ty) {
      const dx = tx - cx, dy = ty - cy;
      if (!dx && !dy) return [cx, cy];
      const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
      return [cx + dx * s, cy + dy * s];
    }

    function draw() {
      const W = stage.clientWidth, H = stage.clientHeight;
      if (!W || !H) return;
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
      const box = {};
      nodes.forEach(n => {
        const d = nodeEls[n.id];
        const x = (n.x != null ? n.x : 50) / 100 * W, y = (n.y != null ? n.y : 50) / 100 * H;
        d.style.left = x + "px";
        d.style.top = y + "px";
        box[n.id] = { x, y, hw: d.offsetWidth / 2 + 4, hh: d.offsetHeight / 2 + 4 };
      });
      labelEls.forEach(l => l.remove());
      labelEls = [];
      const colors = [];
      let defs = "", lines = "";
      const marker = c => {
        let i = colors.indexOf(c);
        if (i === -1) {
          i = colors.push(c) - 1;
          defs += '<marker id="rl-ar-' + i + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
                  '<path d="M0,0 L10,5 L0,10 z" fill="' + c + '"/></marker>';
        }
        return "url(#rl-ar-" + i + ")";
      };
      links.forEach((lk, li) => {
        const A = box[lk.from], B = box[lk.to];
        if (!A || !B) return;
        const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;          // 옆으로 비키는 방향
        const parts = lk.back != null
          ? [{ a: A, b: B, off: 7, label: lk.label, desc: lk.desc, dir: [lk.from, lk.to] },
             { a: B, b: A, off: 7, label: lk.back, desc: lk.backDesc, dir: [lk.to, lk.from] }]
          : [{ a: A, b: B, off: 0, label: lk.label, desc: lk.desc, dir: [lk.from, lk.to], both: lk.both }];
        parts.forEach((pt, k) => {
          // 양방향일 때는 두 줄을 나란히
          const sgn = k === 0 ? 1 : -1;
          const ox = pt.off ? nx * pt.off * sgn : 0, oy = pt.off ? ny * pt.off * sgn : 0;
          const p1 = edge(pt.a.x + ox, pt.a.y + oy, pt.a.hw, pt.a.hh, pt.b.x + ox, pt.b.y + oy);
          const p2 = edge(pt.b.x + ox, pt.b.y + oy, pt.b.hw, pt.b.hh, pt.a.x + ox, pt.a.y + oy);
          const c = lk.color || "#444";
          const m = marker(c);
          const dash = lk.style === "dashed" ? ' stroke-dasharray="6 4"' : lk.style === "dotted" ? ' stroke-dasharray="2 4"' : "";
          lines += '<line class="rl-line" data-i="' + li + '" data-from="' + pt.dir[0] + '" data-to="' + pt.dir[1] + '" x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] +
                   '" stroke="' + c + '" stroke-width="' + (lk.width || 2) + '"' + dash +
                   ' marker-end="' + m + '"' + (pt.both ? ' marker-start="' + m + '"' : "") + "/>";
          if (pt.label) {
            const lab = el("div", "rl-label");
            lab.textContent = pt.label;
            // 이름표 위치는 아래에서 겹치지 않게 정해요
            lab._p = { p1, p2, ox, oy, t: lk.labelAt != null ? Number(lk.labelAt) : (pt.off ? 0.42 : 0.5) };
            lab.style.borderColor = c;
            lab.style.color = c;
            lab.dataset.from = pt.dir[0];
            lab.dataset.to = pt.dir[1];
            lab.addEventListener("click", e => {
              e.stopPropagation();
              const fa = byId[pt.dir[0]], fb = byId[pt.dir[1]];
              const arrow = pt.both ? " ↔ " : " → ";
              info.textContent = (fa ? fa.name : pt.dir[0]) + arrow + (fb ? fb.name : pt.dir[1]) + " : " + pt.label + (pt.desc ? "  —  " + pt.desc : "");
              highlight(null, lab);
            });
            layer2.appendChild(lab);
            labelEls.push(lab);
          }
        });
      });
      svg.innerHTML = "<defs>" + defs + "</defs>" + lines;
      placeLabels(box);
      highlight(selected);
    }

    // 이름표끼리, 또는 인물 카드와 겹치면 선을 따라 조금씩 옮기기
    function placeLabels(box) {
      const taken = Object.keys(box).map(k => {
        const b = box[k];
        return { l: b.x - b.hw, r: b.x + b.hw, t: b.y - b.hh, b: b.y + b.hh };
      });
      const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      labelEls.forEach(lab => {
        const P = lab._p;
        const tries = [P.t, P.t - 0.15, P.t + 0.15, P.t - 0.27, P.t + 0.27, P.t - 0.36, P.t + 0.36]
          .filter(t => t > 0.08 && t < 0.92);
        const w = lab.offsetWidth, h = lab.offsetHeight;
        let pick = null;
        for (const t of tries) {
          const x = P.p1[0] + (P.p2[0] - P.p1[0]) * t + P.ox * 1.8;
          const y = P.p1[1] + (P.p2[1] - P.p1[1]) * t + P.oy * 1.8;
          const r = { l: x - w / 2 - 2, r: x + w / 2 + 2, t: y - h / 2 - 2, b: y + h / 2 + 2 };
          if (!taken.some(o => hit(r, o))) { pick = { x, y, r }; break; }
          if (!pick) pick = { x, y, r, fallback: true };
        }
        lab.style.left = pick.x + "px";
        lab.style.top = pick.y + "px";
        taken.push(pick.r);
      });
    }

    // 선택한 인물과 이어진 선만 진하게
    function highlight(id, onlyLabel) {
      stage.classList.toggle("has-sel", !!id || !!onlyLabel);
      nodes.forEach(n => nodeEls[n.id].classList.toggle("sel", n.id === id));
      svg.querySelectorAll(".rl-line").forEach(l => l.classList.toggle("on", !!id && (l.dataset.from === id || l.dataset.to === id)));
      labelEls.forEach(l => l.classList.toggle("on", onlyLabel ? l === onlyLabel : !!id && (l.dataset.from === id || l.dataset.to === id)));
    }
    function select(id) {
      selected = id;
      const n = byId[id];
      if (n) info.textContent = (n.name || n.id) + (n.desc ? "  —  " + n.desc : "");
      highlight(id);
    }
    stage.addEventListener("click", () => { selected = null; info.textContent = hint; highlight(null); });
    win._focus = id => select(id);

    const ro = new ResizeObserver(draw);
    ro.observe(stage);
    const imgsIn = layer2.querySelectorAll("img");
    imgsIn.forEach(im => im.addEventListener("load", draw));
    const prevClose = win._onClose;
    win._onClose = () => { ro.disconnect(); if (prevClose) prevClose(); };
    requestAnimationFrame(draw);
    return "인물 " + nodes.length + "명 · 관계 " + links.length + "개";
  }

  const BUILD = {
    folder: buildFolder, text: buildText, image: buildImage,
    browser: buildBrowser, music: buildMusic, calendar: buildCalendar,
    typing: buildTyping, stack: buildStack,
    gallery: buildGallery, relation: buildRelation,
  };

  /* ---------------- 6. 알림창 ---------------- */
  //  opt = { title, text, icon, image, width, titleColor, background, textColor, buttons:[...] }
  //  버튼 = { label, image, reply, open, page, link }
  function showDialog(opt, offset) {
    playSound("popup");
    const win = shell({ title: opt.title || "알림", dialog: true });
    const body = bodyOf(win);

    // 창마다 색 바꾸기
    if (opt.titleColor) {
      const tc = Array.isArray(opt.titleColor) ? opt.titleColor : [opt.titleColor, opt.titleColor];
      win.style.setProperty("--title-a1", tc[0]);
      win.style.setProperty("--title-a2", tc[1] || tc[0]);
    }
    if (opt.background) win.style.setProperty("--face", opt.background);
    if (opt.textColor) win.style.color = opt.textColor;

    const showIcon = opt.icon !== "none" && opt.icon !== "";
    body.innerHTML =
      '<div class="dialog-main' + (showIcon ? "" : " no-icon") + '">' +
        (showIcon ? '<div class="dialog-icon">' + iconHTML({ icon: opt.icon || "info" }) + "</div>" : "") +
        '<div class="dialog-content"><div class="dialog-text"></div></div>' +
      "</div>" +
      '<div class="dialog-actions"></div>';
    body.querySelector(".dialog-text").textContent = opt.text || "";
    if (opt.image) {
      const im = el("img", "dialog-img");
      im.alt = "";
      im.src = opt.image;
      body.querySelector(".dialog-content").appendChild(im);
    }

    const actions = body.querySelector(".dialog-actions");
    const buttons = opt.buttons && opt.buttons.length ? opt.buttons : [{ label: opt.button || "확인" }];
    let first = null;
    buttons.forEach(bt => {
      const wrap = el("div", "dialog-choice");
      if (bt.image) {
        const im = el("img", "dialog-choice-img");
        im.alt = "";
        im.src = bt.image;
        wrap.appendChild(im);
      }
      const btn = el("button", "btn bevel-out");
      btn.textContent = bt.label || "확인";
      btn.addEventListener("click", () => {
        closeWin(win);
        runChoice(bt);
      });
      wrap.appendChild(btn);
      actions.appendChild(wrap);
      if (!first) first = btn;
    });

    win._dlgW = opt.width || 340;
    win._center = offset || 0;   // 화면 가운데 기준 (화면 크기가 바뀌면 다시 가운데로)
    centerDialog(win);
    focusWin(win);
    first.focus({ preventScroll: true });
    return win;
  }

  function centerDialog(win) {
    const dw = desktop.clientWidth, dh = desktop.clientHeight;
    const off = win._center;
    win.style.width = Math.max(200, Math.min(win._dlgW, dw - 16)) + "px";
    win.style.left = Math.max(0, (dw - win.offsetWidth) / 2 + off) + "px";
    win.style.top = Math.max(8, (dh - win.offsetHeight) / 2 - 30 + off) + "px";
  }

  // 선택지 버튼을 눌렀을 때
  function runChoice(bt) {
    if (typeof bt.action === "function") bt.action();
    if (bt.reply) {
      const r = typeof bt.reply === "string" ? { text: bt.reply } : bt.reply;
      showDialog(Object.assign({ title: "알림", icon: "info" }, r));
    }
    if (bt.open) openById(bt.open);
    if (bt.link) window.open(bt.link, "_blank", "noopener");
  }

  // 사이트에 들어오면 뜨는 팝업
  function showPopups() {
    (S.popups || []).forEach((p, i) => {
      if (p.show === false) return;
      if (p.once) {
        const key = "oc-popup-" + (p.id || i);
        try {
          if (localStorage.getItem(key)) return;
          localStorage.setItem(key, "1");
        } catch (e) { /* 저장 안 되는 환경이면 그냥 띄움 */ }
      }
      setTimeout(() => showDialog(p, i * 40), (p.delay || 0) + i * 150);
    });
  }

  /* ---------------- 7. 시작 메뉴 ---------------- */
  document.querySelector(".start-logo").innerHTML = iconSVG("heart", theme.startIconColor);

  function renderStartMenu() {
    startList.innerHTML = "";
    const list = (S.startMenu || []).slice();
    const extra = adminMenuItems();   // 관리자 메뉴 (Firebase 연결했을 때만)
    if (extra.length) {
      let at = list.length;
      for (let i = list.length - 1; i >= 0; i--) if (list[i].separator) { at = i; break; }
      list.splice(at, 0, { separator: true }, ...extra);
    }
    list.forEach(m => {
      const li = el("li");
      if (m.separator) {
        li.className = "start-sep";
      } else {
        li.className = "start-item";
        li.innerHTML = '<span class="start-icon">' + iconHTML(m) + '</span><span class="start-text"></span>';
        li.querySelector(".start-text").textContent = m.label || "";
        li.addEventListener("click", e => {
          e.stopPropagation();
          closeStart();
          runMenu(m);
        });
      }
      startList.appendChild(li);
    });
  }

  function runMenu(m) {
    if (typeof m.action === "function") return m.action();
    if (m.reboot || m.shutdown) return boot(false);
    if (m.link) return window.open(m.link, "_blank", "noopener");
    if (m.open) return openById(m.open);
    showDialog({ title: "알림", text: "'" + m.label + "'은(는) 아직 준비 중이에요!" });
  }

  function openStart() { startMenu.classList.remove("hidden"); startBtn.classList.add("pressed"); }
  function closeStart() { startMenu.classList.add("hidden"); startBtn.classList.remove("pressed"); }

  startBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (startMenu.classList.contains("hidden")) openStart(); else closeStart();
  });
  document.addEventListener("click", e => {
    if (!startMenu.contains(e.target)) closeStart();
  });

  /* ---------------- 8. 로딩 화면 ---------------- */
  const bootEl = document.getElementById("boot");
  const bootFill = document.getElementById("boot-fill");
  const bootMsg = document.getElementById("boot-msg");
  const bootClick = document.getElementById("boot-click");
  let bootRun = 0; // 로딩이 겹치지 않게 하는 번호

  (function setupBoot() {
    const L = S.loading || {};
    bootEl.style.backgroundColor = L.background || "#000";
    if (L.backgroundImage) bootEl.style.backgroundImage = 'url("' + L.backgroundImage + '")';
    bootEl.style.color = L.textColor || "#fff";
    if (L.barColor) document.documentElement.style.setProperty("--boot-bar", L.barColor);
    if (L.logo) document.getElementById("boot-logo").src = L.logo;
    document.getElementById("boot-title").textContent = L.title || S.osName || "";
    document.getElementById("boot-sub").textContent = L.subtitle || "";
    bootClick.textContent = L.clickText || "화면을 클릭하면 시작합니다";
  })();

  // auto = true 이면 클릭 없이 바로 바탕화면으로 (처음 접속할 때)
  function boot(auto) {
    const L = S.loading || {};
    const run = ++bootRun;

    // 열린 창 모두 닫기
    closeStart();
    layer.querySelectorAll(".window").forEach(w => closeWin(w));
    cascade = 0;
    clearSelection(iconArea);
    openStartup();   // 로딩 화면 뒤에서 시작 창들을 미리 열어둠

    bootEl.classList.remove("hidden", "fade-out", "ready");
    bootClick.classList.remove("show");
    bootFill.style.width = "0";

    const msgs = L.messages && L.messages.length ? L.messages : ["불러오는 중..."];
    const dur = L.duration || 3000;
    const start = performance.now();

    function frame(now) {
      if (run !== bootRun) return;
      const p = Math.min(1, (now - start) / dur);
      // 12px 블록 단위로 뚝뚝 차오르게
      const full = bootFill.parentElement.clientWidth - 6;
      const blocks = Math.floor((full * p) / 12);
      bootFill.style.width = (p >= 1 ? full : blocks * 12) + "px";
      bootMsg.textContent = msgs[Math.min(msgs.length - 1, Math.floor(p * msgs.length))];
      if (p < 1) requestAnimationFrame(frame);
      else finish();
    }

    function finish() {
      if (auto === true || L.clickToStart === false) return enterDesktop();
      bootEl.classList.add("ready");
      bootClick.classList.add("show");
      const go = () => {
        bootEl.removeEventListener("click", go);
        document.removeEventListener("keydown", go);
        enterDesktop();
      };
      bootEl.addEventListener("click", go);
      document.addEventListener("keydown", go);
    }

    function enterDesktop() {
      if (run !== bootRun) return;
      layoutDesktop();
      relayoutWindows();
      bootEl.classList.add("fade-out");
      setTimeout(() => {
        if (run === bootRun) {
          bootEl.classList.add("hidden");
          playSound("startup");
          showPopups();   // 바탕화면이 보이면 팝업 띄우기
        }
      }, 400);
    }

    requestAnimationFrame(frame);
  }

  /* ---------------- 효과음 ---------------- */
  //  data.js 의 sounds 에 파일 경로를 적으면 그 소리, 비우면 기본 삑삑 소리
  const SND = S.sounds || {};
  let actx = null;
  let muted = false;
  try { muted = localStorage.getItem("oc-muted") === "1"; } catch (e) { /* 무시 */ }

  function audioCtx() {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }

  function tone(c, freq, at, dur, type, vol, slideTo) {
    const t0 = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  // 진짜 마우스 같은 짧은 "딸깍" (잡음을 아주 짧게 터뜨림)
  function clickNoise(c, vol, freq, dur) {
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 1.2;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start();
  }

  function playSound(name) {
    if (SND.enabled === false || muted) return;
    const vol = SND.volume != null ? SND.volume : 0.5;
    const src = SND[name];
    if (src === false) return;                       // 이 소리만 끄기
    if (name === "release" && typeof SND.click === "string" && SND.click) return; // 직접 넣은 클릭 소리엔 뗄 때 소리 없음
    if (typeof src === "string" && src) {           // 직접 넣은 소리 파일
      const a = new Audio(src);
      a.volume = Math.max(0, Math.min(1, vol));
      a.play().catch(() => {});
      return;
    }
    const c = audioCtx();
    if (!c) return;
    if (name === "click") {
      clickNoise(c, vol * 0.9, 3200, 0.012);        // 누를 때 "딸"
    } else if (name === "release") {
      clickNoise(c, vol * 0.45, 4200, 0.008);       // 뗄 때 "깍"
    } else if (name === "open") {
      tone(c, 520, 0, 0.06, "square", vol * 0.1);
      tone(c, 780, 0.06, 0.09, "square", vol * 0.1);
    } else if (name === "popup") {
      tone(c, 880, 0, 0.3, "sine", vol * 0.35);
      tone(c, 1320, 0.09, 0.45, "sine", vol * 0.3);
    } else if (name === "startup") {
      [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.11, 0.5, "triangle", vol * 0.3));
    }
  }

  // 화면 어디든 누르면 딸깍
  document.addEventListener("pointerdown", e => {
    if (e.target.closest("#mute-btn")) return;
    playSound("click");
  }, true);
  document.addEventListener("pointerup", e => {
    if (e.target.closest && e.target.closest("#mute-btn")) return;
    playSound("release");
  }, true);

  // 작업 표시줄 스피커 버튼 (소리 켜기/끄기)
  const muteBtn = document.getElementById("mute-btn");
  function drawMute() {
    let b = px(2, 6, 3, 4, "#000") + px(5, 5, 1, 6, "#000") + px(6, 4, 1, 8, "#000") + px(7, 3, 1, 10, "#000");
    b += muted
      ? px(10, 6, 1, 1, "#d00") + px(11, 7, 1, 1, "#d00") + px(12, 8, 1, 1, "#d00") + px(13, 9, 1, 1, "#d00") +
        px(13, 6, 1, 1, "#d00") + px(12, 7, 1, 1, "#d00") + px(11, 8, 1, 1, "#d00") + px(10, 9, 1, 1, "#d00")
      : px(10, 6, 1, 4, "#555") + px(12, 4, 1, 8, "#555");
    muteBtn.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">' + b + "</svg>";
    muteBtn.title = muted ? "소리 켜기" : "소리 끄기";
  }
  if (SND.enabled === false || SND.showButton === false) muteBtn.style.display = "none";
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    try { localStorage.setItem("oc-muted", muted ? "1" : "0"); } catch (e) { /* 무시 */ }
    drawMute();
    if (!muted) playSound("click");
  });
  drawMute();

  /* ---------------- 9. 시계 ---------------- */
  function tick() {
    const d = new Date();
    let h = d.getHours();
    const ap = h < 12 ? "오전" : "오후";
    h = h % 12 || 12;
    clock.textContent = ap + " " + h + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  tick();
  setInterval(tick, 10000);

  /* ---------------- 11. Firebase (관리자 기능) ----------------
     firebase-config.js 를 채우면 켜져요. 비워두면 이 부분은 아무것도 안 해요.
     저장하는 곳 (Firestore):
       oc_layout / desktop   : 관리자가 옮긴 바탕화면 아이콘 자리 { slots: { 아이콘id: 칸번호 } }
       oc_items  / (자동)     : 관리자가 만든 파일·폴더·바로가기
       oc_diary  / 날짜       : 달력 일기
       oc_reviews / (자동)    : 감상 기록
     그림 파일은 Firebase 에 올리지 않고 나루 images 폴더 경로만 저장해요. */
  const FBC = (typeof FIREBASE_CONFIG !== "undefined") ? FIREBASE_CONFIG : null;
  const FBO = (typeof FIREBASE_OPTIONS !== "undefined") ? FIREBASE_OPTIONS : {};
  const col = name => (FBO.collectionPrefix != null ? FBO.collectionPrefix : "oc_") + name;
  const isAdminEmail = em => {
    const list = (FBO.adminEmails || []).map(x => String(x).trim().toLowerCase()).filter(Boolean);
    return !!em && (!list.length || list.indexOf(String(em).toLowerCase()) !== -1);
  };
  const now = () => firebase.firestore.FieldValue.serverTimestamp();
  const KIND_ICON = { text: "file", image: "image", folder: "folder", link: "browser" };
  const KIND_NAME = { text: "메모장 파일", image: "그림 파일", folder: "폴더", link: "바로가기" };

  // Firestore 문서 → 아이콘 (같은 문서는 같은 객체를 계속 써서 열린 창과 연결 유지)
  function toItem(d) {
    const o = FBS.objs[d._id] || (FBS.objs[d._id] = {});
    const kind = d.kind || "text";
    o.id = "fb-" + d._id;
    o._fb = d._id;
    o._doc = d;
    o.label = d.label || KIND_NAME[kind];
    o.icon = d.icon || KIND_ICON[kind] || "file";
    o.color = d.color || "";
    o.slot = d.slot;
    delete o.link; delete o.open;
    if (kind === "text") {
      o.window = { type: "text", title: o.label + " - 메모장", text: d.text || "", image: d.image || "" };
    } else if (kind === "image") {
      o.window = { type: "image", title: o.label + " - 그림 보기", src: d.src || "", pixel: !!d.pixel };
    } else if (kind === "folder") {
      if (!o.window || o.window.type !== "folder") o.window = { type: "folder", items: [] };
      o.window.title = o.label;
    } else if (kind === "link") {
      delete o.window;
      const u = String(d.url || "").trim();
      if (/^https?:\/\//i.test(u)) o.link = u; else o.open = u;
    }
    return o;
  }

  function fbChildren(parent) {
    const t = x => (x.createdAt && x.createdAt.seconds) || 9e12;
    return FBS.items
      .filter(d => (d.parent || "desktop") === parent)
      .sort((a, b) => t(a) - t(b) || String(a.label).localeCompare(String(b.label)))
      .map(toItem);
  }
  // fb- 아이콘도 openById 로 찾을 수 있게
  const _findById = findById;
  findById = function (id, list) {
    const r = _findById(id, list);
    if (r || !String(id).startsWith("fb-")) return r;
    const d = FBS.items.find(x => "fb-" + x._id === id);
    return d ? toItem(d) : null;
  };

  function refreshAll(desktopToo) {
    if (desktopToo !== false) renderDesktop();
    layer.querySelectorAll(".window").forEach(w => { if (w._refresh) w._refresh(); });
  }

  function fbWarn(msg) {
    let n = document.getElementById("fb-warn");
    if (!n) {
      n = el("div");
      n.id = "fb-warn";
      n.addEventListener("click", () => n.remove());
      document.body.appendChild(n);
    }
    n.textContent = "⚠ " + msg + "  (눌러서 닫기)";
  }
  function toast(msg) {
    const n = el("div", "fb-toast");
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2600);
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = src;
      sc.onload = res;
      sc.onerror = () => rej(new Error(src));
      document.head.appendChild(sc);
    });
  }

  async function initFirebase() {
    if (!FBC || !FBC.apiKey || FBO.enabled === false) return;
    const v = FBO.sdkVersion || "10.12.2";
    try {
      for (const m of ["app", "auth", "firestore"]) {
        await loadScript("https://www.gstatic.com/firebasejs/" + v + "/firebase-" + m + "-compat.js");
      }
      if (!firebase.apps.length) firebase.initializeApp(FBC);
    } catch (e) {
      fbWarn("Firebase 를 불러오지 못했어요. 인터넷 연결이나 firebase-config.js 를 확인해 주세요.");
      return;
    }
    FBS.on = true;
    FBS.db = firebase.firestore();
    FBS.auth = firebase.auth();
    renderStartMenu();

    FBS.auth.onAuthStateChanged(u => {
      FBS.user = u;
      FBS.admin = !!u && isAdminEmail(u.email);
      document.body.classList.toggle("admin-mode", FBS.admin);
      adminBadge.style.display = FBS.admin ? "" : "none";
      renderStartMenu();
      refreshAll();
    });

    const onErr = e => fbWarn("Firebase 읽기 실패: " + (e && e.code === "permission-denied"
      ? "보안 규칙을 확인해 주세요 (firebase-config.js 의 5단계)"
      : (e && e.message) || e));
    FBS.db.collection(col("layout")).doc("desktop").onSnapshot(d => {
      FBS.slots = (d.exists && d.data().slots) || {};
      layoutDesktop();
    }, onErr);
    FBS.db.collection(col("items")).onSnapshot(qs => {
      FBS.items = qs.docs.map(x => Object.assign({ _id: x.id }, x.data()));
      refreshAll();
    }, onErr);
    FBS.db.collection(col("diary")).onSnapshot(qs => {
      const m = {};
      qs.docs.forEach(x => { m[x.id] = Object.assign({}, x.data(), { _fb: x.id }); });
      FBS.diary = m;
      refreshAll(false);
    }, onErr);
    FBS.db.collection(col("reviews")).onSnapshot(qs => {
      FBS.reviews = qs.docs
        .map(x => Object.assign({}, x.data(), { _fb: x.id }))
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      refreshAll(false);
    }, onErr);
  }

  /* ── 관리자 표시 · 메뉴 ── */
  const adminBadge = el("span", "admin-badge", "관리자");
  adminBadge.style.display = "none";
  adminBadge.title = "눌러서 로그아웃";
  adminBadge.addEventListener("click", () => logout());
  document.getElementById("tray").insertBefore(adminBadge, document.getElementById("tray").firstChild);

  // 시계를 더블클릭해도 로그인 창이 열려요 (시작 메뉴에서 로그인 메뉴를 숨겼을 때)
  clock.addEventListener("dblclick", () => { if (FBS.on && !FBS.admin) loginForm(); });

  function adminMenuItems() {
    if (!FBS.on) return [];
    if (!FBS.admin) {
      return FBO.showLoginInStartMenu === false ? [] : [{ label: "관리자 로그인", icon: "power", color: "#808080", action: loginForm }];
    }
    return [
      { label: "새 메모장 파일", icon: "file", action: () => itemForm("text", "desktop") },
      { label: "새 그림 파일", icon: "image", action: () => itemForm("image", "desktop") },
      { label: "새 폴더", icon: "folder", action: () => itemForm("folder", "desktop") },
      { label: "일기 쓰기", icon: "calendar", action: () => diaryForm(null, null) },
      { label: "감상 쓰기", icon: "gallery", action: () => reviewForm(null) },
      { label: "로그아웃", icon: "power", color: "#e02424", action: logout },
    ];
  }

  function logout() {
    if (!FBS.auth) return;
    FBS.auth.signOut().then(() => toast("로그아웃했어요."));
  }

  /* ── 입력 창 (로그인, 새 파일, 일기, 감상 공통) ──
     fields: [{ key, label, type: text|textarea|password|email|date|number|select|color|image, value, options, hint }] */
  function showForm(opt) {
    const win = shell({ title: opt.title, dialog: true });
    win.classList.add("form-win");
    const body = bodyOf(win);
    const form = el("form", "fm");
    form.noValidate = true;
    (opt.fields || []).forEach(f => {
      const row = el("label", "fm-row");
      const lab = el("span", "fm-label");
      lab.textContent = f.label;
      row.appendChild(lab);
      let inp;
      if (f.type === "textarea") {
        inp = el("textarea", "fm-input");
        inp.rows = f.rows || 6;
      } else if (f.type === "select") {
        inp = el("select", "fm-input");
        (f.options || []).forEach(o => {
          const op = el("option");
          op.value = typeof o === "object" ? o.value : o;
          op.textContent = typeof o === "object" ? o.label : o;
          inp.appendChild(op);
        });
      } else {
        inp = el("input", "fm-input");
        inp.type = f.type === "image" ? "text" : (f.type || "text");
        if (f.type === "image") inp.placeholder = "images/파일이름.png";
      }
      inp.name = f.key;
      if (f.value != null) inp.value = f.value;
      if (f.type === "password") inp.autocomplete = "current-password";
      const box = el("span", "fm-field");
      box.appendChild(inp);
      if (f.type === "image") {
        // 나루에 올린 그림이 맞는지 바로 확인할 수 있게 미리보기
        const pv = el("span", "fm-preview");
        const upd = () => {
          const v = inp.value.trim();
          pv.innerHTML = "";
          if (!v) return;
          const im = el("img");
          im.alt = "";
          im.onerror = () => { pv.textContent = "⚠ 그림을 찾을 수 없어요 (나루에 올렸는지, 경로가 맞는지 확인)"; };
          im.src = v;
          pv.appendChild(im);
        };
        inp.addEventListener("change", upd);
        inp.addEventListener("blur", upd);
        box.appendChild(pv);
        setTimeout(upd, 0);
      }
      if (f.hint) {
        const h = el("span", "fm-hint");
        h.textContent = f.hint;
        box.appendChild(h);
      }
      row.appendChild(box);
      form.appendChild(row);
    });
    const err = el("div", "fm-error");
    form.appendChild(err);
    const btns = el("div", "dialog-actions");
    const ok = el("button", "btn bevel-out");
    ok.type = "submit";
    ok.textContent = opt.submit || "저장";
    const cancel = el("button", "btn bevel-out");
    cancel.type = "button";
    cancel.textContent = "취소";
    cancel.addEventListener("click", () => closeWin(win));
    btns.appendChild(ok);
    btns.appendChild(cancel);
    form.appendChild(btns);
    form.addEventListener("submit", e => {
      e.preventDefault();
      const vals = {};
      (opt.fields || []).forEach(f => { vals[f.key] = form.elements[f.key].value; });
      err.textContent = "";
      ok.disabled = cancel.disabled = true;
      ok.textContent = "저장 중…";
      Promise.resolve()
        .then(() => opt.onSubmit(vals))
        .then(() => { closeWin(win); if (opt.done) toast(opt.done); })
        .catch(x => {
          err.textContent = "⚠ " + friendlyError(x);
          ok.disabled = cancel.disabled = false;
          ok.textContent = opt.submit || "저장";
        });
    });
    body.appendChild(form);
    win._dlgW = opt.width || 420;
    win._center = 0;
    centerDialog(win);
    focusWin(win);
    const first = form.querySelector(".fm-input");
    if (first) first.focus({ preventScroll: true });
    return win;
  }

  function friendlyError(x) {
    const c = (x && x.code) || "";
    const map = {
      "auth/invalid-email": "이메일 형식이 이상해요.",
      "auth/user-not-found": "이메일이나 비밀번호가 틀렸어요.",
      "auth/wrong-password": "이메일이나 비밀번호가 틀렸어요.",
      "auth/invalid-credential": "이메일이나 비밀번호가 틀렸어요.",
      "auth/invalid-login-credentials": "이메일이나 비밀번호가 틀렸어요.",
      "auth/too-many-requests": "너무 여러 번 시도했어요. 잠시 후 다시 해 주세요.",
      "auth/network-request-failed": "인터넷 연결을 확인해 주세요.",
      "auth/unauthorized-domain": "이 주소가 Firebase 에 등록되지 않았어요 (firebase-config.js 의 6단계).",
      "permission-denied": "저장 권한이 없어요. 보안 규칙의 관리자 이메일을 확인해 주세요 (firebase-config.js 의 5단계).",
    };
    return map[c] || (x && x.message) || String(x);
  }

  function need(v, what) {
    if (!String(v || "").trim()) throw new Error(what + "을(를) 적어주세요.");
    return String(v).trim();
  }

  function loginForm() {
    if (!FBS.on) return;
    showForm({
      title: "관리자 로그인",
      submit: "로그인",
      width: 360,
      fields: [
        { key: "email", label: "이메일", type: "email" },
        { key: "pw", label: "비밀번호", type: "password" },
      ],
      onSubmit: v => FBS.auth.signInWithEmailAndPassword(need(v.email, "이메일"), v.pw).then(r => {
        if (!isAdminEmail(r.user.email)) {
          FBS.auth.signOut();
          throw new Error("관리자로 등록된 이메일이 아니에요.");
        }
      }),
      done: "관리자 모드! 아이콘을 끌어서 옮기고, 오른쪽 클릭으로 새 파일을 만들 수 있어요.",
    });
  }

  const ICON_OPTIONS = [
    { value: "", label: "(기본)" }, "folder", "file", "image", "gallery", "computer", "browser", "music",
    "calendar", "relation", "person", "keyboard", "pudding", "info", "trash",
  ];

  // 새 파일 / 수정  (kind: text · image · folder · link)
  function itemForm(kind, parent, doc) {
    const d = doc || {};
    const fields = [{ key: "label", label: "이름", value: d.label || "" }];
    if (kind === "text") {
      fields.push({ key: "text", label: "내용", type: "textarea", value: d.text || "", rows: 8 });
      fields.push({ key: "image", label: "글 위 그림", type: "image", value: d.image || "", hint: "선택. 그림은 나루 images 폴더에 먼저 올리고 경로를 적어요." });
    } else if (kind === "image") {
      fields.push({ key: "src", label: "그림 경로", type: "image", value: d.src || "", hint: "그림은 나루 images 폴더에 먼저 올리고 경로를 적어요." });
      fields.push({ key: "pixel", label: "도트 그림", type: "select", value: d.pixel ? "1" : "", options: [{ value: "", label: "아니요" }, { value: "1", label: "예 (흐려지지 않게)" }] });
    } else if (kind === "folder") {
      fields.push({ key: "color", label: "폴더 색", type: "color", value: d.color || "#f7d64a" });
    } else if (kind === "link") {
      fields.push({ key: "url", label: "연결할 곳", value: d.url || "", hint: "https://… 주소면 새 탭으로, mycomputer · char-a 같은 아이콘 id 면 그 창이 열려요." });
    }
    fields.push({ key: "icon", label: "아이콘", type: "select", value: d.icon || "", options: ICON_OPTIONS });

    showForm({
      title: (doc ? "수정 - " : "새 ") + KIND_NAME[kind],
      submit: doc ? "저장" : "만들기",
      fields,
      onSubmit: v => {
        const data = { kind, label: need(v.label, "이름"), icon: v.icon || "" };
        if (kind === "text") { data.text = v.text || ""; data.image = (v.image || "").trim(); }
        if (kind === "image") { data.src = need(v.src, "그림 경로"); data.pixel = !!v.pixel; }
        if (kind === "folder") data.color = v.color || "";
        if (kind === "link") data.url = need(v.url, "연결할 곳");
        const ref = FBS.db.collection(col("items"));
        if (doc) return ref.doc(doc._id).update(data);
        data.parent = parent || "desktop";
        data.createdAt = now();
        if (data.parent === "desktop") data.slot = firstFreeSlot();
        return ref.add(data);
      },
      done: doc ? "저장했어요." : "만들었어요!",
    });
  }

  function firstFreeSlot() {
    const used = new Set(deskIcons.map(d => d.slot));
    let n = 1;
    while (used.has(n)) n++;
    return n;
  }

  function confirmDelete(name, fn) {
    showDialog({
      title: "삭제",
      icon: "warning",
      text: name + "을(를) 삭제할까요?\n되돌릴 수 없어요.",
      buttons: [
        { label: "삭제", action: () => Promise.resolve().then(fn).then(() => toast("삭제했어요.")).catch(x => fbWarn(friendlyError(x))) },
        { label: "취소" },
      ],
    });
  }

  // 폴더면 안에 든 것까지 전부 삭제
  function deleteItem(doc) {
    const ids = [doc._id];
    const walk = pid => FBS.items.filter(x => x.parent === "fb-" + pid).forEach(x => { ids.push(x._id); walk(x._id); });
    walk(doc._id);
    const batch = FBS.db.batch();
    ids.forEach(id => batch.delete(FBS.db.collection(col("items")).doc(id)));
    return batch.commit();
  }

  function diaryForm(date, e) {
    const today = new Date();
    const iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    const d = e || {};
    showForm({
      title: e ? "일기 수정" : "일기 쓰기",
      fields: [
        { key: "date", label: "날짜", type: "date", value: date || iso },
        { key: "mark", label: "표시", value: d.mark || "♥", hint: "달력 날짜에 붙는 기호 (♥ ★ ● 등)" },
        { key: "title", label: "제목", value: d.title || "" },
        { key: "text", label: "내용", type: "textarea", value: d.text || "", rows: 8 },
        { key: "image", label: "그림", type: "image", value: d.image || "", hint: "선택. 나루 images 폴더의 그림 경로" },
      ],
      onSubmit: v => {
        const key = need(v.date, "날짜");
        const data = { mark: v.mark || "●", title: v.title || "", text: v.text || "", image: (v.image || "").trim(), updatedAt: now() };
        const ref = FBS.db.collection(col("diary"));
        const jobs = [ref.doc(key).set(data)];
        if (e && e._fb && e._fb !== key) jobs.push(ref.doc(e._fb).delete());   // 날짜를 바꿨으면 예전 날짜 지우기
        return Promise.all(jobs);
      },
      done: "일기를 저장했어요.",
    });
  }

  function reviewForm(r) {
    const d = r || {};
    const today = new Date();
    const iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    showForm({
      title: r ? "감상 수정" : "새 감상 쓰기",
      width: 460,
      fields: [
        { key: "category", label: "분류", value: d.category || "", hint: "책, 영화, 드라마 … 같은 분류끼리 버튼이 생겨요" },
        { key: "title", label: "제목", value: d.title || "" },
        { key: "creator", label: "작가/감독", value: d.creator || "" },
        { key: "date", label: "날짜", type: "date", value: d.date || iso },
        { key: "rating", label: "별점", type: "select", value: d.rating != null ? String(d.rating) : "5", options: ["5", "4", "3", "2", "1", "0"].map(x => ({ value: x, label: "★★★★★".slice(0, +x) + "☆☆☆☆☆".slice(0, 5 - x) })) },
        { key: "image", label: "표지 그림", type: "image", value: d.image || "", hint: "선택. 나루 images 폴더의 그림 경로" },
        { key: "short", label: "한 줄 감상", value: d.short || "" },
        { key: "text", label: "긴 감상", type: "textarea", value: d.text || "", rows: 7 },
      ],
      onSubmit: v => {
        const data = {
          category: (v.category || "").trim(), title: need(v.title, "제목"), creator: v.creator || "",
          date: v.date || "", rating: Number(v.rating), image: (v.image || "").trim(), short: v.short || "", text: v.text || "",
        };
        const ref = FBS.db.collection(col("reviews"));
        if (r && r._fb) return ref.doc(r._fb).update(data);
        data.createdAt = now();
        return ref.add(data);
      },
      done: "감상을 저장했어요.",
    });
  }

  /* ── 오른쪽 클릭 메뉴 ── */
  let ctxEl = null;
  function closeCtx() { if (ctxEl) { ctxEl.remove(); ctxEl = null; } }
  function showCtx(e, entries) {
    closeCtx();
    ctxEl = el("div", "ctx-menu bevel-out");
    entries.forEach(it => {
      if (it === "-") { ctxEl.appendChild(el("div", "ctx-sep")); return; }
      const row = el("div", "ctx-item" + (it.disabled ? " off" : ""));
      row.textContent = it.label;
      if (!it.disabled) row.addEventListener("click", ev => { ev.stopPropagation(); closeCtx(); it.run(); });
      ctxEl.appendChild(row);
    });
    document.body.appendChild(ctxEl);
    const x = Math.min(e.clientX, window.innerWidth - ctxEl.offsetWidth - 4);
    const y = Math.min(e.clientY, window.innerHeight - ctxEl.offsetHeight - 4);
    ctxEl.style.left = x + "px";
    ctxEl.style.top = y + "px";
  }
  document.addEventListener("pointerdown", e => { if (ctxEl && !ctxEl.contains(e.target)) closeCtx(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCtx(); });

  function newMenu(e, parent) {
    const list = [
      { label: "새 메모장 파일", run: () => itemForm("text", parent) },
      { label: "새 그림 파일", run: () => itemForm("image", parent) },
      { label: "새 폴더", run: () => itemForm("folder", parent) },
      { label: "새 바로가기", run: () => itemForm("link", parent) },
    ];
    if (parent === "desktop") {
      list.push("-");
      list.push({ label: "일기 쓰기", run: () => diaryForm(null, null) });
      list.push({ label: "감상 쓰기", run: () => reviewForm(null) });
      list.push("-");
      list.push({
        label: "아이콘 자리 처음대로",
        run: () => confirmDelete("옮긴 아이콘 자리 기록", () => FBS.db.collection(col("layout")).doc("desktop").set({ slots: {} })),
      });
    }
    showCtx(e, list);
  }

  function iconMenu(e, item) {
    const list = [{ label: "열기", run: () => openItem(item) }];
    if (item._fb) {
      const d = item._doc;
      list.push("-");
      list.push({ label: "수정…", run: () => itemForm(d.kind || "text", d.parent, d) });
      list.push({ label: "삭제", run: () => confirmDelete("'" + item.label + "'" + (d.kind === "folder" ? " 폴더와 안의 파일" : ""), () => deleteItem(d)) });
    } else {
      list.push({ label: "(data.js · characters.js 에 있는 아이콘은 파일에서 수정해요)", disabled: true, run: () => {} });
    }
    showCtx(e, list);
  }

  desktop.addEventListener("contextmenu", e => {
    if (!FBS.admin) return;
    if (e.target === desktop || e.target === iconArea || e.target.classList.contains("grid-cell")) {
      e.preventDefault();
      newMenu(e, "desktop");
    }
  });

  /* ── 바탕화면 아이콘 끌어서 옮기기 (관리자만) ──
     놓은 곳에서 아이콘이 가장 많이 겹친 칸으로 들어가요.
     (칸과 아이콘 크기가 같으니, 아이콘 한가운데가 들어간 칸이 가장 많이 겹친 칸이에요)
     그 칸에 다른 아이콘이 있으면 서로 자리를 바꿔요. */
  function targetSlot(icon) {
    const cols = Math.max(1, Math.floor(iconArea.clientWidth / CELL_W));
    const cx = icon.offsetLeft + CELL_W / 2, cy = icon.offsetTop + cellH / 2;
    const c = Math.max(0, Math.min(cols - 1, Math.floor(cx / CELL_W)));
    const r = Math.max(0, Math.min(ROWS - 1, Math.floor(cy / cellH)));
    return { c, r, slot: c * ROWS + r + 1 };
  }

  function enableIconDrag(icon, item) {
    icon.addEventListener("pointerdown", e => {
      if (!FBS.admin || e.button !== 0) return;
      const d = deskIcons.find(x => x.icon === icon);
      if (!d) return;
      const sx = e.clientX, sy = e.clientY, ox = icon.offsetLeft, oy = icon.offsetTop;
      let moving = false;
      const ghost = el("div", "drop-target");
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moving && Math.hypot(dx, dy) < 5) return;
        if (!moving) {
          moving = true;
          icon.classList.add("dragging");
          iconArea.appendChild(ghost);
        }
        icon.style.left = ox + dx + "px";
        icon.style.top = oy + dy + "px";
        const t = targetSlot(icon);
        ghost.style.left = t.c * CELL_W + "px";
        ghost.style.top = t.r * cellH + "px";
        ghost.style.width = CELL_W - 2 + "px";
        ghost.style.height = cellH - 2 + "px";
        ghost.textContent = t.slot;
      };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        if (!moving) return;
        icon._dragged = true;
        setTimeout(() => { icon._dragged = false; }, 350);
        icon.classList.remove("dragging");
        ghost.remove();
        moveIconTo(d, targetSlot(icon).slot);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });
  }

  function moveIconTo(d, slot) {
    if (slot === d.slot) { layoutDesktop(); return; }
    const updates = {};
    updates[d.item.id] = slot;
    const other = deskIcons.find(x => x !== d && x.slot === slot);
    if (other) updates[other.item.id] = d.slot;   // 자리 바꾸기
    Object.assign(FBS.slots, updates);
    layoutDesktop();
    FBS.db.collection(col("layout")).doc("desktop").set({ slots: updates }, { merge: true })
      .catch(x => fbWarn("자리 저장 실패: " + friendlyError(x)));
  }

  renderStartMenu();
  initFirebase();

  /* ---------------- 10. 처음 들어오면 로딩 화면부터 (자동 진행) ---------------- */
  boot(true);
})();

// 사이트가 켜진 뒤에 data.js 값 때문에 생긴 오류는 작은 알림으로 (한 번만)
window.addEventListener("error", function (e) {
  if (window.__dataBroken || window.__runtimeWarned) return;
  window.__runtimeWarned = true;
  const n = document.createElement("div");
  n.id = "runtime-warn";
  n.textContent = "⚠ 설정 값에 이상한 부분이 있어요: " + (e.message || "") + "  (data.js 에서 방금 고친 부분을 확인해 주세요)";
  n.addEventListener("click", () => n.remove());
  document.body.appendChild(n);
});
