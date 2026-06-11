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
  taskTextSpan.className = 'task-text';
  taskTextSpan.textContent = taskText;
  taskTextSpan.addEventListener('click', handleTaskTextClick);

  const editArea = document.createElement('div');
  editArea.className = 'task-edit-area';
  editArea.style.display = 'none';

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'task-edit-input';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'task-edit-button';
  editButton.textContent = '編集';
  editButton.addEventListener('click', handleEditTaskClick);

  editArea.appendChild(editInput);
  editArea.appendChild(editButton);

  listItem.appendChild(checkbox);
  listItem.appendChild(taskTextSpan);
  listItem.appendChild(editArea);

  return listItem;
}

/**
 * すべてのタスクの編集フォームを非表示にする
 */
function hideAllTaskEditForms() {
  const taskList = document.getElementById('task-list');
  const editAreas = taskList.querySelectorAll('.task-edit-area');

  for (let i = 0; i < editAreas.length; i = i + 1) {
    const editArea = editAreas[i];
    const listItem = editArea.parentElement;
    hideTaskEditForm(listItem);
  }
}

/**
 * 指定したタスクの編集フォームを表示する
 * @param {HTMLLIElement} listItem 編集対象のリスト項目
 */
function showTaskEditForm(listItem) {
  const taskTextSpan = listItem.querySelector('.task-text');
  const editArea = listItem.querySelector('.task-edit-area');
  const editInput = listItem.querySelector('.task-edit-input');

  editInput.value = taskTextSpan.textContent;
  taskTextSpan.style.display = 'none';
  editArea.style.display = 'block';
  editInput.focus();
}

/**
 * 指定したタスクの編集フォームを非表示にする
 * @param {HTMLLIElement} listItem 編集対象のリスト項目
 */
function hideTaskEditForm(listItem) {
  const taskTextSpan = listItem.querySelector('.task-text');
  const editArea = listItem.querySelector('.task-edit-area');

  taskTextSpan.style.display = 'inline';
  editArea.style.display = 'none';
}

/**
 * タスクの表示テキストを更新する
 * @param {HTMLLIElement} listItem 更新対象のリスト項目
 * @param {string} newTaskText 新しいタスクの内容
 */
function updateTaskText(listItem, newTaskText) {
  const taskTextSpan = listItem.querySelector('.task-text');
  taskTextSpan.textContent = newTaskText;
}

/**
 * タスクのテキストがクリックされたときの処理
 * @param {Event} event クリックイベント
 */
function handleTaskTextClick(event) {
  const taskTextSpan = event.target;
  const listItem = taskTextSpan.parentElement;

  hideAllTaskEditForms();
  showTaskEditForm(listItem);
}

/**
 * 「編集」ボタンがクリックされたときの処理
 * @param {Event} event クリックイベント
 */
function handleEditTaskClick(event) {
  const editButton = event.target;
  const listItem = editButton.parentElement.parentElement;
  const editInput = listItem.querySelector('.task-edit-input');
  const newTaskText = editInput.value;

  if (newTaskText === '') {
    return;
  }

  updateTaskText(listItem, newTaskText);
  hideTaskEditForm(listItem);
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
