// Select key elements
const startScreen = document.getElementById('startScreen');
const quizContent = document.getElementById('quizContent');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const startBtn = document.getElementById('startBtn');
const quizTitle = document.getElementById('quizTitle');

// Quiz data
const quizData = [
  {
    question: `How do you say ' <span class="highlight">she drank</span> ' ?`,
    options: ["شربت", "شرب", "نشرب", "يشرب"],
    answer: 0
  },
  {
    question: `How do you say ' <span class="highlight">they eat</span> ' ?`,
    options: ["ياكل", "ياكلون", "ناكل", "تاكل"],
    answer: 1
  },
  {
    question: `How do you say ' <span class="highlight">I played'</span> ' ?`,
    options: ["نلعب", "تلعب", "يلعب", "لعبت"],
    answer: 3
  }
]

let currentQuestion = 0;
let score = 0;

// Start the quiz
startBtn.onclick = () => {
  startScreen.style.display = 'none';
  quizContent.style.display = 'block';
  quizTitle.style.display = 'none';  // Hide title when quiz starts
  loadQuestion();
};

// Load a question
function loadQuestion() {
  const q = quizData[currentQuestion];
  questionEl.innerHTML = q.question;  // Use innerHTML here
  optionsEl.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.style.display = 'none';

  q.options.forEach((opt, index) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => selectOption(index);
    optionsEl.appendChild(btn);
  });
}

// Handle answer selection
function selectOption(index) {
  const q = quizData[currentQuestion];
  const optionDivs = optionsEl.children;

  for (let i = 0; i < optionDivs.length; i++) {
    optionDivs[i].onclick = null;
    if (i === q.answer) {
      optionDivs[i].classList.add('correct');
    } else if (i === index) {
      optionDivs[i].classList.add('incorrect');
    }
  }

  if (index === q.answer) {
    feedbackEl.textContent = "Correct";
    feedbackEl.style.color = "whitesmoke";
    feedbackEl.style.fontSize = "20px";
    score++;
  } else {
    feedbackEl.textContent = "Incorrect";
    feedbackEl.style.color = "whitesmoke";
    feedbackEl.style.fontSize = "20px";
  }

  nextBtn.style.display = 'inline-block';
}

// Go to next question or show final score
nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showFinalScore();
  }
};

// Show final result
function showFinalScore() {
  questionEl.textContent = `Quiz Complete! Your score: ${score} out of ${quizData.length}`;
  questionEl.style.textAlign = "center";
  optionsEl.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.style.display = 'none';
  quizTitle.style.display = 'block';
}
