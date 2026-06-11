const STORAGE_KEY = 'memos';

function loadMemos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMemos(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

function renderMemos(memos) {
  const list = document.getElementById('memo-list');
  list.innerHTML = '';
  memos.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });
}

const memos = loadMemos();
renderMemos(memos);

document.getElementById('save-btn').addEventListener('click', function () {
  const input = document.getElementById('memo-input');
  const text = input.value.trim();
  if (!text) {
    return;
  }

  const updated = [text, ...loadMemos()];
  saveMemos(updated);
  renderMemos(updated);
  input.value = '';
});
