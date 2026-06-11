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

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';

  const taskTextSpan = document.createElement('span');
  taskTextSpan.textContent = taskText;

  listItem.appendChild(checkbox);
  listItem.appendChild(taskTextSpan);

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
 * チェックが入っているタスクのリスト項目を集める
 * @returns {HTMLLIElement[]} 削除対象のリスト項目の配列
 */
function getCheckedTaskListItems() {
  const taskList = document.getElementById('task-list');
  const checkboxes = taskList.querySelectorAll('.task-checkbox');
  const checkedItems = [];

  for (let i = 0; i < checkboxes.length; i = i + 1) {
    const checkbox = checkboxes[i];

    if (checkbox.checked) {
      const listItem = checkbox.parentElement;
      checkedItems.push(listItem);
    }
  }

  return checkedItems;
}

/**
 * チェックが入ったタスクを一覧から削除する
 */
function deleteCheckedTasks() {
  const taskList = document.getElementById('task-list');
  const itemsToRemove = getCheckedTaskListItems();

  for (let i = 0; i < itemsToRemove.length; i = i + 1) {
    const listItem = itemsToRemove[i];
    taskList.removeChild(listItem);
  }
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

/**
 * 「削除」ボタンがクリックされたときの処理
 */
function handleDeleteTasksClick() {
  deleteCheckedTasks();
}

const addTaskButton = document.getElementById('add-task-button');
addTaskButton.addEventListener('click', handleAddTaskClick);

const deleteTasksButton = document.getElementById('delete-tasks-button');
deleteTasksButton.addEventListener('click', handleDeleteTasksClick);
