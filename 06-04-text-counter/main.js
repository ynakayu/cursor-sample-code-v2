/**
 * 入力欄の文字数を数え、結果エリアに表示する
 */
function countAndDisplayCharacters() {
  const textInput = document.getElementById('text-input');
  const resultDiv = document.getElementById('character-count-result');
  const characterCount = textInput.value.length;
  resultDiv.textContent = `文字数: ${characterCount} 文字`;
}

document.getElementById('count-button').addEventListener('click', countAndDisplayCharacters);
