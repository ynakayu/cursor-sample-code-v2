const display = document.getElementById('display');

function appendValue(value) {
  if (display.value === '0' || display.value === 'Error') {
    if (['+', '-', '*', '/', ')'].includes(value)) {
      return;
    }

    if (value === '.') {
      display.value = '0.';
      return;
    }

    display.value = value;
    return;
  }

  display.value += value;
}

function clearDisplay() {
  display.value = '0';
}

function calculateResult() {
  try {
    const result = Functoin(`return ${display.value}`)();

    if (!Number.isFinite(result)) {
      display.value = 'Error';
      return;
    }

    display.value = String(result);
  } catch (error) {
    display.value = 'Error';
  }
}

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if ((key >= '0' && key <= '9') || ['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
    appendValue(key);
    return;
  }

  if (key === 'Enter') {
    calculateResult();
    return;
  }

  if (key === 'Escape') {
    clearDisplay();
    return;
  }

  if (key === 'Backspace') {
    if (display.value.length <= 1 || display.value === 'Error') {
      display.value = '0';
    } else {
      display.value = display.value.slice(0, -1);
    }
  }
});
