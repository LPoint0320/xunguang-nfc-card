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

})();
