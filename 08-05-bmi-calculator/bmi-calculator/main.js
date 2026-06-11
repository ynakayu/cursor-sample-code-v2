import { calculateBmiFromInput } from './bmi.js';

const heightInput = document.getElementById('heightCm');
const weightInput = document.getElementById('weightKg');
const calculateButton = document.getElementById('calculateButton');
const resultArea = document.getElementById('resultArea');

/**
 * エラーメッセージを画面に表示する
 * @param {string} message - 表示するエラーメッセージ
 */
function showError(message) {
  resultArea.innerHTML = '<p class="error">' + message + '</p>';
}

/**
 * BMIの計算結果を画面に表示する
 * @param {string} bmiText - 表示するBMI（小数点第2位まで）
 */
function showBmiResult(bmiText) {
  resultArea.innerHTML =
    '<p>BMI: <span class="result-value">' + bmiText + '</span></p>';
}

/**
 * 「計算する」ボタンが押されたときの処理
 */
function handleCalculate() {
  const result = calculateBmiFromInput(heightInput.value, weightInput.value);

  if (result.error) {
    showError(result.error);
    return;
  }

  showBmiResult(result.bmiText);
}

calculateButton.addEventListener('click', handleCalculate);

weightInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    handleCalculate();
  }
});

heightInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    handleCalculate();
  }
});
