// Quiz state variables
let currentQuestionIndex = 0;
let answeredQuestions = [];
let skippedQuestions = [];
let userAnswers = [];
let correctAnswers = 0;
let incorrectAnswers = 0;
let skippedCount = 0;
let incorrectQuestionIndices = [];
let reviewMode = false;
let currentReviewIndex = 0;
let resumeIndex = 0;

// Timer variables (optional)
let timerEnabled = false; // set to true to enable timer
let timerDuration = 5; // in minutes
let timeRemaining = 0;
let timerInterval = null;

// Default quiz data structure
let quizData = {};

// Your built-in sample quiz data
const sampleQuizData = {
    title: "Computer Science Basics Quiz",
    heading: "Health + Society Quiz",
    questions: [
        {
            question: "Which is the best description of 'deontology (duty-based ethics)'?",
            options: [
                "A. the morality of an action is judged solely by its consequences",
                "B. the morality of an action is judged based on what a virtuous person would do in the given circumstances",
                "C. the morality of an action is judged according to a set of rules, regardless of the consequences",
                "D. it focuses on maximising the greatest good for greatest number of people"
            ],
            correctAnswer: "C",
            explanation: "In deontology, an action is wrong because it is inherently wrong. For example, lying is considered always wrong, regardless of the consequences. Therefore, we have a moral duty to be truthful.<br>'A' &rarr; consequentialism<br>'B' &rarr; virtue ethics<br>'D' &rarr; utilitarianism (a form of consequentialism)"
        },
        {
            question: "<span class='highlight'>A GP federation identified areas of low vaccine uptake in the local area. They built connections with communities, explored the reasons behind vaccine hesitancy, and collaborated with them to design suitable interventions, such as creating educational materials in multiple languages and setting up vaccine pop-up clinics.</span><br>Which of the following best describes the ethical focus of this initiative?",
            options: [
                "A. Autonomy",
                "B. Beneficence",
                "C. Justice",
                "D. Equity"
            ],
            correctAnswer: "D",
            explanation: "While justice involves fairness and equal treatment, equity recognises individual and unique circumstances.<br>This scenario demonstrates equity as the GP federation adapted their approach based on what different communities needed - rather than applying the same intervention to everyone. "
        },
        
         
    ]
};

function validateQuizData(data) {
    if (!data.title) throw new Error("Quiz title is required");
    if (!data.heading) throw new Error("Quiz heading is required");
    if (!data.questions || !Array.isArray(data.questions))
        throw new Error("Questions must be an array");
    if (data.questions.length === 0)
        throw new Error("At least one question is required");

    data.questions.forEach((q, index) => {
        if (!q.question) throw new Error(`Question ${index + 1} text is missing`);
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2)
            throw new Error(`Question ${index + 1} must have at least 2 options`);
        if (!q.correctAnswer)
            throw new Error(`Question ${index + 1} is missing the correct answer`);

        const validAnswers = q.options.map(opt => opt.charAt(0));
        if (!validAnswers.includes(q.correctAnswer))
            throw new Error(`Question ${index + 1} has an invalid correct answer`);
    });
}

function initializeQuiz(data) {
    document.getElementById("quiz-heading").textContent = data.heading;
    document.getElementById("question-count").textContent = data.questions.length;
    document.getElementById("total-questions").textContent = data.questions.length;

    answeredQuestions = new Array(data.questions.length).fill(false);
    skippedQuestions = new Array(data.questions.length).fill(false);
    userAnswers = new Array(data.questions.length).fill(null);

    correctAnswers = 0;
    incorrectAnswers = 0;
    skippedCount = 0;
    incorrectQuestionIndices = [];

    displayQuestion(0);
    updateScore();

    // Disable next button initially
    document.getElementById('next-button').disabled = true;
    // Disable prev button on first question
    document.getElementById('prev-button').disabled = true;
    // Show skip button if question not answered yet
    document.getElementById('skip-button').disabled = false;
    // Hide try again button initially
    
}

