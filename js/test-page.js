/**
 * TEST PAGE CONTROLLER
 */

// ==============================================
// 1. КОНФИГУРАЦИЯ И ИНИЦИАЛИЗАЦИЯ
// ==============================================

const AppConfig = {
  basePath:
  window.location.hostname.includes("github.io") ? `${window.location.origin}/My-website-with-tests/` : "./",
  localStorageKey: "testResults",
  defaultTestFile: "questions.json",
};

// ==============================================
// 2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ==============================================

const AppState = {
  currentTestId: getTestIdFromURL(), // Получаем ID из URL
  currentQuestionIndex: 0,
  userAnswers: [],
  score: 0,
  questions: [],
  testName: "",
};

// Инициализируем массив ответов
AppState.userAnswers = Array(AppState.questions.length).fill("");

// ==============================================
// 3. DOM ЭЛЕМЕНТЫ
// ==============================================

const DomElements = {
  // Основные элементы теста
  optionsContainer: document.querySelector(".options"),
  imageElement: document.querySelector(".image img"),
  questionElement: document.querySelector(".question"),
  questionNumber: document.querySelector(".questionNumber"),
  numberOfQuestion: document.querySelector(".numberOfQuestion"),

  // Кнопки навигации
  nextButtons: document.querySelectorAll(".next-question"),
  prevButtons: document.querySelectorAll(".previous-question"),
  backButtonNav: document.querySelector(".nav-right a:nth-of-type(1)"),
  resetButton: document.querySelector(".nav-right a:nth-of-type(2)"),

  // Навигационное меню
  navToggle: document.querySelector(".nav-toggle"),
  navList: document.querySelector(".nav-right"),
  header: document.querySelector(".main-nav"),
};

// ==============================================
// 4. ОСНОВНЫЕ ФУНКЦИИ ТЕСТА
// ==============================================

/**
 * Получает id теста
 */
function getTestIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const testId = params.get("test");

  if (!testId) {
    console.error("Test ID not specified in URL");
    return "programming-basic"; // значение по умолчанию
  }
  return testId;
}

/**
 * Обновляет интерфейс текущего вопроса
 */
function updateQuestion() {
  const question = AppState.questions[AppState.currentQuestionIndex];
  console.log(question);

  // Обновляем вопрос и изображение
  DomElements.questionElement.textContent = question.question;
  DomElements.imageElement.src = question.image;
  // DomElements.imageElement.src = `${AppConfig.basePath}tests/${AppState.currentTestId}/${question.image}`;

  // Очищаем и создаем новые варианты ответов
  DomElements.optionsContainer.innerHTML = "";
  question.options.forEach((option, index) => {
    const optionElement = createOptionElement(option, index);
    DomElements.optionsContainer.appendChild(optionElement);
  });

  // Обновляем прогресс
  updateProgress();
}

/**
 * Создает DOM-элемент варианта ответа
 */
function createOptionElement(option, index) {
  const optionId = `q${AppState.currentQuestionIndex + 1}_option${index + 1}`;

  const label = document.createElement("label");
  label.className = "option";
  label.htmlFor = optionId;

  const input = document.createElement("input");
  input.type = "radio";
  input.name = `q${AppState.currentQuestionIndex + 1}`;
  input.value = option.value;
  input.id = optionId;

  label.appendChild(input);
  label.appendChild(document.createTextNode(option.text));

  return label;
}

/**
 * Загружает вопросы из JSON-файла
 */
async function loadTest(testId) {
  try {
    const response = await fetch(
      `${AppConfig.basePath}tests/${testId}/questions.json`
    );
    // const response = await fetch(
    //    `${window.location.origin}/My-website-with-tests/tests/${testId}/questions.json`
    // );
    if (!response.ok) throw new Error("Тест не найден");

    const testData = await response.json();
    AppState.questions = testData.questions;
    AppState.testName = testData.testName;
    AppState.userAnswers = Array(AppState.questions.length).fill("");

    return true;
  } catch (error) {
    console.error("Ошибка загрузки теста:", error);
    showError("Не удалось загрузить вопросы теста");
    return false;
  }
}

/**
 * Обновляет индикатор прогресса
 */
function updateProgress() {
  DomElements.questionNumber.textContent = AppState.currentQuestionIndex + 1;
  DomElements.numberOfQuestion.textContent = AppState.questions.length;
}

// ==============================================
// 5. НАВИГАЦИЯ ПО ТЕСТУ
// ==============================================

/**
 * Обрабатывает переход к следующему вопросу
 */
function handleNextQuestion() {
  if (!this.classList.contains("active")) return;

  if (AppState.currentQuestionIndex < AppState.questions.length - 1) {
    AppState.currentQuestionIndex++;
    updateQuestion();
    toggleNavigationButtons();
  } else {
    showResults();
  }
}

/**
 * Обрабатывает переход к предыдущему вопросу
 */
function handlePrevQuestion(event) {
  event.preventDefault();

  if (AppState.currentQuestionIndex > 0) {
    AppState.currentQuestionIndex--;
    updateQuestion();
    toggleNavigationButtons();
  }
}

/**
 * Сбрасывает тест
 */
function resetTest(event) {
  event.preventDefault();

  AppState.currentQuestionIndex = 0;
  AppState.score = 0;
  AppState.userAnswers = Array(AppState.questions.length).fill("");

  updateQuestion();
  toggleNavigationButtons(true);
}

/**
 * Переключает состояние кнопок навигации
 */
function toggleNavigationButtons(isReset = false) {
  DomElements.nextButtons.forEach((btn) => {
    btn.classList.toggle(
      "active",
      !isReset && AppState.userAnswers[AppState.currentQuestionIndex] !== ""
    );
  });

  DomElements.prevButtons.forEach((btn) => {
    btn.classList.toggle("active", AppState.currentQuestionIndex > 0);
  });
}

