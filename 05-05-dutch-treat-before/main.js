document.getElementById('warikan-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const total = Number(document.getElementById('total').value);
  const people = Number(document.getElementById('people').value);
  const resultDiv = document.getElementById('result');

  if (people <= 0) {
    resultDiv.textContent = '人数は1人以上を入力してください。';
    return;
  }
  if (total < 0) {
    resultDiv.textContent = '合計金額は0円以上を入力してください。';
    return;
  }

  const warikan = Math(total / people);
  resultDiv.textContent = `1人あたりの金額は ${warikan} 円です。`;
});