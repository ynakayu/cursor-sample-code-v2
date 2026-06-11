// 抽選する運勢の一覧
const FORTUNE_LIST = [
  '大吉',
  '中吉',
  '小吉',
  '吉',
  '末吉',
  '凶',
  '大凶'
];

// 運勢ごとのメッセージ
const FORTUNE_MESSAGES = {
  '大吉': '最高の一日になりそう！思い切って挑戦してみよう。',
  '中吉': '良い流れが来ています。積極的に動くと吉。',
  '小吉': '穏やかな一日。小さな幸せに気づいてみて。',
  '吉': '平穏な一日。いつも通りで大丈夫。',
  '末吉': '控えめに過ごすと安心。焦らずゆっくりね。',
  '凶': '今日は慎重に。無理はせず、休息を大切に。',
  '大凶': '要注意の一日。大事な決断は明日に回してみよう。'
};

// 運勢ごとの表示用クラス名
const FORTUNE_CLASS_NAMES = {
  '大吉': 'result-daikichi',
  '中吉': 'result-chukichi',
  '小吉': 'result-shokichi',
  '吉': 'result-kichi',
  '末吉': 'result-suekichi',
  '凶': 'result-kyo',
  '大凶': 'result-daikyo'
};

// ガチャ演出の間隔（ミリ秒）
const SPIN_INTERVAL_MS = 80;

// ガチャ演出の合計時間（ミリ秒）
const SPIN_DURATION_MS = 2500;

let spinTimerId = null;
let finishTimerId = null;
let isSpinning = false;

/**
 * 0以上、最大値未満のランダムな整数を返す
 * @param {number} max 最大値（この値は含まない）
 * @returns {number} ランダムな整数
 */
function getRandomInteger(max) {
  return Math.floor(Math.random() * max);
}

/**
 * 運勢一覧からランダムに1つ選ぶ
 * @returns {string} 選ばれた運勢
 */
function pickRandomFortune() {
  const index = getRandomInteger(FORTUNE_LIST.length);
  return FORTUNE_LIST[index];
}

/**
 * 運勢の表示エリアに文字を表示する
 * @param {string} fortuneText 表示する運勢
 */
function displayFortuneText(fortuneText) {
  const fortuneDisplay = document.getElementById('fortune-display');
  fortuneDisplay.textContent = fortuneText;
}

/**
 * メッセージエリアに文字を表示する
 * @param {string} message 表示するメッセージ
 */
function displayFortuneMessage(message) {
  const fortuneMessage = document.getElementById('fortune-message');
  fortuneMessage.textContent = message;
}

/**
 * 運勢表示の色用クラスをすべて取り除く
 */
function clearFortuneResultClass() {
  const fortuneDisplay = document.getElementById('fortune-display');
  const classNames = Object.values(FORTUNE_CLASS_NAMES);

  for (let i = 0; i < classNames.length; i = i + 1) {
    fortuneDisplay.classList.remove(classNames[i]);
  }
}

/**
 * 運勢に応じた色のクラスを付ける
 * @param {string} fortune 運勢
 */
function applyFortuneResultClass(fortune) {
  const fortuneDisplay = document.getElementById('fortune-display');
  const className = FORTUNE_CLASS_NAMES[fortune];

  if (className) {
    fortuneDisplay.classList.add(className);
  }
}

/**
 * ガチャマシンと運勢表示に「回転中」の見た目を付ける
 */
function startSpinningStyle() {
  const gachaMachine = document.getElementById('gacha-machine');
  const fortuneDisplay = document.getElementById('fortune-display');

  gachaMachine.classList.add('is-spinning');
  fortuneDisplay.classList.add('is-spinning');
}

/**
 * ガチャマシンと運勢表示から「回転中」の見た目を外す
 */
function stopSpinningStyle() {
  const gachaMachine = document.getElementById('gacha-machine');
  const fortuneDisplay = document.getElementById('fortune-display');

  gachaMachine.classList.remove('is-spinning');
  fortuneDisplay.classList.remove('is-spinning');
}

/**
 * ガチャボタンの有効・無効を切り替える
 * @param {boolean} enabled true のとき有効
 */
function setGachaButtonEnabled(enabled) {
  const gachaButton = document.getElementById('gacha-button');
  gachaButton.disabled = !enabled;
}

/**
 * 抽選中のアニメーションを止める
 */
function stopSpinAnimation() {
  if (spinTimerId !== null) {
    clearInterval(spinTimerId);
    spinTimerId = null;
  }

  if (finishTimerId !== null) {
    clearTimeout(finishTimerId);
    finishTimerId = null;
  }
}

/**
 * 最終的な運勢結果を画面に表示する
 * @param {string} fortune 確定した運勢
 */
function showFinalResult(fortune) {
  stopSpinningStyle();
  clearFortuneResultClass();

  displayFortuneText(fortune);
  applyFortuneResultClass(fortune);

  const message = FORTUNE_MESSAGES[fortune];
  displayFortuneMessage('今日の運勢は「' + fortune + '」！ ' + message);

  isSpinning = false;
  setGachaButtonEnabled(true);
}

/**
 * 抽選中の演出を開始する（運勢が次々と切り替わる）
 * @param {string} finalFortune 最後に表示する運勢
 */
function startSpinAnimation(finalFortune) {
  startSpinningStyle();
  clearFortuneResultClass();
  displayFortuneMessage('ガチャを回しています...');

  spinTimerId = setInterval(function () {
    const temporaryFortune = pickRandomFortune();
    displayFortuneText(temporaryFortune);
  }, SPIN_INTERVAL_MS);

  finishTimerId = setTimeout(function () {
    stopSpinAnimation();
    showFinalResult(finalFortune);
  }, SPIN_DURATION_MS);
}

/**
 * 「ガチャを回す」ボタンが押されたときの処理
 */
function handleGachaButtonClick() {
  if (isSpinning) {
    return;
  }

  isSpinning = true;
  setGachaButtonEnabled(false);

  const finalFortune = pickRandomFortune();
  startSpinAnimation(finalFortune);
}

const gachaButton = document.getElementById('gacha-button');
gachaButton.addEventListener('click', handleGachaButtonClick);
