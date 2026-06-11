# 勉強時間トラッカー テストケース

## テスト概要

本ドキュメントは、勉強時間トラッカー（`index.html` + `app.js` + `styles.css`）の手動テストケースを定義する。対象機能は以下のとおり。

| 機能領域 | 主要実装 |
|----------|----------|
| タイマー計測 | `handleStart`, `handlePause`, `handleResume`, `handleStop`, `startTimer`, `pauseTimer`, `resumeTimer`, `buildSessionFromTimer` |
| 手動記録 | `handleManualSubmit`, `addSession` |
| 永続化 | `persist` → `saveState` / `loadState`, キー `studyTimeApp.v1` |
| カレンダー | `renderCalendar`, `shiftMonth`, `getDatesWithSessions` |
| 日別履歴 | `renderDayDetail`, `getSessionsForDate`, `getTotalMsForDate` |
| データ正規化 | `normalizeSession`, `normalizeActiveTimer` |

**対象 UI 要素 ID（抜粋）:** `timerDisplay`, `timerStatus`, `startBtn`, `pauseBtn`, `resumeBtn`, `stopBtn`, `subjectInput`, `topicInput`, `notesInput`, `manualForm`, `manualDateInput`, `manualMinutesInput`, `prevMonthBtn`, `nextMonthBtn`, `calendarMonthLabel`, `calendarGrid`, `dayDetailDate`, `dayDetailTotal`, `sessionList`, `emptyDayMessage`

---

## 前提条件・テスト環境

| 項目 | 内容 |
|------|------|
| 対象ファイル | `/Users/naka/Desktop/learn-cursor/index.html`（`app.js`, `styles.css` を同ディレクトリから読み込み） |
| ブラウザ | Chrome / Firefox / Safari の最新版（いずれか1つ以上） |
| 起動方法 | `index.html` をブラウザで直接開く、またはローカル HTTP サーバー経由で開く |
| 初期状態 | テスト前に DevTools → Application → Local Storage で `studyTimeApp.v1` を削除するか、意図した JSON をセットする |
| 補助 | 開発者ツール（Console, Application/Storage）を使用可能であること |
| 注意 | タイマー・日付系テストはシステム日時に依存する。必要に応じて OS の日時を固定するか、テスト実施日を記録する |

---

## 機能テストケース

| ID | テスト項目 | 前提 | 操作手順 | 期待結果 |
|----|------------|------|----------|----------|
| F-001 | 初回表示（データなし） | `studyTimeApp.v1` が存在しない | `index.html` を開く | `timerDisplay` が `00:00:00`、`timerStatus` が「停止中」。`startBtn` 有効、`pauseBtn`/`resumeBtn`/`stopBtn` 無効。カレンダーは当月表示、当日が選択状態 |
| F-002 | ページタイトル・ヘッダー | 同上 | 画面上部を確認 | `<title>` が「勉強時間トラッカー」。`header__title` に「勉強時間トラッカー」、`header__subtitle` に説明文が表示される |
| F-003 | タイマー開始 | タイマー停止中 | 科目に「数学」、トピックに「代数」を入力し `#startBtn` をクリック | `handleStart` が実行され `state.activeTimer` が設定される。`timerStatus` が「計測中」。`startBtn` 無効、`pauseBtn`/`stopBtn` 有効。`subjectInput`/`topicInput`/`notesInput` が disabled。`persist` により LocalStorage に保存 |
| F-004 | タイマー表示の秒更新 | F-003 の計測中 | 3秒以上待つ | `timerDisplay` が `formatDuration` 形式（`HH:MM:SS`）で増加する。`setInterval`（`startTicking`）により1秒ごとに更新 |
| F-005 | 一時停止 | F-003 の計測中 | `#pauseBtn` をクリック | `handlePause` → `pauseTimer` が実行される。`timerStatus` が「一時停止中」。`pauseBtn` 無効、`resumeBtn` 有効。表示時間が固定される |
| F-006 | 再開 | F-005 の一時停止中 | `#resumeBtn` をクリック | `handleResume` → `resumeTimer` が実行される。`timerStatus` が「計測中」。`resumeBtn` 無効、`pauseBtn` 有効。表示時間が再び増加する |
| F-007 | 停止して記録（1秒以上） | 5秒以上計測後 | `#stopBtn` をクリック | 確認ダイアログは出ない。`buildSessionFromTimer` でセッションが生成され `addSession` で `sessions` に追加。`activeTimer` が null。入力フィールドが再度有効。当日が `selectedDateKey` に設定され履歴・カレンダーが更新 |
| F-008 | 停止時の科目・トピック・メモの引き継ぎ | F-003 で科目・トピック・メモを入力してから F-007 を実行 | 日別履歴を確認 | 記録されたセッションに入力した subject/topic/notes が反映される。`source` は `timer`（バッジ「タイマー」） |
| F-009 | 1秒未満の記録破棄（キャンセル） | 開始直後（1秒未満） | `#stopBtn` → 確認ダイアログで「キャンセル」 | タイマーは継続（`activeTimer` が残る）。セッションは追加されない |
| F-010 | 1秒未満の記録破棄（OK） | 開始直後（1秒未満） | `#stopBtn` → 確認ダイアログで「OK」 | `setActiveTimer(state, null)` でタイマー解除。セッションは追加されない。UI が停止状態に戻る |
| F-011 | 計測中の再開始防止 | タイマー計測中 | `#startBtn` をクリック（無効のため操作不可を確認） | `handleStart` は早期 return し、二重開始しない。`startBtn` は disabled |
| F-012 | 手動記録（正常） | タイマー停止中 | 科目「英語」、日付を今日、`manualMinutesInput` に `45` を入力し `#manualForm` を submit | `handleManualSubmit` が `addSession` を呼び、`durationMs` が 45×60000。`source: 'manual'`。`selectedDateKey` とカレンダー表示月が記録日に同期。履歴に「手動」バッジで表示 |
| F-013 | 手動記録のデフォルト日付 | LocalStorage 空 | ページ読み込み直後に `manualDateInput` の値を確認 | `initManualDateDefault` により `toDateKey(new Date())`（本日）がセットされる |
| F-014 | タブ非表示→表示時の表示更新 | タイマー計測中 | 別タブに切り替えて数秒後、元タブに戻る | `visibilitychange` リスナーで `updateTimerDisplay` が呼ばれ、経過時間が実時間に近い値で表示される |
| F-015 | 複数セッションの同日合計 | 同一日にタイマー1件・手動1件を記録 | その日をカレンダーで選択 | `dayDetailTotal` に `getTotalMsForDate` の合計が `formatDurationShort` で表示される |
| F-016 | 内容未入力セッションの表示 | 科目・トピック空で記録 | 履歴を確認 | タイトルが「（内容未入力）」と表示される |
| F-017 | メモありセッション | notes に「復習した」を入力して記録 | 履歴の `session-item__meta` を確認 | バッジの後にメモテキストが表示される（`escapeHtml` 適用） |
| F-018 | レスポンシブレイアウト | ブラウザ幅を変更 | 幅 768px 未満と以上で表示 | `styles.css` の `@media (min-width: 768px)` により、広い画面では2カラム、狭い画面では1カラムになる |

