# コード品質レポート — 勉強時間トラッカー

**対象ファイル:** `index.html` / `app.js` / `styles.css`  
**調査日:** 2026-05-23  
**前提:** 初学者向け学習プロジェクト（HTML/JS 分離・説明的 id・関数コメント・シンプルな写法）

---

## 概要

3ファイル合計で約 920 行。ロジックの大半（約 525 行）が単一の `app.js` に集約されており、UI 描画・イベント・永続化・タイマー計測が同居している。HTML と CSS は比較的整理されており、アクセシビリティ属性（`aria-*`、`role`）も適切に使われている。

**総評:** 動作設計（タイマーの `accumulatedMs`、localStorage の正規化、`escapeHtml` による XSS 対策）は堅実。一方で **プロジェクトルール（関数コメント）との乖離**、**ファイル内の読み順**、**描画の粒度** が、初学者の理解と将来の機能追加における主なリスクになっている。パフォーマンスは現状の利用規模では問題になりにくいが、セッション件数増加時に効いてくるパターンがいくつかある。

| 観点 | 件数（実害のある指摘） | 深刻度の目安 |
|------|------------------------|--------------|
| 可読性 | **7** | 高（ルール未遵守・謎コード） |
| 保守性 | **7** | 中〜高（単一ファイル・データ修正不可） |
| パフォーマンス | **6** | 低〜中（現状は許容、将来のボトルネック候補） |
| 改善候補 | **13**（優先度付き一覧） | — |

---

## 可読性の問題

### 1. 関数コメントが一切ない（ルール未遵守）

- **該当:** `app.js` 38〜522 行（約 35 関数すべて）
- **内容:** ユーザールール「関数には必ずコメントを入れる」および `AGENTS.md` の方針に対し、処理の目的・入出力の説明がない。
- **影響:** 初学者が「何をする関数か」をファイル内検索やコメント頼りで把握できず、学習効果が下がる。

### 2. 初期化の位置が読み順と逆

- **該当:** `app.js` 303〜305 行（`initManualDateDefault` / `restoreActiveTimerFields` / `renderAll` の実行）と 307 行以降（`pad2`、`loadState` などの定義）
- **内容:** 関数宣言はホイストされるため動作はするが、上から読むと「まだ定義を読んでいない関数」を実行しているように見える。
- **影響:** デバッグや追読時に認知負荷が増える。

### 3. 意味不明な行 `{ createId };`

- **該当:** `app.js` 460 行
- **内容:** 副作用のないブロック式。削除しても挙動は変わらないと推測される。
- **影響:** 「意図のないコード」として信頼感を損なう。

### 4. 省略寄り構文の使用（方針とのズレ）

- **該当:** 例）`app.js` 47〜49 行（`??`）、371〜375 行、429〜439 行（スプレッド・オブジェクト短縮）
- **内容:** `AGENTS.md` は「省略記法を多用しない」とある。動作は明確だが、初学者には `if` と明示的代入の方が読みやすい場合がある。
- **影響:** 学習用コードとして一貫した「読みやすさ」の基準がぶれる。

### 5. `renderDayDetail` 内の DOM 構築スタイルの混在

- **該当:** `app.js` 109〜147 行（特に 124〜145 行）
- **内容:** `createElement` / `appendChild` と `innerHTML`（132, 141 行）が同一関数内に共存。`escapeHtml` により XSS は緩和されている。
- **影響:** 同じ一覧描画なのに2通りの書き方を理解する必要がある。

### 6. HTML へのインラインスタイル

- **該当:** `index.html` 63 行  
  `style="margin-top: 0.75rem; width: 100%"`
- **内容:** 見た目が CSS ファイルと分離されていない。
- **影響:** スタイル変更時に HTML と `styles.css` の両方を確認する必要がある。

### 7. 未使用の `id="studyFields"`

