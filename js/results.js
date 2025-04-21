// Get the data from the URL query parameter
// const params = new URLSearchParams(window.location.search);
// const dataString = params.get("data");
// const resultsData = JSON.parse(decodeURIComponent(dataString));
// =============================================================================
// 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ РЕЗУЛЬТАТОВ
// =============================================================================
/**
 * Получает данные результатов теста из LocalStorage
 */
const resultsData = JSON.parse(localStorage.getItem("testResults"));

// Настройка кнопки "К тесту"
document
  .getElementById("returnToTestBtn")
  .addEventListener("click", function () {
    if (!resultsData || !resultsData.testId) {
      alert("Не удалось определить тест");
      return;
    }

    // Формируем URL с учетом окружения (GitHub Pages или локальный сервер)
    const isGitHubPages = window.location.hostname.includes("github.io");
    const basePath = isGitHubPages ? "/My-website-with-tests/" : "./";
    window.location.href = `${basePath}test-page.html?test=${resultsData.testId}`;
  });

const score = resultsData.score;
let resultImage = document.getElementById("result-image");
let message;
let addMessage = "ddd";

function showConfetti() {
  confetti({
    particleCount: 200, // Количество частиц
    spread: 100, // Распространение
    origin: { y: 0.6 }, // Положение источника (снизу)
  });
}

if (score === 0) {
  message = "Надо было постараться, чтобы не ответить ничего (⓿_⓿)";
  addMessage =
    "Одно из двух: либо ты полный 0, либо ты знал ответы на все вопросы и специально отвечал неправильно-_-";
  resultImage.src = "./my-img/small_img/dissapointmentCat.jpg";
} else if (score <= 25) {
  message = "Очень плохо ＞﹏＜";
  addMessage =
    "Ты ничего не шаришь в IT. (А может ты специально выбирал неверные варианты?)))";
  resultImage.src = "./my-img/small_img/memeCatSleepy.webp";
} else if (score <= 50) {
  message = "Ну такое себе (。_。)";
  addMessage = "Некоторые знания есть, но все еще впереди!";
  resultImage.src = "./my-img/small_img/catWithBook.webp";
} else if (score <= 75) {
  message = "Неплохо, но есть куда стремиться (*^▽^*)";
  addMessage = "Вероятно, ты только изучаешь эту отрасль.";
  resultImage.src = "./my-img/small_img/endorsingCat.jpg";
} else if (score <= 99) {
  message = "А ты не так прост（￣︶￣）↗　";
  addMessage = "Ты отлично понимаешь базу программирования , удачи)";
  resultImage.src = "./my-img/small_img/cat-with-vuffle.jpg";
} else {
  message = "Профи §(*￣▽￣*)§";
  addMessage = "Вы готовы стать лучшим программистом в мире!)";
  resultImage.src = "./my-img/small_img/youarehacker.webp";
  showConfetti();
}
// Display the score
document.getElementById("main-result").textContent = `${message} (${score}%)`;
document.getElementById("result-comments").textContent = addMessage;

// Display each question result
const resultsContainer = document.getElementById("resultsContainer");
resultsData.questions.forEach((question, index) => {
  const answerDiv = document.createElement("div");
  answerDiv.className = "answer";

  // Image
  const img = document.createElement("img");
  img.src = question.image;
  answerDiv.appendChild(img);

  // Details
  const detailsDiv = document.createElement("div");
  detailsDiv.className = "details";

  // Question
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `<span class="standart-label">Вопрос #${
    index + 1
  }</span>: <span class="question-text">${question.question}</span>`;
  detailsDiv.appendChild(questionDiv);

  // Your Answer
  const yourAnswerDiv = document.createElement("div");
  yourAnswerDiv.className = "your-answer";
  yourAnswerDiv.innerHTML = `<span class="standart-label">Вы ответили:</span> <span class="answer-text">${question.userAnswer}</span>`;
  detailsDiv.appendChild(yourAnswerDiv);

  // Correct Answer
  if (!question.isCorrect) {
    const correctAnswerDiv = document.createElement("div");
    correctAnswerDiv.className = "correct-answer";
    correctAnswerDiv.innerHTML = `<span class="standart-label">Правильный ответ:</span> <span class="correct-answer-text">${question.correctAnswer}</span>`;
    detailsDiv.appendChild(correctAnswerDiv);

    answerDiv.appendChild(detailsDiv);
  } else {
    const correctAnswerDiv = document.createElement("div");
    correctAnswerDiv.className = "correct-answer";
    correctAnswerDiv.innerHTML = `<span class="standart-label"></span> <span class="correct-answer-text"></span>`;
    detailsDiv.appendChild(correctAnswerDiv);

    answerDiv.appendChild(detailsDiv);
  }

  // Answer Status
  const answerStatusDiv = document.createElement("div");
  answerStatusDiv.className = question.isCorrect
    ? "answer-status right"
    : "answer-status wrong";
  answerStatusDiv.textContent = question.isCorrect
    ? "Правильный ответ"
    : "Неправильный ответ";
  answerDiv.appendChild(answerStatusDiv);

  resultsContainer.appendChild(answerDiv);
});

/**
 * Загружает статистику
 */
async function showStatisticsModal() {
  const modal = document.getElementById("statsModal");
  const statsContent = document.getElementById("statsContent");

  try {
    const stats = JSON.parse(
      localStorage.getItem(`test-stats-${resultsData.testId}`)
    ) || {
      totalAttempts: 0,
      scoreRanges: { "0-25": 0, "26-50": 0, "51-75": 0, "76-99": 0, 100: 0 },
      averageScore: 0,
    };

    statsContent.innerHTML = `
      <div class="stat-item">
        <span>Всего попыток:</span>
        <strong>${stats.totalAttempts}</strong>
      </div>
      <div class="stat-item">
        <span>Средний результат:</span>
        <strong>${stats.averageScore.toFixed(1)}%</strong>
      </div>
      <h4>Распределение результатов:</h4>
      ${Object.entries(stats.scoreRanges)
        .map(
          ([range, count]) => `
        <div class="distribution-item">
          <span>${range}%:</span>
          <div class="progress-bar">
            <div class="progress-fill" 
                 style="width: ${
                   stats.totalAttempts ? (count / stats.totalAttempts) * 100 : 0
                 }%"></div>
          </div>
          <span>${count} (${
            stats.totalAttempts
              ? ((count / stats.totalAttempts) * 100).toFixed(1)
              : 0
          }%)</span>
        </div>
      `
        )
        .join("")}
    `;

    modal.style.display = "flex";
  } catch (error) {
    statsContent.innerHTML = "<p>Статистика пока недоступна</p>";
    modal.style.display = "flex";
  }
}
