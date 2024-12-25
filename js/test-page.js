// Variable Declarations
const optionsContainer = document.querySelector(".options");
const imageElement = document.querySelector(".image img");
const questionElement = document.querySelector(".question");
const nextQuestionButton = document.querySelector(".next-question");
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// Questions Array
//ПОМЕНЯТЬ КАРТИНКИ
const questions = [
  {
    question: "Что такое программирование?",
    image: "../my-img/small_img/q1.webp",
    options: [
      { text: "Процесс создания компьютерной программы", value: 1 },
      { text: "Процесс сборки компьютера", value: 0 },
      { text: "Процесс установки винды", value: 0 },
      { text: "Способность понимать индуса из видео на ютубе", value: 0 },
    ],
    correctAnswer: 0,
  },
  {
    question: "Вам интересно решать логические задачи?",
    image: "../my-img/small_img/logic.jpg",
    options: [
      { text: "Да", value: 1 },
      { text: "Нет", value: 0 },
      { text: "Затрудняюсь ответить", value: 0.2 },
      { text: "В детстве бывало решал(а)", value: 0.3 },
    ],
    correctAnswer: 0,
  },
  {
    question: "Что больше всего подходит под определение “не гвозди”?",
    image: "../my-img/small_img/gvozdi.jpg",
    options: [
      { text: "Инструменты", value: 0 },
      { text: "Все, что не является гвоздем", value: 1 },
      { text: "Молоток", value: 0 },
    ],
    correctAnswer: 1,
  },
  {
    question: "Чего больше - не птиц или не голубей?",
    image: "../my-img/small_img/golub.jpg",
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
    image: "../my-img/small_img/green-dots-in-row.jpg",
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
    image: "../my-img/small_img/green-dots-in-row.jpg",
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
    image: "../my-img/small_img/hacker.webp",
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
    image: "../my-img/small_img/one-zero.webp",
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
    image: "../my-img/small_img/heritage.png",
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
    image: "../my-img/small_img/graphs.jpg",
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
    image: "../my-img/small_img/like-tree.jpg",
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
    image: "../my-img/small_img/technology-green-lines-background.jpg",
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
    image: "../my-img/small_img/graphs.jpg",
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
    image: "../my-img/small_img/flash.webp",
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
    image: "../my-img/small_img/neon-cactus.jpg",
    options: [
      { text: "Да", value: 1 },
      { text: "Нет", value: 0 },
      { text: "Разве этого вопроса уже не было?", value: 0 },
    ],
    correctAnswer: 0,
  },
  {
    question: "Что такое полиморфизм?",
    image: "../my-img/small_img/mahito.jpg",
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
    image: "../my-img/small_img/for-recursion.jpg",
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
    image: "../my-img/small_img/password.jpg",
    options: [
      { text: "Условие", value: 0 },
      { text: "Присваивание", value: 0 },
      { text: "Вывод", value: 0 },
      { text: "Итерация", value: 1 },
    ],
    correctAnswer: 3,
  },
];

// Initialize userAnswers
userAnswers = Array(questions.length).fill("");

// Functions Definitions

function updateQuestion() {
  const question = questions[currentQuestionIndex];
  questionElement.textContent = question.question;
  imageElement.src = question.image;
  optionsContainer.innerHTML = "";

  question.options.forEach((option, index) => {
    const newOption = document.createElement("label");
    newOption.classList.add("option");
    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "q" + (currentQuestionIndex + 1);
    radioInput.value = option.value;
    newOption.appendChild(radioInput);
    newOption.appendChild(document.createTextNode(option.text));
    optionsContainer.appendChild(newOption);
  });

  // Set the progress indicator
  document.querySelector(".questionNumber").textContent =
    currentQuestionIndex + 1;
}

function showResults() {
  let totalScore = 0;
  let maxScore = 0;
  questions.forEach((question, index) => {
    const correctOption = question.options[question.correctAnswer];
    maxScore += correctOption.value; // Sum of all correct values
    if (userAnswers[index] === correctOption.value) {
      totalScore += correctOption.value; // Sum of correct user answers
    }
  });
  // Calculate percentage score
  const percentageScore = (totalScore / maxScore) * 100;
  // Prepare data to pass to the results page
  const resultsData = {
    score: percentageScore.toFixed(2),
    questions: questions.map((question, index) => ({
      question: question.question,
      image: question.image,
      userAnswer:
        question.options.find((option) => option.value === userAnswers[index])
          ?.text || "No answer",
      correctAnswer: question.options[question.correctAnswer].text,
      isCorrect:
        userAnswers[index] === question.options[question.correctAnswer].value,
    })),
  };
  // Convert data to a JSON string
  // const resultsDataString = encodeURIComponent(JSON.stringify(resultsData));

  // // Redirect to results page with data
  // window.location.href = `results.html?data=${resultsDataString}`;
  // Сохраняем данные в LocalStorage
  localStorage.setItem("testResults", JSON.stringify(resultsData));

  // Перенаправляем на страницу результатов
  window.location.href = "results.html";
}

// Next question button
nextQuestionButton.addEventListener("click", function () {
  if (nextQuestionButton.classList.contains("next-question-active")) {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      updateQuestion();
      nextQuestionButton.classList.remove("next-question-active");
    } else {
      showResults();
    }
  }
});
// Back button
const backButton = document.querySelector(".nav-right a:nth-of-type(1)");
backButton.addEventListener("click", function (event) {
  event.preventDefault();
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    updateQuestion();
    nextQuestionButton.classList.remove("next-question-active");
  }
});

// Reset button
const resetButton = document.querySelector(".nav-right a:nth-of-type(2)");
resetButton.addEventListener("click", function (event) {
  event.preventDefault();
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = Array(questions.length).fill("");
  updateQuestion();
  nextQuestionButton.classList.remove("next-question-active");
});

// Option selection
optionsContainer.addEventListener("change", function (event) {
  if (event.target.type === "radio") {
    const selectedOption = event.target;
    userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    // Remove active class from all options
    const allOptions = optionsContainer.querySelectorAll(".option");
    allOptions.forEach((option) => {
      option.classList.remove("active");
    });
    // Add active class to the selected option
    selectedOption.parentNode.classList.add("active");
    // Enable next question button
    nextQuestionButton.classList.add("next-question-active");
  }
});

// Initialization
window.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".numberOfQuestion").textContent = questions.length;
  updateQuestion();
});
