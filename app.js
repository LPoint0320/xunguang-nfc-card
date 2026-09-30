/* =====================================================================
   讯光 · NFC 文创卡 —— 页面交互
   1) 滚动入场动画
   2) 声音：首句朗读（不再自动播放，必须点一下）
   3) 智能小助手：拖动 / 点一下开菜单（含换形象、换音色）/ 再点一下收起 / 长按对话 / 定时提示
   4) 访问信息与复制链接
   ===================================================================== */

(function () {
  'use strict';

  /* ============ 可调参数（想改默认值改这里） ============ */
  var BUDDY_SVG = {
  "wave": "<svg class=\"bd-svg bd-wave\" viewBox=\"0 0 96 96\" aria-hidden=\"true\">\n  <defs>\n    <linearGradient id=\"bdWave\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#63C3EA\"/><stop offset=\"100%\" stop-color=\"#0B5FA5\"/>\n    </linearGradient>\n  </defs>\n  <g class=\"bd-arc\" fill=\"none\" stroke=\"#2C9BD6\" stroke-width=\"3.4\" stroke-linecap=\"round\">\n    <path d=\"M20 34a30 30 0 0 1 0 26\"/>\n    <path d=\"M76 34a30 30 0 0 0 0 26\"/>\n  </g>\n  <ellipse cx=\"48\" cy=\"56\" rx=\"25\" ry=\"23\" fill=\"url(#bdWave) #4FA9D8\"/>\n  <ellipse cx=\"38\" cy=\"44\" rx=\"10\" ry=\"6\" fill=\"#fff\" opacity=\".25\" transform=\"rotate(-22 38 44)\"/>\n  <g class=\"bd-eyes\" fill=\"#fff\">\n    <ellipse cx=\"39\" cy=\"54\" rx=\"6.4\" ry=\"7.2\"/>\n    <ellipse cx=\"57\" cy=\"54\" rx=\"6.4\" ry=\"7.2\"/>\n  </g>\n  <g fill=\"#123A5E\">\n    <circle cx=\"39.6\" cy=\"55\" r=\"3.1\"/><circle cx=\"57.6\" cy=\"55\" r=\"3.1\"/>\n  </g>\n  <path d=\"M42 66q6 5 12 0\" fill=\"none\" stroke=\"#123A5E\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>\n  <circle cx=\"30\" cy=\"62\" r=\"3.4\" fill=\"#FFB7B7\" opacity=\".9\"/>\n  <circle cx=\"66\" cy=\"62\" r=\"3.4\" fill=\"#FFB7B7\" opacity=\".9\"/>\n</svg>",
  "spark": "<svg class=\"bd-svg bd-spark\" viewBox=\"0 0 96 96\" aria-hidden=\"true\">\n  <defs>\n    <linearGradient id=\"bdSparkA\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#2C9BD6\"/><stop offset=\"100%\" stop-color=\"#0B5FA5\"/>\n    </linearGradient>\n    <radialGradient id=\"bdSparkB\">\n      <stop offset=\"0%\" stop-color=\"#FFE7A6\"/><stop offset=\"100%\" stop-color=\"#C6A14A\"/>\n    </radialGradient>\n  </defs>\n  <g class=\"bd-spin\">\n    <path d=\"M48 8C52 34 62 44 88 48 62 52 52 62 48 88 44 62 34 52 8 48 34 44 44 34 48 8Z\"\n          fill=\"url(#bdSparkA) #2C9BD6\"/>\n  </g>\n  <circle cx=\"48\" cy=\"48\" r=\"17\" fill=\"url(#bdSparkB) #F0C765\" opacity=\".95\"/>\n  <g class=\"bd-eyes\" fill=\"#123A5E\">\n    <ellipse cx=\"42\" cy=\"47\" rx=\"3\" ry=\"3.6\"/>\n    <ellipse cx=\"54\" cy=\"47\" rx=\"3\" ry=\"3.6\"/>\n  </g>\n  <path d=\"M43 55q5 4 10 0\" fill=\"none\" stroke=\"#123A5E\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>\n  <circle class=\"bd-sat\" cx=\"48\" cy=\"14\" r=\"3.4\" fill=\"#2C9BD6\"/>\n  <circle class=\"bd-sat2\" cx=\"82\" cy=\"64\" r=\"2.6\" fill=\"#C6A14A\"/>\n</svg>",
  "bot": "<svg class=\"bd-svg bd-bot\" viewBox=\"0 0 96 96\" aria-hidden=\"true\">\n  <line x1=\"48\" y1=\"20\" x2=\"48\" y2=\"31\" stroke=\"#0B5FA5\" stroke-width=\"3.2\"/>\n  <circle class=\"bd-blink\" cx=\"48\" cy=\"15\" r=\"5.4\" fill=\"#C6A14A\"/>\n  <rect x=\"19\" y=\"30\" width=\"58\" height=\"48\" rx=\"17\" fill=\"#FFFFFF\" stroke=\"#0B5FA5\" stroke-width=\"3.6\"/>\n  <rect x=\"27\" y=\"40\" width=\"42\" height=\"26\" rx=\"11\" fill=\"#E7F3FA\"/>\n  <g class=\"bd-eyes\" fill=\"#0B5FA5\">\n    <ellipse cx=\"40\" cy=\"52\" rx=\"5.4\" ry=\"6.4\"/>\n    <ellipse cx=\"56\" cy=\"52\" rx=\"5.4\" ry=\"6.4\"/>\n  </g>\n  <g stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\".9\">\n    <path d=\"M40 50v4\"/><path d=\"M56 50v4\"/>\n  </g>\n  <g class=\"bd-nfc\" fill=\"none\" stroke=\"#2C9BD6\" stroke-width=\"2.6\" stroke-linecap=\"round\">\n    <path d=\"M42 70a11 11 0 0 1 0 0\"/>\n    <path d=\"M36 74a14 14 0 0 1 0-12\"/>\n    <path d=\"M60 74a14 14 0 0 0 0-12\"/>\n  </g>\n  <circle cx=\"30\" cy=\"63\" r=\"3\" fill=\"#FFB7B7\" opacity=\".85\"/>\n  <circle cx=\"66\" cy=\"63\" r=\"3\" fill=\"#FFB7B7\" opacity=\".85\"/>\n</svg>",
  "card": "<svg class=\"bd-svg bd-card\" viewBox=\"0 0 96 96\" aria-hidden=\"true\">\n  <g class=\"bd-wings\" fill=\"#CFE7F6\">\n    <path d=\"M22 44q-12-8-16 2 8 8 16 6z\"/>\n    <path d=\"M74 44q12-8 16 2-8 8-16 6z\"/>\n  </g>\n  <rect x=\"24\" y=\"32\" width=\"48\" height=\"34\" rx=\"10\" fill=\"#FFFFFF\" stroke=\"#C6A14A\" stroke-width=\"3.2\"/>\n  <g class=\"bd-eyes\" fill=\"#0B5FA5\">\n    <ellipse cx=\"41\" cy=\"47\" rx=\"4.2\" ry=\"5\"/>\n    <ellipse cx=\"57\" cy=\"47\" rx=\"4.2\" ry=\"5\"/>\n  </g>\n  <path d=\"M43 56q5 4 10 0\" fill=\"none\" stroke=\"#0B5FA5\" stroke-width=\"2.3\" stroke-linecap=\"round\"/>\n  <circle cx=\"33\" cy=\"55\" r=\"2.8\" fill=\"#FFB7B7\" opacity=\".85\"/>\n  <circle cx=\"65\" cy=\"55\" r=\"2.8\" fill=\"#FFB7B7\" opacity=\".85\"/>\n  <g class=\"bd-nfc\" fill=\"none\" stroke=\"#2C9BD6\" stroke-width=\"2.5\" stroke-linecap=\"round\">\n    <path d=\"M78 40a16 16 0 0 1 0 20\"/>\n    <path d=\"M85 34a25 25 0 0 1 0 32\"/>\n  </g>\n</svg>"
};

  var STYLES = [
    { key: 'spark', name: '星火' },
    { key: 'bot', name: '机器人' },
    { key: 'card', name: '卡片' }
  ];
  var VOICES = [
    { key: 'yunxia', name: '童声' },
    { key: 'xiaoyi', name: '少女' },
    { key: 'yunxi', name: '少年' }
  ];
  var DEFAULT_STYLE = 'bot';
  var DEFAULT_VOICE = 'yunxia';

  // 定时提示的文案（想留哪几条就删掉不需要的）
  var HINTS = [
    '点我一下，我能带你跳到你想去的地方。',
    '长按我，就能和我说话——这个功能正在接入中。',
    '按住我可以拖动，把我放到顺手的位置。',
    '在我这里还能换形象、换声音。'
  ];

  var HOOK_CLIP = 'line01';
  var HOOK_TEXT = '这是一张可以用手机碰开的文创卡。';

  /* ---------------------------------------------------- 1. 入场动画 */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------- 2. 设置存取 */
  var LS_STYLE = 'buddy_style';
  var LS_VOICE = 'buddy_voice';

  function load(key, fallback, allowed) {
    var v = null;
    try { v = window.localStorage.getItem(key); } catch (e) {}
    for (var i = 0; i < allowed.length; i++) {
      if (allowed[i].key === v) return v;
    }
    return fallback;
  }
  function save(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) {}
  }

  var styleKey = load(LS_STYLE, DEFAULT_STYLE, STYLES);
  var voiceKey = load(LS_VOICE, DEFAULT_VOICE, VOICES);

  function clipURL(clip) { return 'assets/voice/' + voiceKey + '/' + clip + '.mp3'; }

  /* ---------------------------------------------------- 3. 首句朗读 */
  var heroBtn = document.getElementById('tts-btn');
  var heroLabel = document.getElementById('tts-label');
  var heroVoice = document.getElementById('hero-voice');
  var heroVoiceText = document.getElementById('hero-voice-text');
  var heroMore = document.getElementById('hero-more');
  var hook = document.getElementById('voice-audio');
  var navAudio = new Audio();
  navAudio.preload = 'auto';

  function heroState(s) {
    if (!heroLabel) return;
    heroLabel.textContent = (s === 'playing') ? '正在朗读…'
      : (s === 'paused') ? '继续听'
      : (s === 'done') ? '再听一遍' : '点一下，听它开口';
    if (heroBtn) heroBtn.classList.toggle('is-playing', s === 'playing');
  }

  function cap(on, text) {
    if (!heroVoice) return;
    heroVoice.hidden = !on;
    if (on && heroVoiceText) heroVoiceText.textContent = text || '';
  }

  function stopAll() {
    try { navAudio.pause(); } catch (e) {}
    if (hook && !hook.paused) hook.pause();
    cap(false);
    if (hook) heroState('idle');
  }

  function playHook() {
    if (!hook) return;
    try { navAudio.pause(); } catch (e) {}
    hook.src = clipURL(HOOK_CLIP);
    hook.currentTime = 0;
    cap(true, HOOK_TEXT);
    heroState('playing');
    if (heroMore) heroMore.hidden = true;
    var p = hook.play();
    if (p && p.catch) p.catch(function () {
      cap(false);
      heroState('idle');
    });
  }

  if (hook) {
    hook.src = clipURL(HOOK_CLIP);
    hook.addEventListener('ended', function () {
      cap(false);
      heroState('done');
      if (heroMore) heroMore.hidden = false;
    });
    // 不再自动播放：进页面只显示提示，等用户点
    heroState('idle');
  }

  if (heroBtn) {
    heroBtn.addEventListener('click', function () {
      if (!hook) return;
      if (!hook.paused) {
        hook.pause();
        cap(false);
        heroState('paused');
        return;
      }
      if (hook.currentTime > 0.2 && hook.duration && hook.currentTime < hook.duration) {
        cap(true, HOOK_TEXT);
        heroState('playing');
        var pr = hook.play();
        if (pr && pr.catch) pr.catch(function () {});
        return;
      }
      playHook();
    });
  }

  /* ---------------------------------------------------- 4. 智能小助手 */
  var wrap = document.getElementById('buddy-wrap');
  var buddy = document.getElementById('buddy');
  var menu = document.getElementById('buddy-menu');
  var bubble = document.getElementById('buddy-bubble');
  var styleRow = document.getElementById('buddy-styles');
  var voiceRow = document.getElementById('buddy-voices');

  var pressTimer = null;
  var longPressed = false;
  var bubbleTimer = null;
  var lastTouch = 0;
  var hintIdx = 0;
  var dragging = false;
  var POS_KEY = 'buddy_pos';

  var uidSeq = 0;

  // 把 SVG 里的 id 与 url(#id) 都加上唯一后缀：
  // 同一份 SVG 会在浮窗和缩略图里各出现一次，重名会让 url(#id) 指向已经被销毁的定义，
  // 填充解析失败时浏览器会直接不画，表现就是"图形变透明"。
  function inlineSvg(svgText) {
    uidSeq += 1;
    var suffix = '_u' + uidSeq;
    return svgText
      .replace(/id="([^"]+)"/g, function (m, id) { return 'id="' + id + suffix + '"'; })
      .replace(/url\(#([^)]+)\)/g, function (m, id) { return 'url(#' + id + suffix + ')'; });
  }

  function renderBuddy() {
    if (buddy && BUDDY_SVG[styleKey]) buddy.innerHTML = inlineSvg(BUDDY_SVG[styleKey]);
  }

  function renderSwitchers() {
    if (styleRow) {
      styleRow.innerHTML = '';
      STYLES.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bm-chip' + (s.key === styleKey ? ' is-on' : '');
        b.setAttribute('data-style', s.key);
        b.title = s.name;
        b.setAttribute('aria-label', '换成' + s.name + '形象');
        b.innerHTML = '<span class="bm-thumb">' + inlineSvg(BUDDY_SVG[s.key]) + '</span>';
        styleRow.appendChild(b);
      });
    }
    if (voiceRow) {
      voiceRow.innerHTML = '';
      VOICES.forEach(function (v) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bm-chip bm-chip-text' + (v.key === voiceKey ? ' is-on' : '');
        b.setAttribute('data-voice', v.key);
        b.textContent = v.name;
        voiceRow.appendChild(b);
      });
    }
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function place(x, y, snap) {
    var bw = wrap.offsetWidth || 76;
    var m = 14;
    var maxX = Math.max(m, window.innerWidth - bw - m);
    var maxY = Math.max(m, window.innerHeight - bw - m);
    x = clamp(x, m, maxX);
    y = clamp(y, m, maxY);
    if (snap) x = (x + bw / 2 < window.innerWidth / 2) ? m : maxX;
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
    wrap.classList.toggle('on-left', x + bw / 2 < window.innerWidth / 2);
    return { x: x, y: y };
  }

  function say(text, clip, keep) {
    if (bubble) {
      bubble.textContent = text;
      bubble.hidden = false;
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () { bubble.hidden = true; }, keep || 5200);
    }
    if (buddy) {
      buddy.classList.add('is-speaking');
      window.clearTimeout(buddy._spk);
      buddy._spk = window.setTimeout(function () { buddy.classList.remove('is-speaking'); }, 2200);
    }
    if (clip) {
      if (hook && !hook.paused) { hook.pause(); cap(false); heroState('idle'); }
      navAudio.src = clipURL(clip);
      var p = navAudio.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  function closeMenu() {
    if (menu) menu.hidden = true;
    if (buddy) buddy.classList.remove('is-calling');
  }
  function openMenu() {
    if (menu) menu.hidden = false;
    if (buddy) buddy.classList.add('is-calling');
  }

  if (wrap && buddy) {
    renderBuddy();
    renderSwitchers();

    var saved = null;
    try { saved = window.localStorage.getItem(POS_KEY); } catch (e) {}
    if (saved) {
      var parts = saved.split(',');
      var sx = parseFloat(parts[0]), sy = parseFloat(parts[1]);
      if (isFinite(sx) && isFinite(sy)) place(sx, sy, false);
    }

    window.addEventListener('resize', function () {
      var r = wrap.getBoundingClientRect();
      place(r.left, r.top, false);
    });

    var startX = 0, startY = 0, offX = 0, offY = 0, downAt = 0;

    buddy.addEventListener('pointerdown', function (ev) {
      if (ev.button !== undefined && ev.button !== 0) return;
      dragging = true;
      movedReset();
      lastTouch = Date.now();
      var r = wrap.getBoundingClientRect();
      startX = ev.clientX; startY = ev.clientY;
      offX = ev.clientX - r.left; offY = ev.clientY - r.top;
      downAt = Date.now();
      try { buddy.setPointerCapture(ev.pointerId); } catch (e) {}
      window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(function () {
        if (!dragging || moved) return;
        longPressed = true;
        closeMenu();
        say('按住我，就能和我说话——对话功能正在接入，先点一下试试我都能做什么。', '');
      }, 650);
    });

    var moved = false;
    function movedReset() { moved = false; }

    buddy.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = Math.abs(ev.clientX - startX);
      var dy = Math.abs(ev.clientY - startY);
      if (!moved && dx + dy > 8) {
        moved = true;
        window.clearTimeout(pressTimer);
        closeMenu();
        wrap.classList.add('is-dragging');
      }
      if (moved) place(ev.clientX - offX, ev.clientY - offY, false);
    });

    function endPress() {
      if (!dragging) return;
      dragging = false;
      window.clearTimeout(pressTimer);
      wrap.classList.remove('is-dragging');
      lastTouch = Date.now();
      if (moved) {
        var r = wrap.getBoundingClientRect();
        var p2 = place(r.left, r.top, true);
        try { window.localStorage.setItem(POS_KEY, p2.x + ',' + p2.y); } catch (e) {}
        return;
      }
      if (longPressed) return;
      if (Date.now() - downAt < 650) {
        buddy.classList.add('is-pop');
        window.setTimeout(function () { buddy.classList.remove('is-pop'); }, 360);
        if (menu && menu.hidden) { openMenu(); } else { closeMenu(); }
      }
    }

    buddy.addEventListener('pointerup', endPress);
    buddy.addEventListener('pointercancel', endPress);

    buddy.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        lastTouch = Date.now();
        if (menu && menu.hidden) { openMenu(); } else { closeMenu(); }
      }
      if (ev.key === 'Escape') closeMenu();
    });

    if (menu) {
      menu.addEventListener('click', function (ev) {
        var el = ev.target;
        lastTouch = Date.now();

        var styleBtn = el.closest ? el.closest('[data-style]') : null;
        if (styleBtn) {
          styleKey = styleBtn.getAttribute('data-style');
          save(LS_STYLE, styleKey);
          renderBuddy();
          renderSwitchers();
          buddy.classList.add('is-pop');
          window.setTimeout(function () { buddy.classList.remove('is-pop'); }, 360);
          say('形象换成「' + styleBtn.title + '」了。', '');
          return;
        }

        var voiceBtn = el.closest ? el.closest('[data-voice]') : null;
        if (voiceBtn) {
          voiceKey = voiceBtn.getAttribute('data-voice');
          save(LS_VOICE, voiceKey);
          renderSwitchers();
          var nm = voiceBtn.textContent;
          say('声音换成「' + nm + '」了，听一下。', '');
          window.setTimeout(function () { playHook(); }, 700);
          return;
        }

        var cmd = el.closest ? el.closest('[data-go],[data-clip]') : null;
        if (cmd) {
          var go = cmd.getAttribute('data-go');
          var clip = cmd.getAttribute('data-clip');
          var text = cmd.getAttribute('data-text') || '';
          closeMenu();
          if (go) {
            var target = document.querySelector(go);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          if (clip || text) say(text, clip);
        }
      });

      document.addEventListener('pointerdown', function (ev) {
        if (menu.hidden) return;
        if (wrap.contains(ev.target)) return;
        closeMenu();
      });
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeMenu();
    });

    // 定时轮换提示：菜单开着、拖动中、刚操作过都不打扰
    window.setInterval(function () {
      if (document.hidden) return;
      if (menu && !menu.hidden) return;
      if (dragging) return;
      if (Date.now() - lastTouch < 15000) return;
      if (bubble && !bubble.hidden) return;
      say(HINTS[hintIdx % HINTS.length], '', 6500);
      hintIdx++;
    }, 30000);
  }

  /* ---------------------------------------------------- 5. 页面信息 */
  var originLine = document.getElementById('origin-line');
  if (originLine) originLine.textContent = location.origin + location.pathname;

  var visitLine = document.getElementById('visit-line');
  if (visitLine) {
    var VKEY = 'nfc_card_visits';
    var n = 0;
    try {
      n = parseInt(window.localStorage.getItem(VKEY) || '0', 10) || 0;
      n += 1;
      window.localStorage.setItem(VKEY, String(n));
    } catch (err) {
      n = 1;
    }
    visitLine.textContent = '第 ' + n + ' 次（记录在手机浏览器本地，仅用于演示）';
  }

  var copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = location.href;
      var done = function () {
        var old = copyBtn.textContent;
        copyBtn.textContent = '已复制';
        window.setTimeout(function () { copyBtn.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

})();