function displayQuestion(index) {
    currentQuestionIndex = index;
    const questionObj = quizData.questions[index];

    // Update question text
    const questionEl = document.getElementById('question');
    questionEl.innerHTML = questionObj.question;

    // Clear previous options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    // Render options as buttons
    questionObj.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.classList.add('option-btn');
        btn.disabled = false;
        btn.addEventListener('click', () => checkAnswer(option.charAt(0)));
        optionsContainer.appendChild(btn);
    });

    // Update progress
    document.getElementById('current-question').textContent = index + 1;

    // Enable or disable Prev button
    document.getElementById('prev-button').disabled = index === 0;

    // Next button enabled only if answered/skipped
    document.getElementById('next-button').disabled = !answeredQuestions[index] && !skippedQuestions[index];

    // Skip button disabled if already answered or skipped
    document.getElementById('skip-button').disabled = answeredQuestions[index] || skippedQuestions[index];

    // Hide try again button initially
   

    // Hide feedback
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'none';
    feedback.innerHTML = '';

    // If user has already answered this question, disable options and highlight selection
    if (answeredQuestions[index]) {
        const selectedAnswer = userAnswers[index];
        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            if (btn.textContent.charAt(0) === selectedAnswer) {
                btn.classList.add('selected');
                // Show if answer was correct or not
                if (selectedAnswer === questionObj.correctAnswer) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('incorrect');
                }
            }
        });

        // Show explanation feedback
        showFeedback(index, selectedAnswer);
    }
}

function checkAnswer(selectedOption) {
    const index = currentQuestionIndex;
    if (answeredQuestions[index] || skippedQuestions[index]) return; // Already answered/skipped

    userAnswers[index] = selectedOption;
    answeredQuestions[index] = true;

    // Disable skip button for this question
    document.getElementById('skip-button').disabled = true;

    // Disable all options after answering
    const optionsContainer = document.getElementById('options-container');
    Array.from(optionsContainer.children).forEach(btn => {
        btn.disabled = true;
        const btnOption = btn.textContent.charAt(0);

        if (btnOption === selectedOption) {
            btn.classList.add('selected');
            if (selectedOption === quizData.questions[index].correctAnswer) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('incorrect');
            }
        }
        // Highlight the correct answer even if not selected
        if (btnOption === quizData.questions[index].correctAnswer) {
            btn.classList.add('correct');
        }
    });

    const correct = quizData.questions[index].correctAnswer;
    if (selectedOption === correct) {
        correctAnswers++;
    } else {
        incorrectAnswers++;
        incorrectQuestionIndices.push(index);
        
    }

    updateScore();
    showFeedback(index, selectedOption);

    // Enable next button
    document.getElementById('next-button').disabled = false;

    checkQuizCompletion();
}


function showFeedback(index, selectedOption) {
    const feedback = document.getElementById('feedback');
    const questionObj = quizData.questions[index];
    feedback.style.display = 'block';

    if (selectedOption === questionObj.correctAnswer) {
        feedback.innerHTML = `Correct! ${questionObj.explanation || ''}`;
        feedback.className = 'result correct-score';
    } else {
        feedback.innerHTML = `Incorrect. ${questionObj.explanation || ''}`;
        feedback.className = 'result incorrect-score';
    }
}

function skipQuestion() {
    const index = currentQuestionIndex;
    if (answeredQuestions[index] || skippedQuestions[index]) return;

    skippedQuestions[index] = true;
    skippedCount++;

    // Disable skip button and options
    document.getElementById('skip-button').disabled = true;
    const optionsContainer = document.getElementById('options-container');
    Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);

    // Enable next button
    document.getElementById('next-button').disabled = false;

    updateScore();
    checkQuizCompletion();
}



function updateScore() {
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('incorrect-count').textContent = incorrectAnswers;
    document.getElementById('skipped-count').textContent = skippedCount;

    const totalAnswered = correctAnswers + incorrectAnswers + skippedCount;
    document.getElementById('total-answered').textContent = totalAnswered;

    // Also update final modal counts
    document.getElementById('final-correct').textContent = correctAnswers;
    document.getElementById('final-incorrect').textContent = incorrectAnswers;
    document.getElementById('final-skipped').textContent = skippedCount;
}

