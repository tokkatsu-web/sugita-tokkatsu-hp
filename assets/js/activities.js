/* 活動実績ページ：内訳の横棒と、しぼりこめる一覧（データは data.js の load から） */
(function (root) {
  'use strict';

  var PREFS = root.TokkatsuData ? root.TokkatsuData.PREFS : require('./data.js').PREFS;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function pick(list, f) {
    return list.filter(function (o) {
      return (!f.kind || o['種別'] === f.kind) && (!f.pref || o['都道府県'] === f.pref);
    });
  }

  // 「2025.09.07~09.14」→ 始まりの年月で並べる
  function ym(d) { var m = /^(\d{4})\.(\d{2})/.exec(d) || []; return (m[1] || '') + (m[2] || ''); }

  function byMonth(list) {
    var groups = {};
    list.forEach(function (o) { (groups[ym(o['日付'])] = groups[ym(o['日付'])] || []).push(o); });
    return Object.keys(groups).sort().map(function (k) {
      return { label: k.slice(0, 4) + '年' + (+k.slice(4)) + '月', items: groups[k] };
    });
  }

  function dateText(d) {
    var m = /^\d{4}\.(\d{2})\.(\d{2})(?:~(\d{2})\.(\d{2}))?/.exec(d);
    if (!m) return d;
    var s = (+m[1]) + '.' + m[2];
    return m[3] ? s + '〜' + (+m[3]) + '.' + m[4] : s;
  }

  function prefOptions(list) {
    return PREFS.filter(function (p) { return list.some(function (o) { return o['都道府県'] === p; }); });
  }

  // 月ごとに折りたたむ。ふだんは最新の月だけ開き、しぼりこんだときは全部開く
  function monthsHTML(groups, filtered) {
    return groups.map(function (g, i) {
      var open = filtered || i === groups.length - 1;
      var m = /^(\d{4})年(\d{1,2})月$/.exec(g.label) || [, '', g.label];
      var ticks = g.items.map(function () { return '<i></i>'; }).join('');
      return '<details' + (open ? ' open' : '') + ' class="pg-fold" data-ym="' + g.label + '"><summary class="pg-month">' +
        '<span class="pg-mn"><b>' + m[2] + '</b>月</span><span class="pg-my">' + m[1] + '</span>' +
        '<span class="pg-ticks" aria-hidden="true">' + ticks + '</span><span class="pg-mc">' + g.items.length + '回</span>' +
        '</summary><ul class="pg-acts">' + g.items.map(function (o) {
          return '<li><time>' + esc(dateText(o['日付'])) + '</time><span class="pg-pref">' + esc(o['都道府県']) +
            '</span><span>' + esc(o['公開する内容']) + '</span><span class="pg-kind">' + esc(o['種別']) + '</span></li>';
        }).join('') + '</ul></details>';
    }).join('');
  }

  // ---- ここから下はブラウザだけ ----
  function start() {
    var D = root.TokkatsuData, $ = function (id) { return document.getElementById(id); };
    var state = { kind: '', pref: '' }, all = [];

    function draw() {
      var hit = pick(all, state);
      $('pg-count').textContent = hit.length + '件';
      $('pg-list').innerHTML = hit.length ? monthsHTML(byMonth(hit), !!(state.kind || state.pref))
        : '<p class="pg-msg">あてはまる記録はありません。</p>';
    }

    D.load('activities').then(function (list) {
      all = list;
      var s = D.summarize(list), kinds = Object.keys(s.byType).sort(function (a, b) { return s.byType[b] - s.byType[a]; });
      var max = s.byType[kinds[0]];
      $('pg-total').textContent = '全国' + s.prefCount + 'の都道府県で、学校での指導や講演・研修会などに出かけました。';
      $('pg-bars').innerHTML = kinds.map(function (k) {
        return '<li><span>' + esc(k) + '</span><span class="pg-bar"><i style="--w:' + (s.byType[k] / max * 100).toFixed(1) +
          '%"></i></span><span class="pg-bv">' + s.byType[k] + '回</span></li>';
      }).join('');
      $('pg-kinds').innerHTML = [''].concat(kinds).map(function (k) {
        return '<button type="button" data-kind="' + esc(k) + '" aria-pressed="' + (k === '' ) + '">' + (k ? esc(k) : 'すべて') + '</button>';
      }).join('');
      $('pg-kinds').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        state.kind = b.getAttribute('data-kind');
        Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        draw();
      });
      prefOptions(list).forEach(function (p) { var o = document.createElement('option'); o.value = o.textContent = p; $('pg-pref').appendChild(o); });
      $('pg-pref').addEventListener('change', function () { state.pref = this.value; draw(); });
      draw();
    }).catch(function () {
      $('pg-total').textContent = '';
      $('pg-list').innerHTML = '<p class="pg-msg">記録を読みこめませんでした。時間をおいて、もう一度開いてください。</p>';
    });
  }

  var api = { esc: esc, pick: pick, byMonth: byMonth, dateText: dateText, prefOptions: prefOptions, monthsHTML: monthsHTML };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (document.getElementById('pg-list')) start();
})(this);
