import supabase from "./supabase-init.js";
import { authState } from "./auth-state.js";

document.addEventListener("DOMContentLoaded", () => {
  let questionsCount = 1;
  const maxQuestions = 20; // Лимит вопросов

  // Добавление нового вопроса
  document.getElementById("addQuestionBtn").addEventListener("click", () => {
    if (questionsCount >= maxQuestions) {
      alert(`Максимум ${maxQuestions} вопросов`);
      return;
    }

    questionsCount++;
    addQuestionForm(questionsCount);
  });

  // Сохранение теста
  document.getElementById("saveTestBtn").addEventListener("click", saveTest);

  // Добавляем первый вопрос автоматически
  addQuestionForm(1);
});

function addQuestionForm(questionNum) {
  const container = document.getElementById("questionsContainer");
  const uniqueQid = Date.now(); // Используем timestamp для уникальности

  const questionHTML = `
      <div class="question-form" data-qid="${uniqueQid}">
        <h3>Вопрос #${questionNum}</h3>
        
        <label>Текст вопроса:</label>
        <input type="text" class="question-text" required maxlength="500">
        
        <label>URL изображения (необязательно):</label>
        <input type="url" class="question-image" placeholder="https://example.com/image.jpg">
        
        <div class="options-container">
          <!-- Варианты ответов будут здесь -->
        </div>
        
        <button type="button" class="add-option-btn">+ Добавить вариант</button>
        <button type="button" class="remove-question-btn">Удалить вопрос</button>
      </div>
    `;

  container.insertAdjacentHTML("beforeend", questionHTML);

  // Обработчики для нового вопроса
  const questionDiv = container.lastElementChild;
  questionDiv
    .querySelector(".add-option-btn")
    .addEventListener("click", addOption);
  questionDiv
    .querySelector(".remove-question-btn")
    .addEventListener("click", removeQuestion);

  // Добавляем 2 варианта ответа по умолчанию
  addOption({ target: questionDiv.querySelector(".add-option-btn") });
  addOption({ target: questionDiv.querySelector(".add-option-btn") });
}

function addOption(e) {
  const questionForm = e.target.closest(".question-form");
  const optionsContainer = questionForm.querySelector(".options-container");
  const questionNum = questionForm.dataset.qid;

  const optionHTML = `
      <div class="option">
        <input type="text" class="option-text" placeholder="Текст варианта" required maxlength="200">
        <label class="correct-option">
          <input type="radio" name="correct-option-${questionNum}" class="is-correct"> Верный ответ
        </label>
        <button type="button" class="remove-option-btn">×</button>
      </div>
    `;

  optionsContainer.insertAdjacentHTML("beforeend", optionHTML);
  const newOption = optionsContainer.lastElementChild;

  // Обработчик для радио-кнопок
  newOption
    .querySelector(".is-correct")
    .addEventListener("change", function () {
      if (this.checked) {
        const allOptions = optionsContainer.querySelectorAll(".is-correct");
        allOptions.forEach((opt) => {
          if (opt !== this) opt.checked = false;
        });
      }
    });

  // Обработчик удаления
  newOption
    .querySelector(".remove-option-btn")
    .addEventListener("click", removeOption);

  // Автоматически выбираем первый вариант как правильный, если это первый вариант
  if (optionsContainer.children.length === 1) {
    newOption.querySelector(".is-correct").checked = true;
  }
}

function removeQuestion(e) {
  if (document.querySelectorAll(".question-form").length <= 1) {
    alert("Тест должен содержать хотя бы один вопрос");
    return;
  }

  e.target.closest(".question-form").remove();
  updateQuestionNumbers();
}

function updateQuestionNumbers() {
  document.querySelectorAll(".question-form").forEach((form, index) => {
    form.querySelector("h3").textContent = `Вопрос #${index + 1}`;
  });
}