- **該当:** `index.html` 36 行 / `app.js` の `els` オブジェクト（15〜36 行）に未登録
- **内容:** 「操作対象には役割が分かる id」ルールに沿って id は付いているが、JS から参照されていない。
- **影響:** 将来の拡張用なのか dead id なのか判断できない。

---

## 保守性の問題

### 1. 単一 `app.js` への責務集中

- **該当:** `app.js` 1〜525 行全体
- **内容:** UI（15〜305 行）、フォーマット（307〜351 行）、永続化・正規化（353〜417 行）、タイマーロジック（462〜522 行）が1ファイル。
- **影響:** セッション削除・編集・エクスポートなどを足すたびにコンフリクトと影響範囲が大きくなる。

### 2. グローバル可変 `state` と純粋関数風 API の混在

- **該当:** `app.js` 9 行、`handleStart` など（202〜238 行）、`addSession` / `setActiveTimer`（429〜440 行）
- **内容:** `let state` の再代入と、`addSession(state, ...)` のように state を引数で返すパターンが共存。
- **影響:** 「state がいつ・どこで変わるか」を追うコストが高い。

### 3. `renderAll()` による描画範囲の過大化

- **該当:** `app.js` 196〜200 行、各ハンドラからの呼び出し（207, 214, 221, 232, 238, 265 行など）
- **内容:** 一時停止などタイマー表示だけで足りる操作でも、カレンダー（42 セル）と日別リストまで毎回更新。
- **影響:** 修正時に「どの render を呼ぶべきか」が分かりにくく、不要な DOM 操作が増える。

### 4. 一時停止後のセッション `startedAt` の意味が曖昧

- **該当:** `app.js` 489〜496 行（`pauseTimer` で `startedAt: null`）、508〜521 行（`buildSessionFromTimer` で `startedAt: activeTimer.startedAt || endedAt`）
- **内容:** 再開後に停止すると、記録上の開始時刻が「最後の再開時刻」に近づき、実際の勉強開始時刻とずれる可能性がある（経過時間 `durationMs` は `accumulatedMs` で正しい）。
- **影響:** 履歴のメタデータとして `startedAt` を信頼する場合にデータ品質問題になる。

### 5. セッションの削除・編集がない

- **該当:** `sessions` は `addSession`（429 行）による追記のみ。UI にも削除 UI なし（`index.html` 89 行は空メッセージのみ）
- **内容:** 誤記録の修正は localStorage 手編集に依存。
- **影響:** 長期利用時のデータ保守が困難（`id` は `normalizeSession` で既に付与: 371 行）。

### 6. 自動テスト・手動検証リストの欠如

- **該当:** `getElapsedMs`、`pauseTimer`、`normalizeSession` などロジックが複雑だがテストなし
- **影響:** リファクタ時の回帰に気づきにくい。

### 7. 未使用 CSS（`.sr-only`）

- **該当:** `styles.css` 290〜300 行 — HTML から参照なし
- **影響:** 軽微だが、スタイル表と実 DOM の対応がずれる。

---

<h2 id="performance-concerns">パフォーマンス上の懸念</h2>

> 現状（セッション数十〜数百件、単一ユーザー）では体感問題になりにくい。記録増加・操作頻度増加時に検討する項目。

### 1. `renderAll()` によるカレンダー・日別の毎回フル再構築

- **該当:** `app.js` 196〜200, 155〜193 行
- **内容:** タイマー操作のたびに 42 個のカレンダーセルとクリックリスナーを再生成。
- **規模感:** 操作1回あたり DOM ノード数十個 + リスナー42個（旧ノード破棄のためリークは起きにくい）。

### 2. カレンダー描画のたびの全セッション走査

- **該当:** `app.js` 159 行 `getDatesWithSessions`、448〜453 行
- **内容:** `renderCalendar` のたびに `sessions` 全件を走査して `Set` 化 — **O(n)**。
- **規模感:** 数千件超で月移動・日選択が重くなる候補。

