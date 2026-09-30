/* =====================================================================
   讯光 · NFC 文创卡 —— 页面交互
   1) 滚动入场动画
   2) 语音朗读（浏览器内置语音合成，离线可用）
   3) 访问信息 / 分享 / 复制链接
   4) 检测 Web NFC 能力（支持时提示可直接改写卡片网址）
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

  /* ---------------------------------------------------- 2. 语音朗读 */
  var NARRATION = [
    '讯光，一张可以用手机碰开的文创卡。',
    '它没有电池，只靠手机发出的电磁场被唤醒。当手机靠近卡片，卡片里的一段网址被读出，浏览器随即打开你现在看到的这个页面。',
    '科大讯飞成立于一九九九年，总部位于安徽合肥。二十多年里，它一直在做同一件事：让机器不仅能听到声音，也能听懂内容，并且用自然的方式回应人。',
    '语音合成、语音识别、自然语言理解，这些能力被带进了课堂、医院、汽车和城市。二零二三年发布的讯飞星火认知大模型，进一步把理解与生成的能力接进了教育与产业。',
    '这张卡没有电池。手机靠近时，线圈从手机的电磁场里取得一点点电，把卡片里的网址交给手机，浏览器随即打开你现在看到的这个页面。',
    '不需要装应用，不需要配对，也不需要打开什么开关。碰一下，就是全部的操作。',
    '我们想做的，不是一个能刷网页的玩具，而是把产教融合写成一段可以被触摸的叙事。碰一下，听见 AI 的声音。'
  ];

  var synth = window.speechSynthesis;
  var zhVoice = null;
  var speaking = false;

  var btnA = document.getElementById('tts-btn');
  var btnB = document.getElementById('tts-btn-2');
  var stopBtn = document.getElementById('stop-btn');
  var labelA = document.getElementById('tts-label');
  var labelB = document.getElementById('tts-label-2');

  function pickVoice() {
    if (!synth) return;
    var list = synth.getVoices() || [];
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (/zh[-_]?(CN|Hans)/i.test(v.lang) || /Chinese|中文|普通话|婷婷|Tingting|Yunxi|Xiaoxiao/i.test(v.name)) {
        zhVoice = v;
        return;
      }
    }
    for (var j = 0; j < list.length; j++) {
      if (/^zh/i.test(list[j].lang)) { zhVoice = list[j]; return; }
    }
  }

  if (synth) {
    pickVoice();
    if (typeof synth.onvoiceschanged !== 'undefined') {
      synth.onvoiceschanged = pickVoice;
    }
  }

  function setLabels(text) {
    if (labelA) labelA.textContent = text;
    if (labelB) labelB.textContent = text;
  }

  function stopSpeaking() {
    if (!synth) return;
    speaking = false;
    synth.cancel();
    setLabels('听它朗读');
    if (labelB) labelB.textContent = '朗读这张卡的介绍';
  }

  function speak(fromIndex) {
    if (!synth) {
      setLabels('当前浏览器不支持语音');
      return;
    }
    synth.cancel();
    speaking = true;
    setLabels('朗读中…');

    NARRATION.forEach(function (text, i) {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.98;
      u.pitch = 1.0;
      u.volume = 1.0;
      if (zhVoice) u.voice = zhVoice;
      if (i === NARRATION.length - 1) {
        u.onend = function () {
          speaking = false;
          setLabels('再听一遍');
        };
      }
      synth.speak(u);
    });
  }

  function toggle() {
    if (speaking) { stopSpeaking(); } else { speak(0); }
  }

  if (btnA) btnA.addEventListener('click', toggle);
  if (btnB) btnB.addEventListener('click', function () { speak(0); });
  if (stopBtn) stopBtn.addEventListener('click', stopSpeaking);

  window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });

  /* ---------------------------------------------------- 3. 页面信息 */
  var originLine = document.getElementById('origin-line');
  if (originLine) originLine.textContent = location.origin + location.pathname;

  var visitLine = document.getElementById('visit-line');
  if (visitLine) {
    var KEY = 'xunguang_visits';
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

  var shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var data = {
        title: '讯光 · NFC 文创卡',
        text: '碰一下，听见 AI 的声音。',
        url: location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href);
        shareBtn.textContent = '链接已复制';
        window.setTimeout(function () { shareBtn.textContent = '分享本页'; }, 1600);
      } else {
        window.alert('当前浏览器不支持一键分享，可以手动复制地址栏链接。');
      }
    });
  }

  /* ---------------------------------------------------- 4. 关于写卡工具 */
  // 写卡工具（writer.html）故意不做任何页面入口。
  // 它能改写甚至锁定 NFC 卡片，公开引流只会带来误操作，没有任何好处。
  // 需要写卡时直接访问：https://lpoint0320.github.io/xunguang-nfc-card/writer.html

})();
