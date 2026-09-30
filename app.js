/* =====================================================================
   NFC 文创卡 —— 页面交互
   1) 滚动入场动画
   2) 声音体验：播放音频文件，逐句高亮（不依赖浏览器语音接口，微信/夸克/百度都能放）
   3) 访问信息 / 分享 / 复制链接
   ===================================================================== */

(function () {
  'use strict';

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

  /* ---------------------------------------------------- 2. 声音体验 */
  var listEl = document.getElementById('voice-lines');
  var lines = listEl ? [].slice.call(listEl.querySelectorAll('li')) : [];
  var clips = lines.map(function (li) { return li.getAttribute('data-src'); });

  var audio = document.getElementById('voice-audio');
  var heroBtn = document.getElementById('tts-btn');
  var heroLabel = document.getElementById('tts-label');
  var heroVoice = document.getElementById('hero-voice');
  var heroVoiceText = document.getElementById('hero-voice-text');
  var heroMore = document.getElementById('hero-more');
  var playBtn = document.getElementById('voice-play');
  var playLabel = document.getElementById('voice-play-label');
  var speedBtns = [].slice.call(document.querySelectorAll('.speed button'));

  var current = -1;
  var mode = null;       // 'hook' = 只念第一句；'all' = 念完整段
  var rate = 1;
  var paused = false;

  function mark(i) {
    for (var k = 0; k < lines.length; k++) {
      lines[k].classList.toggle('is-on', k === i);
    }
  }

  function setHeroVoice(on, text) {
    if (!heroVoice) return;
    if (on) {
      heroVoice.hidden = false;
      if (heroVoiceText && text) heroVoiceText.textContent = text;
    } else {
      heroVoice.hidden = true;
    }
  }

  function setLabels(state) {
    // state: 'idle' | 'playing' | 'paused' | 'done' | 'blocked'
    if (heroLabel) {
      heroLabel.textContent =
        state === 'playing' ? '正在朗读…' :
        state === 'paused' ? '继续听' :
        state === 'done' ? '再听一遍' :
        '点一下，听它开口';
    }
    if (playLabel) {
      playLabel.textContent =
        state === 'playing' ? '暂停' :
        state === 'paused' ? '继续播放' :
        state === 'done' ? '再听一遍' :
        '播放全部';
    }
    if (playBtn) playBtn.classList.toggle('is-playing', state === 'playing');
    if (heroBtn) heroBtn.classList.toggle('is-playing', state === 'playing');
  }

  function onBlocked() {
    paused = false;
    current = -1;
    mark(-1);
    setHeroVoice(false);
    setLabels('blocked');
    if (heroBtn) heroBtn.classList.add('is-calling');
    if (playLabel) playLabel.textContent = '播放全部';
  }

  function playFrom(i, playAll) {
    if (!audio || !clips.length || i >= clips.length) return;
    current = i;
    mode = playAll ? 'all' : 'hook';
    paused = false;
    audio.src = clips[i];
    audio.playbackRate = rate;
    mark(i);
    setHeroVoice(true, lines[i] ? lines[i].textContent.trim() : '正在朗读…');
    setLabels('playing');
    if (heroMore) heroMore.hidden = true;

    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { onBlocked(); });
    }
  }

  function pauseIt() {
    if (!audio) return;
    audio.pause();
    paused = true;
    setHeroVoice(false);
    setLabels('paused');
  }

  function resumeIt() {
    if (!audio) return;
    paused = false;
    audio.playbackRate = rate;
    setHeroVoice(true, lines[current] ? lines[current].textContent.trim() : '正在朗读…');
    setLabels('playing');
    var p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(function () { onBlocked(); });
  }

  function finishIt() {
    mark(-1);
    setHeroVoice(false);
    setLabels('done');
    if (mode === 'hook' && heroMore) heroMore.hidden = false;
    current = -1;
    mode = null;
  }

  if (audio && clips.length) {
    audio.onended = function () {
      if (mode === 'all' && current >= 0 && current < clips.length - 1) {
        playFrom(current + 1, true);
      } else {
        finishIt();
      }
    };

    // 进页面自动尝试念第一句：能自动就自动，被浏览器拦下就退成"点一下"
    var auto = audio.play();
    if (auto && typeof auto.catch === 'function') {
      auto.catch(function () { onBlocked(); });
    }
    window.setTimeout(function () {
      if (audio.paused && !paused) onBlocked();
    }, 700);
  } else {
    setLabels('blocked');
  }

  if (heroBtn) {
    heroBtn.addEventListener('click', function () {
      heroBtn.classList.remove('is-calling');
      if (!audio) return;
      if (!audio.paused) { pauseIt(); return; }
      if (paused && current >= 0 && mode === 'hook') { resumeIt(); return; }
      playFrom(0, false);   // 只念第一句，四秒多
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (!audio) return;
      if (!audio.paused) { pauseIt(); return; }
      if (paused && current >= 0) { resumeIt(); return; }
      playFrom(0, true);    // 完整七句
    });
  }

  speedBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      rate = parseFloat(b.getAttribute('data-rate')) || 1;
      speedBtns.forEach(function (x) { x.classList.toggle('is-on', x === b); });
      if (audio && !audio.paused) audio.playbackRate = rate;
    });
  });

  /* ---------------------------------------------------- 3. 页面信息 */
  var originLine = document.getElementById('origin-line');
  if (originLine) originLine.textContent = location.origin + location.pathname;

  var visitLine = document.getElementById('visit-line');
  if (visitLine) {
    var KEY = 'nfc_card_visits';
    var n = 0;
    try {
      n = parseInt(window.localStorage.getItem(KEY) || '0', 10) || 0;
      n += 1;
      window.localStorage.setItem(KEY, String(n));
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

  /* ---------------------------------------------------- 4. 浮窗导览员 */
  var wrap = document.getElementById('buddy-wrap');
  var buddy = document.getElementById('buddy');
  var menu = document.getElementById('buddy-menu');
  var bubble = document.getElementById('buddy-bubble');
  var navAudio = new Audio();
  var bubbleTimer = null;
  var POS_KEY = 'buddy_pos';
  var BW = 76;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function place(x, y, snap) {
    var m = 14;
    var maxX = Math.max(m, window.innerWidth - BW - m);
    var maxY = Math.max(m, window.innerHeight - BW - m);
    x = clamp(x, m, maxX);
    y = clamp(y, m, maxY);
    if (snap) x = (x + BW / 2 < window.innerWidth / 2) ? m : maxX;
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
    wrap.classList.toggle('on-left', x + BW / 2 < window.innerWidth / 2);
    return { x: x, y: y };
  }

  function save(x, y) {
    try { window.localStorage.setItem(POS_KEY, x + ',' + y); } catch (e) {}
  }

  function say(text, src) {
    if (bubble) {
      bubble.textContent = text;
      bubble.hidden = false;
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () { bubble.hidden = true; }, 5200);
    }
    if (buddy) {
      buddy.classList.add('is-speaking');
      window.setTimeout(function () { buddy.classList.remove('is-speaking'); }, 2000);
    }
    if (src) {
      navAudio.src = src;
      var pr = navAudio.play();
      if (pr && pr.catch) pr.catch(function () {});
    }
  }

  function closeMenu() {
    if (menu) menu.hidden = true;
    if (buddy) buddy.classList.remove('is-calling');
  }

  if (wrap && buddy) {
    BW = wrap.offsetWidth || 76;

    // 恢复上次的位置
    var saved = null;
    try { saved = window.localStorage.getItem(POS_KEY); } catch (e) {}
    if (saved) {
      var parts = saved.split(',');
      var sx = parseFloat(parts[0]);
      var sy = parseFloat(parts[1]);
      if (isFinite(sx) && isFinite(sy)) place(sx, sy, false);
    }

    window.addEventListener('resize', function () {
      var r = wrap.getBoundingClientRect();
      place(r.left, r.top, false);
    });

    var dragging = false;
    var moved = false;
    var startX = 0, startY = 0, offX = 0, offY = 0;
    var pressTimer = null;
    var downAt = 0;

    buddy.addEventListener('pointerdown', function (ev) {
      if (ev.button !== undefined && ev.button !== 0) return;
      dragging = true;
      moved = false;
      var r = wrap.getBoundingClientRect();
      startX = ev.clientX; startY = ev.clientY;
      offX = ev.clientX - r.left; offY = ev.clientY - r.top;
      downAt = Date.now();
      closeMenu();
      try { buddy.setPointerCapture(ev.pointerId); } catch (e) {}
      pressTimer = window.setTimeout(function () {
        if (!moved) {
          wrappedLongPress = true;
          buddy.classList.add('is-calling');
          say('按住我，就能和我说话——对话功能正在接入，先点一下试试我的快捷动作。', '');
        }
      }, 650);
    });

    var wrappedLongPress = false;

    buddy.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = Math.abs(ev.clientX - startX);
      var dy = Math.abs(ev.clientY - startY);
      if (!moved && dx + dy > 8) {
        moved = true;
        window.clearTimeout(pressTimer);
        wrap.classList.add('is-dragging');
      }
      if (moved) place(ev.clientX - offX, ev.clientY - offY, false);
    });

    function endPress(ev) {
      if (!dragging) return;
      dragging = false;
      window.clearTimeout(pressTimer);
      wrap.classList.remove('is-dragging');
      var held = Date.now() - downAt;
      if (moved) {
        var r = wrap.getBoundingClientRect();
        var p2 = place(r.left, r.top, true);
        save(p2.x, p2.y);
        return;
      }
      if (wrappedLongPress) { wrappedLongPress = false; return; }
      if (held < 650) {
        buddy.classList.add('is-pop');
        window.setTimeout(function () { buddy.classList.remove('is-pop'); }, 360);
        if (menu) {
          menu.hidden = !menu.hidden;
          if (!menu.hidden) buddy.classList.add('is-calling');
        }
      }
    }

    buddy.addEventListener('pointerup', endPress);
    buddy.addEventListener('pointercancel', endPress);

    buddy.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        if (menu) menu.hidden = !menu.hidden;
      }
    });

    if (menu) {
      menu.addEventListener('click', function (ev) {
        var btn = ev.target.closest ? ev.target.closest('button') : null;
        if (!btn) return;
        var go = btn.getAttribute('data-go');
        var src = btn.getAttribute('data-say');
        var text = btn.getAttribute('data-text') || '';
        var alsoPlay = btn.getAttribute('data-play');
        closeMenu();
        if (go) {
          var target = document.querySelector(go);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        say(text, src);
        if (alsoPlay) {
          window.setTimeout(function () {
            var pb = document.getElementById('voice-play');
            if (pb) {
              var av = document.getElementById('voice-audio');
              if (av && av.paused) pb.click();
            }
          }, 3400);
        }
      });
    }

    document.addEventListener('click', function (ev) {
      if (menu && !menu.hidden && !wrap.contains(ev.target)) closeMenu();
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeMenu();
    });
  }

})();