### 3. 日別詳細での同一日付フィルタ二重実行

- **該当:** `app.js` 110〜111 行、`getTotalMsForDate`（456〜458 行）が内部で再度 `getSessionsForDate` を呼ぶ
- **内容:** 同じ `dateKey` で配列フィルタが2回。
- **規模感:** 1日あたりの件数が少なら無視できるが、設計として無駄が残る。

### 4. バックグラウンドタブでも 1 秒 `setInterval`

- **該当:** `app.js` 85〜89 行（`startTicking`）、289〜293 行（`visibilitychange` は表示更新のみ）
- **内容:** 非表示タブでも毎秒 `textContent` 更新が続く可能性。
- **規模感:** 更新は1要素のみで軽いが、バッテリー・バックグラウンド負荷の観点で改善余地あり。

### 5. 操作ごとの localStorage 全量書き込み

- **該当:** `app.js` 52〜54, 420〜426 行
- **内容:** 毎操作で `sessions` 全体を `JSON.stringify` して `setItem`。
- **規模感:** 現規模では許容。件数・メモ文字列が大きいとシリアライズコストが増える。

### 6. カレンダーの差分更新なし

- **該当:** `app.js` 157 行 `innerHTML = ''` 以降のループ（165〜193 行）
- **内容:** 選択日変更時もグリッド全再生成。クラス差分更新や `DocumentFragment` バッチ化は未使用。
- **規模感:** UX 上は問題になりにくいが、最適化の余地は中程度の実装コスト。

---

## 改善候補一覧

### 優先度: 高

| # | 改善内容 | 主な該当 | 期待効果 |
|---|----------|----------|----------|
| H1 | 全関数に日本語コメントを追加 | `app.js` 全体 | ルール遵守・学習しやすさ |
| H2 | ファイル構成の整理（init を末尾、セクションコメント、`460` 行削除） | `app.js` 303〜460 行 | 読み順の改善・ノイズ除去 |
| H3 | `renderAll` を用途別 render に分割 | `app.js` 196〜200, 各ハンドラ | 保守性向上・不要 DOM 削減 |
| H4 | 停止セッションの `startedAt` 設計の見直し | `app.js` 489〜521 行 | 履歴メタデータの正確性 |

### 優先度: 中

| # | 改善内容 | 主な該当 | 期待効果 |
|---|----------|----------|----------|
| M1 | インライン `style` を CSS クラスへ移動 | `index.html` 63, `styles.css` | スタイル一元管理 |
| M2 | セッション削除（必要なら編集） | `app.js` 109〜147, 429 行付近 | 誤操作のリカバリ |
| M3 | `getDaySummary` で一覧と合計を1回取得 | `app.js` 109〜111, 456〜458 | 意図の明確化・小さな CPU 削減 |
| M4 | `renderDayDetail` の DOM 構築を1スタイルに統一 | `app.js` 123〜145 行 | 可読性・レビュー容易性 |
| M5 | `commit(nextState)` など state 更新の単一入口 | `app.js` 9, 202〜265 行 | 変更箇所の追跡容易化 |

### 優先度: 低

| # | 改善内容 | 主な該当 | 期待効果 |
|---|----------|----------|----------|
| L1 | 一部の `??` / スプレッドを明示的写法へ | `app.js` 各所 | `AGENTS.md` との整合 |
| L2 | `datesWithStudy` のキャッシュ | `app.js` 448〜453 | 大量セッション時のスケール |
| L3 | 非表示タブで tick 停止 | `app.js` 85〜93, 289 行 | バックグラウンド負荷軽減 |
| L4 | `studyFields` id の整理（使用 or 削除） | `index.html` 36 | マークアップ意図の明確化 |
| L5 | 未使用 `.sr-only` の利用 or 削除 | `styles.css` 290〜300 | CSS と HTML の一致 |

---