---

## LocalStorage テストケース

| ID | テスト項目 | 前提 | 操作手順 | 期待結果 |
|----|------------|------|----------|----------|
| LS-001 | 初回ロード（キーなし） | `studyTimeApp.v1` 未設定 | ページを開く | `loadState` が `DEFAULT_STATE`（`version: 1`, `sessions: []`, `activeTimer: null`）を返す |
| LS-002 | 保存キーと形式 | タイマー開始後 | Application で `studyTimeApp.v1` を確認 | JSON に `version`, `sessions`, `activeTimer` が含まれる。`saveState` が `STORAGE_KEY`（`studyTimeApp.v1`）に書き込む |
| LS-003 | セッション保存後の再読み込み | 手動またはタイマーで1件記録 | ページをリロード | `loadState` → `normalizeSession` 経由でセッションが復元され、カレンダー・履歴に反映される |
| LS-004 | 計測中タイマーの復元 | 計測中に `persist` 済み | ページをリロード | `normalizeActiveTimer` で `activeTimer` が復元。`restoreActiveTimerFields` で `subjectInput` 等に値が戻る。`refreshTimerUI` でボタン状態・表示が計測/一時停止に応じて正しい |
| LS-005 | 一時停止中の復元 | 一時停止後にリロード | 同上 | `pausedAt` ありの状態で復元。`timerStatus` が「一時停止中」。`resumeBtn` が有効 |
| LS-006 | 破損 JSON のフォールバック | `studyTimeApp.v1` に `{invalid` 等の不正 JSON を設定 | ページを開く | `loadState` の catch で `cloneDefaultState()` が使われ、アプリがクラッシュしない |
| LS-007 | 非オブジェクト JSON | `studyTimeApp.v1` に `"hello"` を設定 | ページを開く | `parsed` がオブジェクトでないため `cloneDefaultState()` |
| LS-008 | sessions が配列でない | `{"version":1,"sessions":"x","activeTimer":null}` を設定 | ページを開く | `sessions` は空配列として扱われる |
| LS-009 | 不正セッションのフィルタ | `sessions` に `durationMs: -1` や `date: "invalid"` を含む JSON を設定 | ページを開く | `normalizeSession` が null を返し、該当要素は除外される |
| LS-010 | 不正 activeTimer の無視 | `activeTimer: { "startedAt": 123 }`（数値）を設定 | ページを開く | `normalizeActiveTimer` が null → `activeTimer` は null として扱われる |
| LS-011 | 各操作での persist 呼び出し | 計測開始→一時停止→再開→停止の各段階 | 各操作後に LocalStorage を確認 | 各 `handle*` 後に `persist()` → `saveState` が実行されストレージが更新される |
| LS-012 | 手動記録後の sessions 追記 | 手動記録1件 | LocalStorage の `sessions` 配列を確認 | 新規 `id`（`createId`）付きオブジェクトが1件追加されている |

