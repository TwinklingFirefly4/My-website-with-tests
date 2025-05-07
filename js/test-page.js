/**
 * TEST PAGE CONTROLLER
 */

// ==============================================
// 1. КОНФИГУРАЦИЯ И ИНИЦИАЛИЗАЦИЯ
// ==============================================

const AppConfig = {
  basePath: window.location.hostname.includes("github.io")
    ? `${window.location.origin}/My-website-with-tests/`
    : "/", // Для локального сервера используем корень
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
 * Загружает вопросы из базы данных
 */
async function loadTest(testId) {
  try {
    // Загружаем тест с вопросами и вариантами одним запросом
    const { data, error } = await supabase
      .from("tests")
      .select(
        `
        title,
        questions:questions(
          id,
          question_text,
          image_url,
          options:options(
            id,
            option_text,
            is_correct,
            score_value
          )
        )
      `
      )
      .eq("id", testId)
      .order("question_order", { foreignTable: "questions" })
      .order("option_order", { foreignTable: "questions.options" })
      .single();

    if (error) throw error;

    // Форматируем данные
    const formattedQuestions = data.questions.map((q) => ({
      question: q.question_text,
      image: q.image_url,
      options: q.options.map((o, idx) => ({
        text: o.option_text,
        value: o.score_value,
        isCorrect: o.is_correct,
      })),
      correctAnswer: q.options.findIndex((o) => o.is_correct),
    }));

    AppState.questions = formattedQuestions;
    AppState.testName = data.title;
    AppState.userAnswers = Array(formattedQuestions.length).fill("");

    return true;
  } catch (error) {
    console.error("Ошибка загрузки теста:", error);
    showError("Не удалось загрузить тест");
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
 * Вычисляет и отображает результаты теста
 */
function showResults() {
  const { totalScore, maxScore, results } = calculateResults();
  const percentageScore = (totalScore / maxScore) * 100;

  // В функции showResults():
  saveTestResults(percentageScore, results)
    .then((savedResult) => {
      console.log("Результат сохранён в Supabase:", savedResult);
      window.location.href = `./results.html?test_id=${savedResult.test_id}&result_id=${savedResult.id}`;
    })
    .catch((error) => {
      console.error("Ошибка сохранения:", error);
      // Fallback в localStorage
      const resultData = {
        score: percentageScore,
        questions: results,
        testId: AppState.currentTestId,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("testResults", JSON.stringify(resultData));
      window.location.href = `./results.html?test_id=${AppState.currentTestId}`;
    });
}

/**
 * Сохраняет результаты в localStorage
 */
function saveResults(percentageScore, results) {
  const resultsData = {
    score: percentageScore.toFixed(2),
    questions: results,
    testId: AppState.currentTestId,
  };

  localStorage.setItem(AppConfig.localStorageKey, JSON.stringify(resultsData));
}

async function saveTestResults(score, results) {
  try {
    // 1. Получаем сообщение для результата
    const roundedScore = Math.round(score); // Округляем до целого
    const { data: message, error: messageError } = await supabase
      .from("result_messages")
      .select("*")
      .lte("min_score", score) // score >= min_score
      .gte("max_score", score) // score <= max_score
      .single();

    // const { data: message, error: messageError } = await supabase
    //   .from("result_messages")
    //   .select("*")
    //   .gte("min_score", score)
    //   .lte("max_score", score)
    //   .single();

    if (messageError || !message) {
      console.log(score);
      console.log(roundedScore);
      console.error("Ошибка при получении message:", messageError);
      throw new Error("Не найдено сообщение для результата");
    }
    console.log("::");
    console.log(message);
    // 2. Получаем пользователя (может быть null)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) console.warn("Пользователь не авторизован:", userError);

    // 3. Формируем данные для вставки
    const resultData = {
      user_id: user?.id || null,
      test_id: AppState.currentTestId,
      score: score,
      result_message_id: message.id,
      details: {
        questions: results.map((r) => ({
          question: r.question,
          image: r.image,
          user_answer: r.userAnswer,
          correct_answer: r.correctAnswer,
          is_correct: r.isCorrect,
        })),
      },
    };

    console.log("Данные для сохранения:", resultData); // Важно для отладки!

    // 4. Вставляем данные
    const { data, error: insertError } = await supabase
      .from("results")
      .insert(resultData)
      .select("id, test_id")
      .single();

    if (insertError) {
      console.error("Ошибка вставки:", insertError);
      throw insertError;
    }

    console.log("Успешно сохранено:", data);
    await updateTestStats(AppState.currentTestId, score);
    return data;
  } catch (error) {
    console.error("Критическая ошибка в saveTestResults:", error);
    throw error; // Пробрасываем для обработки в showResults()
  }
}

/**
 * Обновляет статистику
 */
async function updateTestStats(testId, score) {
  try {
    const range =
      score === 100
        ? "100"
        : score >= 76
        ? "76-99"
        : score >= 51
        ? "51-75"
        : score >= 26
        ? "26-50"
        : "0-25";

    console.log("Обновление статистики:", { testId, score, range });

    const { error } = await supabase.rpc("update_test_stats", {
      p_test_id: testId,
      p_range: range,
      p_score: score,
    });

    if (error) throw error;
    console.log("Статистика обновлена успешно");
  } catch (error) {
    console.error("Ошибка в updateTestStats:", error);
    throw error; // Пробрасываем ошибку, если нужно прервать цепочку
  }
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
