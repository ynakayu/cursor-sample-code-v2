const quizData = [
  {
    question: "日本でいちばん面積が大きい都道府県は？",
    choices: ["北海道", "岩手県", "長野県", "福島県"],
    answer: 0
  },
  {
    question: "東京都がある地方は？",
    choices: ["中部", "関東", "近畿", "東北"],
    answer: 1
  },
  {
    question: "富士山があるのは？",
    choices: ["山梨と静岡", "長野と群馬", "岐阜と愛知", "新潟と福島"],
    answer: 0
  },
  {
    question: "日本海に面していない県は？",
    choices: ["石川", "秋田", "鳥取", "奈良"],
    answer: 3
  },
  {
    question: "沖縄が属するのは？",
    choices: ["九州・沖縄", "四国", "中国", "中部"],
    answer: 0
  }
];

let current = 0;
let score = 0;
let answered = false;

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const progressEl = document.getElementById("progress");
const nextBtn = document.getElementById("next-btn");
const resultEl = document.getElementById("result");
const quizEl = document.getElementById("quiz");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");

function loadQuestion() {
  answered = false;
  feedbackEl.textContent = "";
  nextBtn.style.display = "none";

  const q = quizData[current];
  progressEl.textContent = `${current + 1} / ${quizData.length}`;
  questionEl.textContent = q.question;
  choicesEl.innerHTML = "";

  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => selectAnswer(i, btn);
    choicesEl.appendChild(btn);
  });
}

function selectAnswer(i, btn) {
  if (answered) return;
  answered = true;

  const correct = quizData[current].answer;
  const buttons = choicesEl.children;

  for (let j = 0; j < buttons.length; j++) {
    buttons[j].disabled = true;
    if (j === correct) {
      buttons[j].classList.add("correct");
    }
  }

  if (i === correct) {
    score++;
    feedbackEl.textContent = "正解！";
  } else {
    btn.classList.add("wrong");
    feedbackEl.textContent = "不正解";
  }

  nextBtn.style.display = "block";
}

nextBtn.onclick = () => {
  current++;
  if (current < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  quizEl.style.display = "none";
  resultEl.style.display = "block";
  scoreEl.textContent = `${quizData.length}問中 ${score}問正解`;
}

restartBtn.onclick = () => {
  current = 0;
  score = 0;
  quizEl.style.display = "block";
  resultEl.style.display = "none";
  loadQuestion();
};

loadQuestion();