## 具体的な改善提案

### H1: 関数コメントの追加（例）

```javascript
/**
 * 選択日のセッション一覧と合計を画面に描画する
 */
function renderDayDetail() {
  // ...
}
```

プロジェクト内の `todo-app/todo-list.js` など、既存サンプルと同じ「1〜2文の日本語コメント」で揃えるとよい。

### H2: 初期化を末尾にまとめる（構成例）

```javascript
// --- 定数・DOM 参照 ---
// --- 日付・フォーマット ---
// --- 永続化・state ---
// --- タイマーロジック ---
// --- UI 描画 ---
// --- イベントハンドラ ---

function initApp() {
  initManualDateDefault();
  restoreActiveTimerFields();
  renderAll();
}

initApp();
```

`{ createId };`（460 行）は削除する。

### H3: render の分割（例）

```javascript
function renderAll() {
  refreshTimerUI();
  renderCalendar();
  renderDayDetail();
}

// 一時停止・再開ではこれだけで足りる
function handlePause() {
  if (!state.activeTimer || !isRunning(state.activeTimer)) return;
  state = setActiveTimer(state, pauseTimer(state.activeTimer));
  persist();
  refreshTimerUI();
}
```

### H4: `startedAt` の保持（例）

```javascript
function startTimer(fields) {
  const nowIso = new Date().toISOString();
  return {
    startedAt: nowIso,
    originalStartedAt: nowIso, // 最初の開始を保持
    // ...
  };
}

function buildSessionFromTimer(activeTimer, now = Date.now()) {
  return {
    // ...
    startedAt: activeTimer.originalStartedAt || activeTimer.startedAt || endedAt,
  };
}
```

### M1: インライン style の CSS 化（例）

`index.html`:

```html
<button type="submit" class="primary manual-form__submit">記録する</button>
```

`styles.css`:

```css
.manual-form__submit {
  margin-top: 0.75rem;
  width: 100%;
}
```

### M3: 二重フィルタの解消（例）

```javascript
function renderDayDetail() {
  const sessions = getSessionsForDate(state, selectedDateKey);
  const totalMs = sessions.reduce(function (sum, s) {
    return sum + s.durationMs;
  }, 0);
  // sessions をそのまま一覧描画に使う
}
```

### M4: DOM 構築の統一（例 — `textContent` のみ）

```javascript
const titleSpan = document.createElement('span');
titleSpan.textContent = title;
const durationSpan = document.createElement('span');
durationSpan.textContent = formatDurationShort(session.durationMs);
top.appendChild(titleSpan);
top.appendChild(durationSpan);
```

`innerHTML` を減らすと、初学者にとって「データの流れ」が追いやすくなる。

---

## 良い点（維持すべき実装）

- **HTML / JS 分離**、`timerDisplay` など説明的な `id` はプロジェクトルールに沿っている（`index.html` / `app.js` 15〜36 行）。
- **`escapeHtml`**（`app.js` 149〜153 行）により、ユーザー入力を HTML に載せる箇所で XSS リスクを抑えている。
- **`normalizeSession` / `loadState`**（364〜417 行）のバリデーションと try-catch により、壊れた localStorage からも復旧しやすい。
- **タイマー計測**の `accumulatedMs` + `pausedAt`（462〜506 行）は、表示用経過時間として一貫している。
- **CSS 変数**（`styles.css` 7〜19 行）でテーマ色がまとまっており、見た目の変更がしやすい。
- **README**（ルート）に勉強時間トラッカーの説明・起動方法が記載されており、オンボーディングの基盤はある。

---

## 関連ファイル一覧

| ファイル | 行数 | 主な役割 |
|----------|------|----------|
| `app.js` | 525 | ロジック・UI・永続化のすべて |
| `index.html` | 97 | マークアップ・アクセシビリティ属性 |
| `styles.css` | 301 | レイアウト・コンポーネントスタイル |
