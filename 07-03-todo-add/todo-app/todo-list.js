/**
 * 入力欄からタスクの文字列を取得する
 * @returns {string} 入力されたタスクの内容
 */
function getTaskInputValue() {
  const taskInput = document.getElementById('task-input');
  return taskInput.value;
}

/**
 * 入力欄の内容を空にする
 */
function clearTaskInput() {
  const taskInput = document.getElementById('task-input');
  taskInput.value = '';
}

/**
 * タスク1件分のリスト項目（li）を作成する
 * @param {string} taskText 表示するタスクの内容
 * @returns {HTMLLIElement} 作成したリスト項目
 */
function createTaskListItem(taskText) {
  const listItem = document.createElement('li');
  listItem.textContent = taskText;
  return listItem;
}

/**
 * タスク一覧に新しいタスクを追加して表示する
 * @param {string} taskText 追加するタスクの内容
 */
function addTaskToList(taskText) {
  const taskList = document.getElementById('task-list');
  const listItem = createTaskListItem(taskText);
  taskList.appendChild(listItem);
}

/**
 * 「追加」ボタンがクリックされたときの処理
 */
function handleAddTaskClick() {
  const taskText = getTaskInputValue();

  if (taskText === '') {
    return;
  }

  addTaskToList(taskText);
  clearTaskInput();
}

const addTaskButton = document.getElementById('add-task-button');
addTaskButton.addEventListener('click', handleAddTaskClick);