// ==============================================
// 6. РЕЗУЛЬТАТЫ ТЕСТА
// ==============================================

/**
 * Обновляет статистику
 */
function updateTestStats(testId, userScore) {
  const key = `test-stats-${testId}`;
  const stats = JSON.parse(localStorage.getItem(key)) || {
    totalAttempts: 0,
    scoreRanges: {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-99': 0,
      '100': 0
    },
    averageScore: 0
  };

  // Обновляем данные
  stats.totalAttempts++;
  stats.averageScore = (stats.averageScore * (stats.totalAttempts - 1) + userScore) / stats.totalAttempts;
  
  const range = 
    userScore === 100 ? '100' :
    userScore <= 25 ? '0-25' :
    userScore <= 50 ? '26-50' :
    userScore <= 75 ? '51-75' : '76-99';
  stats.scoreRanges[range]++;
  
  // Сохраняем обновленную статистику
  localStorage.setItem(key, JSON.stringify(stats));
}

/**
 * Вычисляет и отображает результаты теста
 */
function showResults() {
  const { totalScore, maxScore, results } = calculateResults();
  const percentageScore = (totalScore / maxScore) * 100;

  saveResults(percentageScore, results);
  updateTestStats(AppState.currentTestId, percentageScore);
  window.location.href = "./results.html";
}

/**
 * Вычисляет результаты теста
 */
function calculateResults() {
  let totalScore = 0;
  let maxScore = 0;
  const results = [];

  AppState.questions.forEach((question, index) => {
    const correctOption = question.options[question.correctAnswer];
    maxScore += correctOption.value;

    if (AppState.userAnswers[index] === correctOption.value) {
      totalScore += correctOption.value;
    }

    results.push({
      question: question.question,
      image: question.image,
      // image: `${AppConfig.basePath}tests/${AppState.currentTestId}/${question.image}`,
      userAnswer:
        question.options.find(
          (opt) => opt.value === AppState.userAnswers[index]
        )?.text || "No answer",
      correctAnswer: correctOption.text,
      isCorrect: AppState.userAnswers[index] === correctOption.value,
    });
  });

  return { totalScore, maxScore, results };
}

/**
 * Сохраняет результаты в localStorage
 */
function saveResults(percentageScore, results) {
  const resultsData = {
    score: percentageScore.toFixed(2),
    questions: results,
    testId: AppState.currentTestId
  };

  localStorage.setItem(AppConfig.localStorageKey, JSON.stringify(resultsData));
}

// ==============================================
// 7. НАВИГАЦИОННОЕ МЕНЮ
// ==============================================

/**
 * Обновляет позицию меню
 */
function updateMenuPosition() {
  const headerHeight = DomElements.header.offsetHeight;
  DomElements.navList.style.top = `${headerHeight}px`;
}

/**
 * Переключает видимость меню
 */
function toggleNavMenu(e) {
  e.stopPropagation();
  updateMenuPosition();
  DomElements.navList.classList.toggle("active");
}

/**
 * Закрывает меню при клике вне его
 */
function handleClickOutside(event) {
  if (
    window.innerWidth < 768 &&
    DomElements.navList.classList.contains("active") &&
    !DomElements.navList.contains(event.target) &&
    !DomElements.navToggle.contains(event.target)
  ) {
    DomElements.navList.classList.remove("active");
  }
}

/**
 * Обрабатывает изменение размера окна
 */
function handleResize() {
  if (window.innerWidth >= 768) {
    DomElements.navList.classList.remove("active");
    DomElements.navList.style.top = "";
  } else {
    updateMenuPosition();
  }
}

// ==============================================
// 8. ОБРАБОТЧИКИ СОБЫТИЙ
// ==============================================

/**
 * Инициализирует обработчики событий
 */
function initEventListeners() {
  // Навигация по тесту
  DomElements.nextButtons.forEach((btn) =>
    btn.addEventListener("click", handleNextQuestion)
  );
  DomElements.prevButtons.forEach((btn) =>
    btn.addEventListener("click", handlePrevQuestion)
  );
  DomElements.backButtonNav.addEventListener("click", handlePrevQuestion);
  DomElements.resetButton.addEventListener("click", resetTest);

  // Выбор ответа
  DomElements.optionsContainer.addEventListener("change", function (event) {
    if (event.target.type === "radio") {
      AppState.userAnswers[AppState.currentQuestionIndex] = parseInt(
        event.target.value
      );
      updateOptionStyles(event.target);
      toggleNavigationButtons();
    }
  });

  // Навигационное меню
  DomElements.navToggle.addEventListener("click", toggleNavMenu);
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleResize);
}

/**
 * Обновляет стили выбранного варианта
 */
function updateOptionStyles(selectedInput) {
  // Снимаем выделение со всех вариантов
  DomElements.optionsContainer.querySelectorAll(".option").forEach((option) => {
    option.classList.remove("active");
  });

  // Выделяем выбранный вариант
  selectedInput.parentNode.classList.add("active");
}

// ==============================================
// 9. ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ==============================================

/**
 * Инициализирует приложение
 */
async function initApp() {
  // Проверяем наличие testId
  if (!AppState.currentTestId) {
    showError("Тест не выбран");
    return;
  }
  // Загружаем тест перед инициализацией
  const loaded = await loadTest(AppState.currentTestId);
  if (!loaded) {
    showError("Не удалось загрузить тест");
    return;
  }
  console.log(AppState.currentTestId);
  console.log(AppState.testName);

  // Обновляем название теста в интерфейсе
  document.querySelector(".test-name").textContent = AppState.testName;

  initEventListeners();
  updateQuestion();
  updateProgress();
  updateMenuPosition();
}

// Запуск приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", initApp);
