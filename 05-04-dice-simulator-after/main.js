document.getElementById('rollBtn').addEventListener('click', function () {
  const count = parseInt(document.getElementById('diceCount').value, 10);

  if (!Number.isInteger(count) || count < 1) {
    document.getElementById('resultArea').textContent = 'サイコロの数は1以上の整数を入力してください';
    return;
  }

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1);
  }

  const total = rolls.reduce((sum, n) => sum + n, 0);
  document.getElementById('resultArea').textContent =
    `出た目: ${rolls.join(', ')} / 合計: ${total}`;
});
