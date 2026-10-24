/* 表のデータ（data.js）から、トップの地図の濃さと棒グラフを描く。
   HTML には最後に確かめた時点の形が書いてあり、読みこめたらそれを新しい数で描きなおす。
   読みこめなかったときは黙らずに、地図の下に一言出す。 */
(function (root) {
  'use strict';

  // 回数 → 地図の濃さの段（凡例「少ない→多い」と同じ区切り）
  function levelOf(n) { return n >= 13 ? 'lv3' : n >= 5 ? 'lv2' : n >= 1 ? 'lv1' : ''; }

  // 地図のマスの短い名前（東京・神奈川）→ 表の都道府県名（東京都・神奈川県）
  function prefOf(label, prefs) {
    for (var i = 0; i < prefs.length; i++) {
      var p = prefs[i];
      if (p === label || (p.length === label.length + 1 && p.indexOf(label) === 0 && /[都府県]$/.test(p))) return p;
    }
    return '';
  }

  // いちばん多い種別を100%にした棒の長さ（小数1けた）
  function barWidths(byType, names) {
    var v = names.map(function (n) { return byType[n] || 0; });
    var max = Math.max.apply(null, v.concat([0]));
    return v.map(function (x) { return max ? Math.round(x / max * 1000) / 10 : 0; });
  }

  function draw(sum, doc) {
    // 地図
    Array.prototype.forEach.call(doc.querySelectorAll('.tilemap g'), function (g) {
      var rect = g.querySelector('rect'), text = g.querySelector('text');
      var pref = prefOf(text.textContent.trim(), root.TokkatsuData.PREFS);
      var n = sum.byPref[pref] || 0, lv = levelOf(n);
      rect.setAttribute('class', n ? 'on ' + lv : 'off');
      text.setAttribute('fill', n ? '#ffffff' : '#a9b7c9');
      var t = g.querySelector('title');
      if (n) { if (!t) { t = doc.createElementNS('http://www.w3.org/2000/svg', 'title'); g.insertBefore(t, g.firstChild); } t.textContent = text.textContent + ' ' + n + '回'; }
      else if (t) t.remove();
    });
    var map = doc.querySelector('.tilemap');
    if (map) map.setAttribute('aria-label', '指導・講演を行った' + sum.prefCount + '都道府県');
    // 棒グラフ
    var items = Array.prototype.slice.call(doc.querySelectorAll('.t12-bars li'));
    var names = items.map(function (li) { return li.querySelector('.t12-bl').textContent.trim(); });
    var w = barWidths(sum.byType, names);
    items.forEach(function (li, i) {
      li.querySelector('.t12-bar i').style.setProperty('--w', w[i] + '%');
      li.querySelector('.t12-bv').textContent = (sum.byType[names[i]] || 0) + '回';
    });
  }

  function start() {
    var doc = root.document;
    if (!doc.querySelector('.tilemap')) return;
    root.TokkatsuData.load('activities').then(function (list) {
      draw(root.TokkatsuData.summarize(list), doc);
    }).catch(function (e) {
      var note = doc.createElement('p');
      note.className = 't14-err';
      note.textContent = '最新の実績を読みこめませんでした。表示は前に確かめた時点のものです。';
      var lg = doc.querySelector('.t12-legend');
      if (lg) lg.after(note);
      if (root.console) console.warn(e);
    });
  }

  var api = { levelOf: levelOf, prefOf: prefOf, barWidths: barWidths, draw: draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.TokkatsuRender = api; if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start); else start(); }
})(this);
