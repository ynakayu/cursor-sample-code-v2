/**
 * 入力値が空かどうかを判定する
 * @param {string} value - 入力文字列
 * @returns {boolean} 空の場合は true
 */
export function isEmpty(value) {
  return value.trim() === '';
}

/**
 * 入力値が正の数値かどうかを判定する
 * @param {string} value - 入力文字列
 * @returns {boolean} 正の数値の場合は true
 */
export function isPositiveNumber(value) {
  const trimmed = value.trim();
  return /^\d+(\.\d+)?$/.test(trimmed);
}

/**
 * 文字列を数値に変換する
 * @param {string} value - 入力文字列
 * @returns {number} 変換した数値
 */
export function toNumber(value) {
  return Number(value.trim());
}

/**
 * 身長（cm）をメートルに変換する
 * @param {number} heightCm - 身長（cm）
 * @returns {number} 身長（m）
 */
export function convertCmToMeters(heightCm) {
  return heightCm / 100;
}

/**
 * BMIを計算する
 * @param {number} weightKg - 体重（kg）
 * @param {number} heightM - 身長（m）
 * @returns {number} BMI
 */
export function calculateBmi(weightKg, heightM) {
  return weightKg / (heightM * heightM);
}

/**
 * BMIを小数点第2位までの文字列に整形する
 * @param {number} bmi - BMI
 * @returns {string} 表示用のBMI文字列
 */
export function formatBmi(bmi) {
  return bmi.toFixed(2);
}

/**
 * 身長の入力値を検証する
 * @param {string} heightCmText - 身長の入力文字列（cm）
 * @returns {{ heightCm: number } | { error: string }} 検証結果
 */
export function validateHeight(heightCmText) {
  if (isEmpty(heightCmText)) {
    return { error: '身長を入力してください。' };
  }

  if (!isPositiveNumber(heightCmText)) {
    return { error: '身長は数値のみ入力できます。' };
  }

  const heightCm = toNumber(heightCmText);
  if (heightCm <= 0) {
    return { error: '身長は0より大きい数値を入力してください。' };
  }

  return { heightCm };
}

/**
 * 体重の入力値を検証する
 * @param {string} weightKgText - 体重の入力文字列（kg）
 * @returns {{ weightKg: number } | { error: string }} 検証結果
 */
export function validateWeight(weightKgText) {
  if (isEmpty(weightKgText)) {
    return { error: '体重を入力してください。' };
  }

  if (!isPositiveNumber(weightKgText)) {
    return { error: '体重は数値のみ入力できます。' };
  }

  const weightKg = toNumber(weightKgText);
  if (weightKg <= 0) {
    return { error: '体重は0より大きい数値を入力してください。' };
  }

  return { weightKg };
}

/**
 * 身長と体重からBMIを計算する（入力検証を含む）
 * @param {string} heightCmText - 身長の入力文字列（cm）
 * @param {string} weightKgText - 体重の入力文字列（kg）
 * @returns {{ bmiText: string } | { error: string }} 計算結果またはエラー
 */
export function calculateBmiFromInput(heightCmText, weightKgText) {
  const heightResult = validateHeight(heightCmText);
  if (heightResult.error) {
    return { error: heightResult.error };
  }

  const weightResult = validateWeight(weightKgText);
  if (weightResult.error) {
    return { error: weightResult.error };
  }

  const heightM = convertCmToMeters(heightResult.heightCm);
  const bmi = calculateBmi(weightResult.weightKg, heightM);
  const bmiText = formatBmi(bmi);

  return { bmiText };
}
