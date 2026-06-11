# BMI計算アプリ

身長（cm）と体重（kg）からBMIを計算して表示するWebアプリです。

## 機能

- 身長をcm単位、体重をkg単位で入力できる
- 「計算する」ボタンでBMIを表示する
- 計算式: `BMI = 体重(kg) ÷ (身長(m) × 身長(m))`
- 計算結果は小数点第2位まで表示する
- 未入力・0以下・数値以外の入力時はエラーメッセージを表示する

## ファイル構成

| ファイル | 説明 |
|----------|------|
| `index.html` | ページの構造 |
| `style.css` | 画面のスタイル |
| `main.js` | ボタン操作と画面表示の処理 |
| `bmi.js` | BMI計算と入力検証のロジック |
| `bmi.test.js` | テストコード |
| `package.json` | テスト実行用の設定 |

## 使い方

1. `index.html` をブラウザで開く
2. 身長（cm）と体重（kg）を入力する
3. 「計算する」ボタンをクリックする
4. BMIが画面に表示される

## テスト

### テスト実行コマンド

```bash
cd bmi-calculator
npm test
```

または

```bash
cd bmi-calculator
node --test bmi.test.js
```

### テスト内容

- 正常系: 身長170cm・体重65kg → BMI 22.49
- 異常系: 未入力、0以下、数値以外

## 技術

- HTML5
- CSS3
- JavaScript（Vanilla JS、ES Modules）
- Node.js 組み込みテスト（`node:test`）
