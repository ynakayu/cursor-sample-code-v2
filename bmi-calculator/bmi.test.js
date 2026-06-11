import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBmi,
  calculateBmiFromInput,
  convertCmToMeters,
  formatBmi,
  validateHeight,
  validateWeight,
} from './bmi.js';

test('身長170cm・体重65kgのときBMIは22.49になる', function () {
  const result = calculateBmiFromInput('170', '65');
  assert.deepEqual(result, { bmiText: '22.49' });
});

test('身長をcmからmに変換できる', function () {
  const heightM = convertCmToMeters(170);
  assert.equal(heightM, 1.7);
});

test('BMIの計算式が正しく動作する', function () {
  const bmi = calculateBmi(65, 1.7);
  assert.equal(formatBmi(bmi), '22.49');
});

test('身長が未入力のときエラーを返す', function () {
  const result = calculateBmiFromInput('', '65');
  assert.equal(result.error, '身長を入力してください。');
});

test('体重が未入力のときエラーを返す', function () {
  const result = calculateBmiFromInput('170', '');
  assert.equal(result.error, '体重を入力してください。');
});

test('身長が0以下のときエラーを返す', function () {
  const zeroResult = validateHeight('0');
  assert.equal(zeroResult.error, '身長は0より大きい数値を入力してください。');

  const negativeResult = validateHeight('-10');
  assert.equal(negativeResult.error, '身長は数値のみ入力できます。');
});

test('体重が0以下のときエラーを返す', function () {
  const zeroResult = validateWeight('0');
  assert.equal(zeroResult.error, '体重は0より大きい数値を入力してください。');

  const negativeResult = validateWeight('-5');
  assert.equal(negativeResult.error, '体重は数値のみ入力できます。');
});

test('身長が数値以外のときエラーを返す', function () {
  const result = calculateBmiFromInput('abc', '65');
  assert.equal(result.error, '身長は数値のみ入力できます。');
});

test('体重が数値以外のときエラーを返す', function () {
  const result = calculateBmiFromInput('170', 'xyz');
  assert.equal(result.error, '体重は数値のみ入力できます。');
});
