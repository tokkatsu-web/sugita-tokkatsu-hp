/* 上のメニュー（header.top）の出し入れ
   PC：いつも上に固定（CSS の position:sticky だけ）。
   スマホ（960px 以下）：下へ読み進めると隠し、少し上へ戻すと出す。
   「動きを減らす」設定の人には隠さない（いつも固定）。 */
(function (root) {
  'use strict';

  var STEP = 6; // これより小さい動きでは変えない

  // いま隠れているか・前の位置・今の位置・帯の高さ・スマホか → 次に隠すか
  function nextHidden(hidden, prevY, y, headerH, mobile) {
    if (!mobile) return false;
    if (y <= headerH) return false;
    var d = y - prevY;
    if (Math.abs(d) < STEP) return hidden;
    return d > 0;
  }

  function start() {
    var doc = root.document, top = doc.querySelector('header.top');
    if (!top) return;
    var mq = root.matchMedia('(max-width:960px)');
    var calm = root.matchMedia('(prefers-reduced-motion: reduce)');
    var prev = root.scrollY, hidden = false, tick = false;
    doc.documentElement.classList.add('nav-sticky');
    root.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      root.requestAnimationFrame(function () {
        var y = root.scrollY;
        var next = nextHidden(hidden, prev, y, top.offsetHeight, mq.matches && !calm.matches);
        if (next !== hidden) { hidden = next; top.classList.toggle('nav-hide', hidden); }
        top.classList.toggle('nav-on', y > 4);
        prev = y; tick = false;
      });
    }, { passive: true });
    // メニューの中に入ったら（キーボード）必ず出す
    top.addEventListener('focusin', function () { hidden = false; top.classList.remove('nav-hide'); });
  }

  var api = { nextHidden: nextHidden };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else start();
})(this);
