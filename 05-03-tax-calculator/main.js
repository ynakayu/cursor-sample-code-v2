const amountInput = document.getElementById('amount');
const calculateBtn = document.getElementById('calculateBtn');
const resultArea = document.getElementById('resultArea');

function parseAmount(value) {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { error: '金額を入力してください。' };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { error: '数値のみ入力できます。' };
  }

  const amount = Number(trimmed);
  if (amount < 0) {
    return { error: '0以上の数値を入力してください。' };
  }

  return { amount };
}

function getSelectedTaxRate() {
  const selected = document.querySelector('input[name="taxRate"]:checked');
  return Number(selected.value);
}

function calculateTaxIncluded(amount, taxRate) {
  return Math.floor(amount * (1 + taxRate / 100));
}

function showError(message) {
  resultArea.innerHTML = `<p class="error">${message}</p>`;
}

function showResult(amount, taxRate, taxIncluded) {
  const taxAmount = taxIncluded - amount;
  resultArea.innerHTML = `
    <p>税抜価格: <span class="result-value">${amount.toLocaleString()}円</span></p>
    <p>消費税（${taxRate}%）: ${taxAmount.toLocaleString()}円</p>
    <p>税込価格: <span class="result-value">${taxIncluded.toLocaleString()}円</span></p>
  `;
}

function handleCalculate() {
  const parsed = parseAmount(amountInput.value);

  if (parsed.error) {
    showError(parsed.error);
    return;
  }

  const taxRate = getSelectedTaxRate();
  const taxIncluded = calculateTaxIncluded(parsed.amount, taxRate);
  showResult(parsed.amount, taxRate, taxIncluded);
}

calculateBtn.addEventListener('click', handleCalculate);

amountInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleCalculate();
  }
});
