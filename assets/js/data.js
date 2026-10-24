/* 表のデータを読みこんで数える（下書き）
   読みこみ先は SOURCES の1か所だけ。先生の Google スプレッドシートを
   「ウェブに公開 → CSV」にしたら、ここの URL を差しかえるだけでページに反映される。
   ページへの描画（地図・棒グラフ）はここには書かない。 */
(function (root) {
  'use strict';

  var SOURCES = {
    activities: 'data/activities_2025.csv'
    // 例：activities: 'https://docs.google.com/spreadsheets/d/e/…/pub?gid=…&single=true&output=csv'
  };

  var SHOW = '○';

  // 北から（JIS の都道府県コード順）。タイルマップの並びにも使う
  var PREFS = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  // CSV を行の配列にする（引用符・改行・BOM・CRLF に対応）
  function parseCSV(text) {
    text = String(text || '').replace(/^﻿/, '');
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else { q = false; }
        } else { cell += c; }
      } else if (c === '"') { q = true; }
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else { cell += c; }
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (v) { return v.trim() !== ''; }); });
  }

  // 1行目を見出しにして、行ごとのオブジェクトにする
  function toObjects(rows) {
    if (!rows || !rows.length) throw new Error('データが空です');
    var head = rows[0].map(function (h) { return h.trim(); });
    return rows.slice(1).map(function (r) {
      var o = {};
      head.forEach(function (h, i) { o[h] = (r[i] || '').trim(); });
      return o;
    });
  }

  function visible(list) {
    return list.filter(function (o) { return o['表示'] === SHOW; });
  }

  // 件数を数える。「—」「海外」など都道府県でないものは地図に数えない
  function summarize(list) {
    var byType = {}, byPref = {}, byYear = {};
    list.forEach(function (o) {
      byType[o['種別']] = (byType[o['種別']] || 0) + 1;
      byYear[o['年度']] = (byYear[o['年度']] || 0) + 1;
      if (PREFS.indexOf(o['都道府県']) >= 0) {
        byPref[o['都道府県']] = (byPref[o['都道府県']] || 0) + 1;
      }
    });
    var prefectures = PREFS.filter(function (p) { return byPref[p]; });
    return {
      total: list.length, byType: byType, byYear: byYear,
      byPref: byPref, prefectures: prefectures, prefCount: prefectures.length
    };
  }

  // 読みこみ。失敗は黙らずに投げる（呼ぶ側で「読みこめませんでした」と出す）
  function load(name) {
    var url = SOURCES[name];
    if (!url) return Promise.reject(new Error('読みこみ先がありません：' + name));
    return fetch(url, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('読みこめませんでした（' + res.status + '）');
      return res.text();
    }).then(function (text) {
      return visible(toObjects(parseCSV(text)));
    });
  }

  var api = {
    SOURCES: SOURCES, PREFS: PREFS,
    parseCSV: parseCSV, toObjects: toObjects, visible: visible,
    summarize: summarize, load: load
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TokkatsuData = api;
})(this);