---

## カレンダー表示テストケース

| ID | テスト項目 | 前提 | 操作手順 | 期待結果 |
|----|------------|------|----------|----------|
| CAL-001 | 月初表示 | 本日が含まれる月で起動 | カレンダーパネルを確認 | `calendarMonthLabel` が `formatMonthLabel(calendarYear, calendarMonth)`（例: `2026年5月`）。`calendarGrid` に 42 個の `.calendar-day` ボタン |
| CAL-002 | 前月へ移動 | 任意の月表示中 | `#prevMonthBtn` をクリック | `shiftMonth(-1)` が実行され、月ラベルとグリッドが前月に更新される |
| CAL-003 | 次月へ移動 | 任意の月表示中 | `#nextMonthBtn` をクリック | `shiftMonth(1)` で翌月表示。12月→1月、1月→12月で年が繰り上がる/下がる |
| CAL-004 | 月外セルの muted 表示 | 月初・月末付近の月を表示 | グリッドの前月・翌月に属する日付セルを確認 | `calendar-day--muted` クラスが付与され、色が薄く表示される（`styles.css`） |
| CAL-005 | 勉強日のハイライト | 特定日にセッションを1件以上記録 | その月をカレンダー表示 | 該当日に `calendar-day--has-study` が付与される（`getDatesWithSessions`） |
| CAL-006 | 当日の枠線 | 当月カレンダーで今日のセルを確認 | — | 選択されていない場合 `calendar-day--today` で枠線表示 |
| CAL-007 | 選択日の outline | 任意の日をクリック | クリックした日のボタンを確認 | `calendar-day--selected` が付与。`selectedDateKey` が `toDateKey` 形式で更新 |
| CAL-008 | 日付クリックで履歴連動 | 記録のある日とない日をそれぞれクリック | カレンダーの日ボタンをクリック | `renderDayDetail` が呼ばれ、`dayDetailDate` / `sessionList` / `emptyDayMessage` が選択日に応じて更新 |
| CAL-009 | 手動記録後のカレンダー月同期 | 表示月と異なる日付に手動記録 | 過去または未来の日付で手動 submit | `calendarYear` / `calendarMonth` が記録日の月に切り替わり、その月が表示される |
| CAL-010 | aria-label | 任意の日セル | 要素の属性を確認 | `aria-label` が「YYYY年M月D日」形式（`renderCalendar` 内） |
| CAL-011 | role 属性 | カレンダーグリッド | `#calendarGrid` と各セルを確認 | グリッドに `role="grid"`、各ボタンに `role="gridcell"` |
| CAL-012 | 停止記録後の選択日移動 | タイマーで記録完了 | `#stopBtn` で保存 | `selectedDateKey` がセッションの `date`（記録日）に設定され、カレンダー上でその日が選択状態になる |

---

## 学習履歴表示テストケース

| ID | テスト項目 | 前提 | 操作手順 | 期待結果 |
|----|------------|------|----------|----------|
| HIST-001 | 記録なし日の空表示 | セッションのない日を選択 | カレンダーでその日をクリック | `emptyDayMessage` が表示（`hidden` が false）。`sessionList` は空 |
| HIST-002 | 日付ラベル形式 | 任意の日を選択 | `dayDetailDate` を確認 | `formatDayLabel` により「YYYY年M月D日（曜）」形式（例: `2026年5月23日（土）`） |
| HIST-003 | 合計時間表示（60分未満） | 30分のセッション1件 | その日を選択 | `dayDetailTotal` が「合計: 30分」（`formatDurationShort`） |
| HIST-004 | 合計時間表示（60分以上） | 90分相当のセッション | その日を選択 | 「合計: 1時間30分」または分が0なら「1時間」形式 |
| HIST-005 | 単一セッション一覧 | 1件記録した日 | 履歴リストを確認 | `#sessionList` に1つの `li.session-item`。上部にタイトルと時間、下部にソースバッジ |
| HIST-006 | 複数セッション一覧 | 同日に2件以上記録 | その日を選択 | リストに複数 `session-item`。`getSessionsForDate` の `startedAt` 昇順で並ぶ |
| HIST-007 | タイマー由来バッジ | タイマーで記録 | 項目の meta を確認 | `session-item__badge` が「タイマー」 |
| HIST-008 | 手動由来バッジ | 手動で記録 | 同上 | バッジが「手動」 |
| HIST-009 | タイトル結合表示 | subject「数学」、topic「三角関数」 | 履歴を確認 | タイトルが「数学 — 三角関数」 |
| HIST-010 | HTML エスケープ | subject に `<script>alert(1)</script>` を入力して記録 | 履歴を確認 | スクリプトが実行されず、テキストとしてエスケープ表示（`escapeHtml`） |
| HIST-011 | メモなしセッション | notes 空で記録 | meta 行を確認 | バッジのみ、メモ部分は表示されない |
| HIST-012 | 日付切り替え時のリスト更新 | 2日分に別々に記録 | カレンダーで日付A→日付Bと切り替え | 各日のセッションのみが表示され、合計も日ごとに正しい |

