// パスワードに使う文字の一覧
const PASSWORD_CHARACTERS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

// 生成するパスワードの文字数
const PASSWORD_LENGTH = 12;

/**
 * ランダムなパスワードを生成する
 * @returns {string} 生成されたパスワード
 */
function generateRandomPassword() {
  let password = '';

  for (let i = 0; i < PASSWORD_LENGTH; i = i + 1) {
    const randomIndex = Math.floor(Math.random() * PASSWORD_CHARACTERS.length);
    const character = PASSWORD_CHARACTERS.charAt(randomIndex);
    password = password + character;
  }

  return password;
}

/**
 * 画面にパスワードを表示する
 * @param {string} password 表示するパスワード
 */
function displayPassword(password) {
  const passwordDisplay = document.getElementById('password-display');
  passwordDisplay.textContent = password;
}

/**
 * ボタンクリック時にパスワードを生成して表示する
 */
function handleGeneratePasswordClick() {
  const password = generateRandomPassword();
  displayPassword(password);
}

const generatePasswordButton = document.getElementById('generate-password-button');
generatePasswordButton.addEventListener('click', handleGeneratePasswordClick);
