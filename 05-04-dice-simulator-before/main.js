document.getElementById('rollBtn').addEventListener('click', function() {
  // 1〜6のランダムな整数を生成
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('resultArea').textContent = `出た目: ${dice}`;
});