---

## 異常系テストケース

| ID | テスト項目 | 前提 | 操作手順 | 期待結果 |
|----|------------|------|----------|----------|
| ERR-001 | 手動記録：日付未入力 | `manualDateInput` を空にする（required 解除は DevTools で一時的に） | フォーム submit | `handleManualSubmit` 内で `!dateKey` により早期 return。セッション追加なし |
| ERR-002 | 手動記録：分数0以下 | `manualMinutesInput` に `0` または負数 | submit | `minutes <= 0` で return。記録されない |
| ERR-003 | 手動記録：分数非数値 | 値を空または文字列に変更して submit | 同上 | `!Number.isFinite(minutes)` で return |
| ERR-004 | 一時停止の二重実行 | 既に一時停止中 | `#pauseBtn`（無効）の状態を確認 | `handlePause` は `!isRunning` で return。状態変化なし |
| ERR-005 | 再開の二重実行 | 計測中（未一時停止） | `#resumeBtn` が無効であることを確認 | `handleResume` は `!pausedAt` で return |
| ERR-006 | 停止（タイマーなし） | `activeTimer` が null | `#stopBtn` 無効を確認 | `handleStop` は早期 return |
| ERR-007 | LocalStorage 容量超過（参考） | 極端に大きな `sessions` を手動注入 | 操作後に persist を試みる | ブラウザにより `saveState` が例外を投げる可能性。アプリの catch は `loadState` のみで、保存失敗時は Console にエラー（実装依存） |
| ERR-008 | 負の durationMs のセッション | LS に `"durationMs": -100` のセッション | 読み込み | `normalizeSession` が null を返し一覧から除外 |
| ERR-009 | 不正 date 形式 | `"date": "2026/05/01"` | 読み込み | 正規表現 `/^\d{4}-\d{2}-\d{2}$/` に不一致で除外 |
| ERR-010 | XSS 風文字列のメモ | notes に `"><img onerror=...>` | 記録・表示 | `escapeHtml` により安全にテキスト表示 |
| ERR-011 | 開始直後の subject 変更不可 | 計測中 | `subjectInput` に入力を試みる | disabled のため変更不可（計測開始時の値がセッションに使われる） |
| ERR-012 | `manualMinutesInput` HTML 制約 | ブラウザのバリデーション有効 | `min=1` `max=1440` 外の値を submit 試行 | HTML5 制約により submit  blocked、または JS 側で拒否 |

---

## テストケース一覧サマリー

| カテゴリ | ID プレフィックス | 件数 |
|----------|-----------------|------|
| 機能テストケース | F- | 18 |
| LocalStorage テストケース | LS- | 12 |
| カレンダー表示テストケース | CAL- | 12 |
| 学習履歴表示テストケース | HIST- | 12 |
| 異常系テストケース | ERR- | 12 |
| **合計** | — | **66** |

### 参照：主要関数・定数一覧

| 種別 | 名前 |
|------|------|
| 定数 | `STORAGE_KEY` = `'studyTimeApp.v1'`, `DEFAULT_STATE` |
| 永続化 | `loadState`, `saveState`, `persist` |
| タイマー | `handleStart`, `handlePause`, `handleResume`, `handleStop`, `startTimer`, `pauseTimer`, `resumeTimer`, `buildSessionFromTimer`, `getElapsedMs`, `isRunning` |
| UI 描画 | `renderAll`, `renderCalendar`, `renderDayDetail`, `refreshTimerUI`, `updateTimerDisplay`, `updateTimerControls` |
| データ | `addSession`, `setActiveTimer`, `normalizeSession`, `normalizeActiveTimer`, `getSessionsForDate`, `getTotalMsForDate`, `getDatesWithSessions` |
| ユーティリティ | `toDateKey`, `parseDateKey`, `formatDuration`, `formatDurationShort`, `formatMonthLabel`, `formatDayLabel`, `escapeHtml`, `shiftMonth` |

---

*最終更新: アプリソース（`index.html`, `app.js`, `styles.css`）に基づく*
