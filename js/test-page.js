/**
 * TEST PAGE CONTROLLER
 */

// ==============================================
// 1. КОНФИГУРАЦИЯ И ИНИЦИАЛИЗАЦИЯ
// ==============================================

const AppConfig = {
  basePath: window.location.hostname === "twinklingfirefly4.github.io" ? '/' : './',
  localStorageKey: 'testResults'
};

// ==============================================
// 2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ==============================================

const AppState = {
  currentQuestionIndex: 0,
  userAnswers: [],
  score: 0,
  questions: [
    {
      question: "Что такое программирование?",
      image: `${AppConfig.basePath}my-img/small_img/q1.webp`,
      options: [
        { text: "Процесс создания компьютерной программы", value: 1 },
        { text: "Процесс сборки компьютера", value: 0 },
        { text: "Процесс установки винды", value: 0 },
        { text: "Способность понимать индуса из видео на ютубе", value: 0 }
      ],
      correctAnswer: 0
    },
    {
      question: "Вам интересно решать логические задачи?",
      image: `${AppConfig.basePath}my-img/small_img/logic.jpg`,
      options: [
        { text: "Да", value: 1 },
        { text: "Нет", value: 0 },
        { text: "Затрудняюсь ответить", value: 0.2 },
        { text: "В детстве бывало решал(а)", value: 0.3 }
      ],
      correctAnswer: 0
    } /*,
    {
      question: "Что больше всего подходит под определение “не гвозди”?",
      image: `${basePath}/my-img/small_img/gvozdi.jpg`,
      options: [
        { text: "Инструменты", value: 0 },
        { text: "Все, что не является гвоздем", value: 1 },
        { text: "Молоток", value: 0 },
      ],
      correctAnswer: 1,
    },
    {
      question: "Чего больше - не птиц или не голубей?",
      image: `${basePath}/my-img/small_img/golub.jpg`,
      options: [
        { text: "Не птиц", value: 0 },
        { text: "Не голубей", value: 1 },
        { text: "В вопросе ошибка", value: 0 },
        { text: "Странные какие-то вопросы ", value: 0 },
      ],
      correctAnswer: 1,
    },
    {
      question: "Что такое конъюнкция?",
      image: `${basePath}/my-img/small_img/green-dots-in-row.jpg`,
      options: [
        { text: "Функция для обработки строк", value: 0 },
        { text: "Логическое сложение", value: 0 },
        { text: "Логическое умножение", value: 1 },
        { text: "Это что-то из курса мат логики", value: 0.2 },
      ],
      correctAnswer: 2,
    },
    {
      question:
        "Сколько памяти ОЗУ выделяется под объект, который не содержит в себе никаких данных? (GCC)",
      image: `${basePath}/my-img/small_img/green-dots-in-row.jpg`,
      options: [
        { text: "16 бит", value: 0 },
        { text: "32 бита", value: 1 },
        { text: "16 байт", value: 0 },
        { text: "64 бита", value: 0 },
        { text: "8 бит", value: 0 },
        { text: "Нисколько, объект будет автоматически уничтожен", value: 0 },
      ],
      correctAnswer: 1,
    },
    {
      question: "Что такое IDE в программировании?",
      image: `${basePath}/my-img/small_img/hacker.webp`,
      options: [
        { text: "Язык программирования", value: 0 },
        { text: "Интерфейс разработки приложений", value: 0 },
        { text: "Среда разработки программного обеспечения", value: 1 },
        { text: "Библиотека функций", value: 0 },
      ],
      correctAnswer: 2,
    },
    {
      question:
        "Какому числу десятичной системе счисления соответствует число 100 в двоичной?",
      image: `${basePath}/my-img/small_img/one-zero.webp`,
      options: [
        { text: "4", value: 1 },
        { text: "0", value: 0 },
        { text: "32", value: 0 },
        { text: "10", value: 0 },
        { text: "8", value: 0 },
        { text: "16", value: 0 },
      ],
      correctAnswer: 0,
    },
    {
      question: "Поддерживает ли язык C# множественное наследование?",
      image: `${basePath}/my-img/small_img/heritage.png`,
      options: [
        { text: "Да", value: 0 },
        { text: "Нет", value: 1 },
        { text: "Скорее нет, чем да", value: 0.4 },
        { text: "Наверное да?", value: 0 },
        { text: "Да нет же... (сомневаюсь)", value: 0.2 },
      ],
      correctAnswer: 1,
    },
    {
      question: "Практическое применение бинарного поиска?",
      image: `${basePath}/my-img/small_img/graphs.jpg`,
      options: [
        {
          text: "Выдача кредитов и микро-займов. Расчет платежеспособности клиента.",
          value: 0,
        },
        {
          text: "Начисление зарплат сотрудникам исходя из их рабочего графика",
          value: 0,
        },
        {
          text: "Выявление потенциально пригодных для жизни космических систем.",
          value: 1,
        },
      ],
      correctAnswer: 2,
    },
    {
      question: "Дерево это?",
      image: `${basePath}/my-img/small_img/like-tree.jpg`,
      options: [
        { text: "Растение", value: 0 },
        { text: "Это дерево(очевидно же -_-)", value: 0 },
        { text: "Разновидность компьютерных программ", value: 0 },
        { text: "Граф", value: 1 },
        { text: "Это вообще относится к программированию?", value: 0 },
        { text: "Язык программирования", value: 0 },
      ],
      correctAnswer: 3,
    },
    {
      question: "Разработкой алгоритма решения задачи называется:",
      image: `${basePath}/my-img/small_img/technology-green-lines-background.jpg`,
      options: [
        {
          text: "точное описание данных, условий задачи и ее целого решения",
          value: 0,
        },
        {
          text: "сведение задачи к математической модели, для которой известен метод решения",
          value: 0,
        },
        {
          text: "определение последовательности действий, ведущих к получению результатов",
          value: 1,
        },
      ],
      correctAnswer: 2,
    },
    {
      question: "Для чего нужен оператор continue в цикле?",
      image: `${basePath}/my-img/small_img/graphs.jpg`,
      options: [
        {
          text: "Позволяет продолжить работу после применения оператора return",
          value: 0,
        },
        {
          text: "Позволяет продолжить работу программы в случае возникновения ошибки или исключения",
          value: 0,
        },
        {
          text: "Позволяет сразу перейти в конец тела цикла, пропуская весь код, который находится под ним",
          value: 1,
        },
      ],
      correctAnswer: 2,
    },
    {
      question: "Что/кто такое flush?",
      image: `${basePath}/my-img/small_img/flash.webp`,
      options: [
        { text: "Запись в файл", value: 0 },
        { text: "Чтение файла", value: 0 },
        { text: "Освобождение буфера", value: 1 },
        { text: "Самый быстрый человек на Земле", value: 0 },
      ],
      correctAnswer: 2,
    },
    {
      question: "Существует ли в С++ множественное наследование?",
      image: `${basePath}/my-img/small_img/neon-cactus.jpg`,
      options: [
        { text: "Да", value: 1 },
        { text: "Нет", value: 0 },
        { text: "Разве этого вопроса уже не было?", value: 0 },
      ],
      correctAnswer: 0,
    },
    {
      question: "Что такое полиморфизм?",
      image: `${basePath}/my-img/small_img/mahito.jpg`,
      options: [
        {
          text: "Сокрытие данных от прямого воздействия из вне. Обычно реализуется с помощью модификаторов доступа. ",
          value: 0,
        },
        {
          text: "Возможность унаследоваться сразу от множества классов.",
          value: 0,
        },
        {
          text: "Возможность объектов с одинаковой спецификацией иметь различную реализацию",
          value: 1,
        },
        { text: "Ты придумал это слово--", value: 0 },
      ],
      correctAnswer: 2,
    },
    {
      question: 'Что означает термин "рекурсия" в программировании?',
      image: `${basePath}/my-img/small_img/for-recursion.jpg`,
      options: [
        { text: "Ошибка в программе", value: 0 },
        { text: "Структура данных для хранения информации", value: 0 },
        { text: "Программа, выполняющая одно действие", value: 0 },
        { text: "Процесс вызова функции из самой себя", value: 1 },
      ],
      correctAnswer: 3,
    },
    {
      question: 'Какая операция выполняется в цикле "for"?',
      image: `${basePath}/my-img/small_img/password.jpg`,
      options: [
        { text: "Условие", value: 0 },
        { text: "Присваивание", value: 0 },
        { text: "Вывод", value: 0 },
        { text: "Итерация", value: 1 },
      ],
      correctAnswer: 3,
    },*/

  ]
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
  header: document.querySelector(".main-nav")
};