function nextQuestion() {
    if (reviewMode) {
        currentReviewIndex++;

        if (currentReviewIndex >= incorrectQuestionIndices.length) {
            // Exit review mode and resume from where you left off
            reviewMode = false;
            currentReviewIndex = 0;

            // Determine where to resume from:
            let resumeTo = resumeIndex;
            if (answeredQuestions[resumeIndex] || skippedQuestions[resumeIndex]) {
                resumeTo++;
            }

            // Resume at next question only if it exists
            if (resumeTo < quizData.questions.length) {
                displayQuestion(resumeTo);
            }

            // Reset button text or hide it if you want:
            const reviewButton = document.getElementById('review-button');
            if (reviewButton) {
                reviewButton.textContent = 'Review Incorrect';  // reset when review ends
            }

            return;
        }

        const nextIndex = incorrectQuestionIndices[currentReviewIndex];
        displayQuestion(nextIndex);

        // Update the button text with numbering while reviewing
        const reviewButton = document.getElementById('review-button');
        if (reviewButton) {
            reviewButton.textContent = `Review Incorrect (${currentReviewIndex + 1}/${incorrectQuestionIndices.length})`;
        }
    } else {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            displayQuestion(currentQuestionIndex + 1);
        }
    }
}





function prevQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
    }
}

function restartQuiz() {
    currentQuestionIndex = 0;
    answeredQuestions.fill(false);
    skippedQuestions.fill(false);
    userAnswers.fill(null);
    correctAnswers = 0;
    incorrectAnswers = 0;
    skippedCount = 0;
    incorrectQuestionIndices = [];
    currentReviewIndex = 0;

    updateScore();
    displayQuestion(0);

    document.getElementById('next-button').disabled = true;
    document.getElementById('prev-button').disabled = true;
    document.getElementById('skip-button').disabled = false;
    

    // Hide modal if open
    document.getElementById('congratulations-modal').style.display = 'none';
    document.getElementById('fireworks').style.display = 'none';

     const reviewBtn = document.getElementById('review-button');
    if (reviewBtn) {
        reviewBtn.textContent = 'Review Incorrect';
        reviewBtn.disabled = false;
    }

    if (timerEnabled) {
        stopTimer();
        startTimer();
    }
}

function reviewWrongAnswers() {
    if (incorrectQuestionIndices.length === 0) {
        alert("No incorrect answers to review!");
        return;
    }

    reviewMode = true;
    currentReviewIndex = 0;
    resumeIndex = currentQuestionIndex; // 💾 Save position to resume

    const firstIndex = incorrectQuestionIndices[currentReviewIndex];
    displayQuestion(firstIndex);

    const reviewButton = document.getElementById('review-button');
    if (reviewButton) {
        reviewButton.textContent = `Review Incorrect (1/${incorrectQuestionIndices.length})`;
    }

    document.getElementById('next-button').disabled = false;
    document.getElementById('prev-button').disabled = false;
}





// Checks if quiz is finished (all questions answered or skipped)
function checkQuizCompletion() {
    const totalAnswered = answeredQuestions.filter(Boolean).length + skippedQuestions.filter(Boolean).length;
    if (totalAnswered === quizData.questions.length) {
        // Show modal
        const modal = document.getElementById('congratulations-modal');
        modal.style.display = 'block';

        // Show fireworks if desired
        document.getElementById('fireworks').style.display = 'block';

    }
}

// Timer functions (optional)
function startTimer() {
    timeRemaining = timerDuration * 60; // seconds
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
            // Auto-finish quiz or disable inputs here if needed
        }
    }, 1000);

    document.getElementById('quiz-timer').style.display = 'block';
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('quiz-timer').style.display = 'none';
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('time-remaining').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialization on DOM load
function startQuiz() {
    try {
        validateQuizData(sampleQuizData);
        quizData = sampleQuizData;

        // Show quiz content
        const quizContent = document.getElementById('quiz-content');
        if (quizContent) {
            quizContent.style.display = 'block';
            quizContent.classList.add('fade-in');
        }

        initializeQuiz(quizData);

        if (timerEnabled) startTimer();
    } catch (error) {
        console.error("Quiz initialization error:", error);
        alert("Error loading quiz: " + error.message);
    }
}

// Event listeners for buttons
window.addEventListener('DOMContentLoaded', () => {
    startQuiz();

    document.getElementById('next-button').addEventListener('click', nextQuestion);
    document.getElementById('prev-button').addEventListener('click', prevQuestion);
    document.getElementById('skip-button').addEventListener('click', skipQuestion);
    
    document.getElementById('restart-button').addEventListener('click', restartQuiz);
    document.getElementById('restart-quiz-btn').addEventListener('click', restartQuiz);
    document.getElementById('review-button').addEventListener('click', reviewWrongAnswers);

    // Modal close button
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('congratulations-modal').style.display = 'none';
        document.getElementById('fireworks').style.display = 'none';
    });
});