function removeOption(e) {
  e.preventDefault();
  const optionDiv = e.target.closest(".option");
  const optionsContainer = optionDiv.parentElement;

  // Проверяем, что останется минимум 2 варианта
  if (optionsContainer.children.length <= 2) {
    alert("Каждый вопрос должен содержать минимум 2 варианта ответа");
    return;
  }

  // Если удаляем правильный ответ, отмечаем первый оставшийся как правильный
  const isRemovingCorrect = optionDiv.querySelector(".is-correct").checked;
  optionDiv.remove();

  if (isRemovingCorrect && optionsContainer.children.length > 0) {
    optionsContainer.firstElementChild.querySelector(
      ".is-correct"
    ).checked = true;
  }
}

async function saveTest() {
  // Получаем данные пользователя
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    alert("Для создания теста необходимо авторизоваться");
    return;
  }

  // Основные данные теста
  const testData = {
    title: document.getElementById("testTitle").value.trim(),
    description: document.getElementById("testDescription").value.trim(),
    preview_image: document.getElementById("testCover").value.trim(),
    difficulty: document.getElementById("testDifficulty").value,
    is_public: document.getElementById("testAccess").value === "public",
    user_id: user.id,
  };

  // Собираем вопросы и варианты ответов
  const questions = [];
  const questionForms = document.querySelectorAll(".question-form");

  for (const [index, questionForm] of questionForms.entries()) {
    const question = {
      question_text: questionForm.querySelector(".question-text").value.trim(),
      image_url: questionForm.querySelector(".question-image").value.trim(),
      question_order: index + 1,
      options: [],
    };

    // Собираем варианты ответов
    const options = questionForm.querySelectorAll(".option");
    let correctOptionsCount = 0;

    for (const [optIndex, option] of options.entries()) {
      const isCorrect = option.querySelector(".is-correct").checked;
      if (isCorrect) correctOptionsCount++;

      question.options.push({
        option_text: option.querySelector(".option-text").value.trim(),
        is_correct: isCorrect,
        score_value: isCorrect ? 1 : 0, // Можно настроить систему баллов
        option_order: optIndex + 1,
      });
    }

    // Проверка на один правильный ответ
    if (correctOptionsCount !== 1) {
      alert(`Вопрос #${index + 1} должен иметь ровно один верный ответ`);
      return;
    }

    questions.push(question);
  }

  // Валидация данных
  if (!validateTest(testData, questions)) return;

  try {
    // Начинаем транзакцию
    const { data: test, error: testError } = await supabase
      .from("tests")
      .insert(testData)
      .select()
      .single();

    if (testError) throw testError;

    // Сохраняем вопросы
    for (const question of questions) {
      const { data: dbQuestion, error: questionError } = await supabase
        .from("questions")
        .insert({
          test_id: test.id,
          question_text: question.question_text,
          image_url: question.image_url || null,
          question_order: question.question_order,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Сохраняем варианты ответов
      for (const option of question.options) {
        const { error: optionError } = await supabase.from("options").insert({
          question_id: dbQuestion.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          score_value: option.score_value,
          option_order: option.option_order,
        });

        if (optionError) throw optionError;
      }
    }

    alert("Тест успешно создан!");
    window.location.href = `./list-of-tests.html`;
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    alert(`Ошибка при сохранении теста: ${err.message}`);
  }
}

function validateTest(testData, questions) {
  // Проверка основных данных
  if (!testData.title) {
    alert("Введите название теста");
    return false;
  }

  if (testData.title.length > 100) {
    alert("Название теста должно быть не длиннее 100 символов");
    return false;
  }

  if (testData.preview_image && !isValidImageUrl(testData.preview_image)) {
    alert("Укажите корректный URL изображения");
    return false;
  }

  // Проверка вопросов
  if (questions.length === 0) {
    alert("Добавьте хотя бы один вопрос");
    return false;
  }

  for (const [index, question] of questions.entries()) {
    if (!question.question_text) {
      alert(`Введите текст вопроса #${index + 1}`);
      return false;
    }

    if (question.options.length < 2) {
      alert(`Вопрос #${index + 1} должен иметь минимум 2 варианта ответа`);
      return false;
    }

    if (question.image_url && !isValidImageUrl(question.image_url)) {
      alert(`Некорректный URL изображения для вопроса #${index + 1}`);
      return false;
    }
  }

  return true;
}

function isValidImageUrl(url) {
  return /^https?:\/\/.+/.test(url);
}