// ==============================================
// 4. ОСНОВНЫЕ ФУНКЦИИ ТЕСТА
// ==============================================

/**
 * Обновляет интерфейс текущего вопроса
 */
function updateQuestion() {
  const question = AppState.questions[AppState.currentQuestionIndex];
  
  // Обновляем вопрос и изображение
  DomElements.questionElement.textContent = question.question;
  DomElements.imageElement.src = question.image;
  
  // Очищаем и создаем новые варианты ответов
  DomElements.optionsContainer.innerHTML = '';
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
  DomElements.nextButtons.forEach(btn => {
    btn.classList.toggle('active', !isReset && AppState.userAnswers[AppState.currentQuestionIndex] !== "");
  });
  
  DomElements.prevButtons.forEach(btn => {
    btn.classList.toggle('active', AppState.currentQuestionIndex > 0);
  });
}

// ==============================================
// 6. РЕЗУЛЬТАТЫ ТЕСТА
// ==============================================

/**
 * Вычисляет и отображает результаты теста
 */
function showResults() {
  const { totalScore, maxScore, results } = calculateResults();
  const percentageScore = (totalScore / maxScore) * 100;
  
  saveResults(percentageScore, results);
  window.location.href = "results.html";
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
      userAnswer: question.options.find(opt => opt.value === AppState.userAnswers[index])?.text || "No answer",
      correctAnswer: correctOption.text,
      isCorrect: AppState.userAnswers[index] === correctOption.value
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
    questions: results
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
  if (window.innerWidth < 768 && 
      DomElements.navList.classList.contains("active") && 
      !DomElements.navList.contains(event.target) && 
      !DomElements.navToggle.contains(event.target)) {
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
  DomElements.nextButtons.forEach(btn => btn.addEventListener("click", handleNextQuestion));
  DomElements.prevButtons.forEach(btn => btn.addEventListener("click", handlePrevQuestion));
  DomElements.backButtonNav.addEventListener("click", handlePrevQuestion);
  DomElements.resetButton.addEventListener("click", resetTest);
  
  // Выбор ответа
  DomElements.optionsContainer.addEventListener("change", function(event) {
    if (event.target.type === "radio") {
      AppState.userAnswers[AppState.currentQuestionIndex] = parseInt(event.target.value);
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
  DomElements.optionsContainer.querySelectorAll(".option").forEach(option => {
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
function initApp() {
  initEventListeners();
  updateQuestion();
  updateProgress();
  updateMenuPosition();
}

// Запуск приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", initApp);