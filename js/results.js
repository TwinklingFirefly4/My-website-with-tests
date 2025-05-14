// Get the data from the URL query parameter
// const params = new URLSearchParams(window.location.search);
// const dataString = params.get("data");
// const resultsData = JSON.parse(decodeURIComponent(dataString));
import supabase from "./supabase-init.js";
import { authState } from "./auth-state.js";
// // Для отладки
// console.log("Supabase initialized:", supabase);
// console.log("AuthState initialized:", authState);
// =============================================================================
// 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ РЕЗУЛЬТАТОВ
// =============================================================================
/**
 * Получает данные результатов теста из LocalStorage
 */
const resultsData = JSON.parse(localStorage.getItem("testResults"));

// Настройка кнопки "К тесту"
const basePath = window.location.hostname.includes("github.io")
  ? `${window.location.origin}/My-website-with-tests/`
  : "./";
document
  .getElementById("returnToTestBtn")
  .addEventListener("click", function () {
    const testId =
      this.dataset.testId ||
      new URLSearchParams(window.location.search).get("test_id");

    if (!testId) {
      alert("Не удалось определить тест");
      return;
    }


    window.location.href = `${basePath}test-page.html?test=${testId}`;
  });

function showConfetti() {
  confetti({
    particleCount: 200, // Количество частиц
    spread: 100, // Распространение
    origin: { y: 0.6 }, // Положение источника (снизу)
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const params = new URLSearchParams(window.location.search);
    const resultId = params.get("result_id");
    const testId = params.get("test_id");

    // 1. Пытаемся загрузить из Supabase
    if (resultId) {
      const { data: result, error } = await supabase
        .from("results")
        .select(
          `
          score,
          details,
          test_id,
          completed_at,
          tests (
            title,
            difficulty
          ),
          result_messages (
            main_message,
            additional_message,
            image_url,
            show_confetti
          )
        `
        )
        .eq("id", resultId)
        .single();

      if (!error && result) {
        displayResult(result);
        initStats(result.test_id); // Инициализация статистики для Supabase данных
        return;
      }
      console.warn("Не удалось загрузить из Supabase:", error);
    }

    // 2. Fallback: проверяем localStorage
    if (testId) {
      const localData = localStorage.getItem("testResults");
      if (localData) {
        const result = JSON.parse(localData);
        if (result.testId === testId) {
          console.log("РЕЗУЛЬТАТЫ ГРУЗЯТСЯ ИЗ localStorage");
          displayLocalResult(result);
          initStats(result.testId); // Инициализация статистики для localStorage данных
          return;
        }
      }
    }

    throw new Error("Данные результата не найдены");
  } catch (error) {
    console.error("Ошибка загрузки результатов:", error);
    document.getElementById("main-result").textContent =
      "Ошибка загрузки результатов";
    document.getElementById("result-comments").textContent = error.message;
  }
});

function displayResult(result) {
  const {
    score,
    details,
    test_id,
    completed_at,
    title,
    difficulty,
    result_messages: msg,
  } = result;

  //название теста
  document.getElementById("test-name").innerHTML = result.tests.title;
  //дата прохождения
  const time = new Date(completed_at);
  document.getElementById("time").innerHTML = Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);

  // уровень сложности
  console.log(result);
  document.getElementById("difficulty").innerHTML = result.tests.difficulty;

  // Сохраняем test_id для кнопки "К тесту"
  document.getElementById("returnToTestBtn").dataset.testId = test_id;

  // Отображаем результат
  document.getElementById("main-result").textContent = `${
    msg.main_message
  } (${score.toFixed(1)}%)`;
  document.getElementById("result-comments").textContent =
    msg.additional_message;
  document.getElementById("result-image").src = msg.image_url;

  // Запускаем конфетти если нужно
  if (msg.show_confetti) showConfetti();

  // Используем общую функцию для вопросов
  displayQuestions(details.questions);
  // Добавляем кнопку и модальное окно статистики (ТОЛЬКО если test_id есть)
  if (test_id) {
    // Проверяем, существует ли модальное окно
    if (!document.getElementById("statsModal")) {
      console.error("Модальное окно статистики не найдено");
      return;
    }
    initStats(test_id);
  }
}
async function initStats(testId) {
  const statsBtn = document.getElementById("showStatsBtn");
  if (!statsBtn) return;

  statsBtn.onclick = async (e) => {
    e.preventDefault();

    const modal = document.getElementById("statsModal");
    if (!modal) return;

    modal.style.display = "block";
    document.getElementById("statsRanges").innerHTML =
      "<p>Загрузка статистики...</p>";

    try {
      // Всегда загружаем статистику из Supabase
      const { data: stats, error } = await supabase
        .from("result_stats")
        .select("*")
        .eq("test_id", testId)
        .single();

      if (error) throw error;
      console.log("STATS:");
      console.log(stats);

      if (stats) {
        const total = stats.totalattempts || 0;
        const percentageRanges = {
          "0-25": total
            ? (((stats.scoreranges["0-25"] || 0) / total) * 100).toFixed(1)
            : 0,
          "26-50": total
            ? (((stats.scoreranges["26-50"] || 0) / total) * 100).toFixed(1)
            : 0,
          "51-75": total
            ? (((stats.scoreranges["51-75"] || 0) / total) * 100).toFixed(1)
            : 0,
          "76-99": total
            ? (((stats.scoreranges["76-99"] || 0) / total) * 100).toFixed(1)
            : 0,
          100: total
            ? (((stats.scoreranges["100"] || 0) / total) * 100).toFixed(1)
            : 0,
        };

        document.getElementById("statsRanges").innerHTML = "";

        // Задаем правильный порядок диапазонов
        const orderedRanges = ["0-25", "26-50", "51-75", "76-99", "100"];

        orderedRanges.forEach((range) => {
          const percentage = percentageRanges[range];
          const rangeElement = document.createElement("div");
          rangeElement.className = "stats-range";
          rangeElement.innerHTML = `
            <span>${range}%</span>
            <span>${percentage}%</span>
          `;
          document.getElementById("statsRanges").appendChild(rangeElement);
        });
        document.getElementById("totalAttempts").innerHTML =
          stats.totalattempts;
        document.getElementById("averageScore").innerHTML =
          stats.averagescore.toFixed(2);
      } else {
        document.getElementById("statsRanges").innerHTML =
          "<p>Статистика пока недоступна</p>";
      }
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
      document.getElementById("statsRanges").innerHTML = `
        <p>Ошибка загрузки статистики</p>
        <p>${error.message}</p>
      `;
    }
  };

  // Закрытие модального окна
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById("statsModal").style.display = "none";
    };
  }

  window.onclick = (e) => {
    if (e.target === document.getElementById("statsModal")) {
      e.target.style.display = "none";
    }
  };
}

function displayLocalResult(result) {
  // Определяем сообщение в зависимости от баллов (аналогично Supabase логике)
  const score = parseFloat(result.score);
  let message,
    addMessage,
    imageUrl,
    showConfetti = false;

  if (score === 0) {
    message = "Надо было постараться, чтобы не ответить ничего (⓿_⓿)";
    addMessage =
      "Одно из двух: либо ты полный 0, либо ты знал ответы на все вопросы и специально отвечал неправильно-_-";
    imageUrl = "./my-img/small_img/dissapointmentCat.jpg";
  } else if (score <= 25) {
    message = "Очень плохо ＞﹏＜";
    addMessage =
      "Ты ничего не шаришь в IT. (А может ты специально выбирал неверные варианты?)))";
    imageUrl = "./my-img/small_img/memeCatSleepy.webp";
  } else if (score <= 50) {
    message = "Ну такое себе (。_。)";
    addMessage = "Некоторые знания есть, но все еще впереди!";
    imageUrl = "./my-img/small_img/catWithBook.webp";
  } else if (score <= 75) {
    message = "Неплохо, но есть куда стремиться (*^▽^*)";
    addMessage = "Вероятно, ты только изучаешь эту отрасль.";
    imageUrl = "./my-img/small_img/endorsingCat.jpg";
  } else if (score <= 99) {
    message = "А ты не так прост（￣︶￣）↗　";
    addMessage = "Ты отлично понимаешь базу программирования, удачи)";
    imageUrl = "./my-img/small_img/cat-with-vuffle.jpg";
  } else {
    message = "Профи §(*￣▽￣*)§";
    addMessage = "Вы готовы стать лучшим программистом в мире!)";
    imageUrl = "./my-img/small_img/youarehacker.webp";
    showConfetti = true;
  }

  // Сохраняем testId для кнопки "К тесту"
  document.getElementById("returnToTestBtn").dataset.testId = result.testId;

  // Отображаем результат
  document.getElementById(
    "main-result"
  ).textContent = `${message} (${score.toFixed(1)}%)`;
  document.getElementById("result-comments").textContent = addMessage;
  document.getElementById("result-image").src = imageUrl;

  // Запускаем конфетти если нужно
  if (showConfetti) showConfetti();

  // Отображаем вопросы (используем ту же функцию)
  displayQuestions(result.questions);
  // Добавляем обработчик для кнопки статистики
  const statsBtn = document.getElementById("showStatsBtn");
  if (statsBtn) {
    statsBtn.onclick = (e) => {
      e.preventDefault();
      const modal = document.getElementById("statsModal");
      if (modal) {
        modal.style.display = "block";
        document.getElementById("statsRanges").innerHTML = `
          <p>Статистика доступна только для результатов, сохранённых в системе</p>
          <p>Авторизуйтесь для полного доступа</p>
        `;
      }
    };
  }
}

function displayQuestions(questions) {
  const resultsContainer = document.getElementById("resultsContainer");
  resultsContainer.innerHTML = "";

  questions.forEach((question, index) => {
    const answerDiv = document.createElement("div");
    answerDiv.className = "answer";

    // Изображение вопроса (если есть)
    if (question.image) {
      const img = document.createElement("img");
      img.src = question.image;
      answerDiv.appendChild(img);
    }

    // Детали вопроса
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "details";

    // Текст вопроса
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";
    questionDiv.innerHTML = `
      <span class="standart-label">Вопрос #${index + 1}</span>:
      <span class="question-text">${question.question}</span>
    `;
    detailsDiv.appendChild(questionDiv);

    // Ответ пользователя
    const yourAnswerDiv = document.createElement("div");
    yourAnswerDiv.className = "your-answer";
    yourAnswerDiv.innerHTML = `
      <span class="standart-label">Вы ответили:</span>
      <span class="answer-text">${
        question.user_answer || question.userAnswer
      }</span>
    `;
    detailsDiv.appendChild(yourAnswerDiv);

    // Правильный ответ (если была ошибка)
    if (!question.is_correct && !question.isCorrect) {
      const correctAnswerDiv = document.createElement("div");
      correctAnswerDiv.className = "correct-answer";
      correctAnswerDiv.innerHTML = `
        <span class="standart-label">Правильный ответ:</span>
        <span class="correct-answer-text">${
          question.correct_answer || question.correctAnswer
        }</span>
      `;
      detailsDiv.appendChild(correctAnswerDiv);
    }

    answerDiv.appendChild(detailsDiv);

    // Статус ответа
    const answerStatusDiv = document.createElement("div");
    answerStatusDiv.className =
      question.is_correct || question.isCorrect
        ? "answer-status right"
        : "answer-status wrong";
    answerStatusDiv.textContent =
      question.is_correct || question.isCorrect
        ? "Правильный ответ"
        : "Неправильный ответ";
    answerDiv.appendChild(answerStatusDiv);

    resultsContainer.appendChild(answerDiv);
  });
}
/**
 * Проверяет авторизацию и обновляет UI
 */
async function checkAuth() {
  const commentForm = document.getElementById("comment-form");
  const unauthorizedMessage = document.getElementById("unauthorized-message");
  if (!commentForm) return;

  // Явная проверка сессии
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  if (isAuthenticated) {
    commentForm.style.display = "block"; // Показываем форму
    unauthorizedMessage.style.display = "none";
  } else {
    commentForm.style.display = "none"; // Скрываем форму
    unauthorizedMessage.style.display = "block";
  }
}

// Проверяем при загрузке
document.addEventListener("DOMContentLoaded", checkAuth);

// Подписываемся на изменения авторизации
authState.subscribe(checkAuth);

/**
 * Работа со статистикой
 */
// 1. Функция загрузки статистики
async function loadTestStats(testId) {
  try {
    const { data, error } = await supabase
      .from("result_stats")
      .select("*")
      .eq("test_id", testId)
      .single();

    if (error) throw error;
    return (
      data || {
        totalAttempts: 0,
        averageScore: 0,
        scoreRanges: {
          "0-25": 0,
          "26-50": 0,
          "51-75": 0,
          "76-99": 0,
          100: 0,
        },
      }
    );
  } catch (error) {
    console.error("Ошибка загрузки статистики:", error);
    return null;
  }
}

// 2. Функция отображения статистики
function displayStats(stats) {
  if (!stats) return;

  const container = document.getElementById("statsRanges");
  container.innerHTML = "";

  // Отображаем диапазоны баллов
  for (const [range, percentage] of Object.entries(stats.scoreRanges)) {
    const rangeElement = document.createElement("div");
    rangeElement.className = "stats-range";
    rangeElement.innerHTML = `
      <span>${range}%</span>
      <span>${percentage}%</span>
    `;
    container.appendChild(rangeElement);
  }

  // Общие метрики
  document.getElementById("totalAttempts").textContent = stats.totalAttempts;
  document.getElementById("averageScore").textContent =
    stats.averageScore.toFixed(1);
}

// 3. Управление модальным окном
function setupStatsModal() {
  const modal = document.getElementById("statsModal");
  const closeBtn = document.querySelector(".close");

  // Закрытие по клику на крестик
  closeBtn.onclick = () => (modal.style.display = "none");

  // Закрытие по клику вне окна
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

/**
 * Работа с комментариями
 */

/**
 * Модуль для работы с комментариями
 */
const CommentsModule = (function () {
  // Конфигурация
  const COMMENTS_PER_PAGE = 10;
  let currentPage = 1;
  let totalCommentsCount = 0;
  const params = new URLSearchParams(window.location.search);
  const testId = params.get("test_id");
  // const resultsData = JSON.parse(localStorage.getItem("testResults"));

  /**
   * Загружает комментарии для теста с пагинацией
   * @param {string} testId - ID теста
   * @param {number} page - Номер страницы (начинается с 1)
   */
  // Обновлённая функция загрузки комментариев
  async function loadComments(testId, page = 1) {
    const from = (page - 1) * COMMENTS_PER_PAGE;
    const to = from + COMMENTS_PER_PAGE - 1;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const anonId = localStorage.getItem("anon_id");

      const {
        data: comments,
        count,
        error,
      } = await supabase
        .from("comments")
        .select("*", { count: "exact" })
        .eq("test_id", testId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const commentsWithReactions = comments.map((comment) => {
        const reaction = localStorage.getItem(`reaction_${comment.id}`);
        return {
          ...comment,
          user_has_liked: user
            ? comment.liked_by?.includes(user.id)
            : reaction === "like",
          user_has_disliked: user
            ? comment.disliked_by?.includes(user.id)
            : reaction === "dislike",
        };
      });

      totalCommentsCount = count || 0;
      renderComments(commentsWithReactions, page, user?.id);
      updateLoadMoreButton(page);
    } catch (error) {
      console.error("Ошибка загрузки комментариев:", error);
    }
  }

  /**
   * Рендерит комментарии на странице
   * @param {Array} comments - Массив комментариев
   * @param {number} page - Текущая страница
   */
  function renderComments(comments, page, currentUserId) {
    const container = document.getElementById("comments-container");
    if (!container) return;

    if (page === 1) {
      container.innerHTML = "";
    }

    comments.forEach((comment) => {
      const userLiked = currentUserId ? comment.user_has_liked : false;
      const userDisliked = currentUserId ? comment.user_has_disliked : false;

      container.insertAdjacentHTML(
        "beforeend",
        createCommentHTML(comment, userLiked, userDisliked)
      );
    });

    setupCommentActions();
  }

  /**
   * Создает HTML для одного комментария
   * @param {Object} comment - Данные комментария
   * @returns {string} HTML строка
   */
  function createCommentHTML(comment, userLiked = false, userDisliked = false) {
    const authorName =
      comment.author_name ||
      comment.profiles?.username ||
      comment.user_email?.split("@")[0] ||
      "Аноним";

    return `
      <div class="comment" data-id="${comment.id}">
        <div class="comment-header">
          <span class="comment-author">${authorName}</span>
          <span class="comment-time">${formatTime(comment.created_at)}</span>
        </div>
        <div class="comment-text">${comment.text}</div>
        <div class="comment-actions">
           <button class="like-btn ${userLiked ? "active" : ""}" data-id="${
      comment.id
    }">
          <img src="./../my-img/icons/${
            userLiked ? "like-filled" : "like"
          }.svg" /> ${comment.likes || 0}
        </button>
        <button class="dislike-btn ${userDisliked ? "active" : ""}" data-id="${
      comment.id
    }">
          <img src="./../my-img/icons/${
            userDisliked ? "dislike-filled" : "dislike"
          }.svg" /> ${comment.dislikes || 0}
        </button>
        </div>
      </div>
    `;
  }

  /**
   * Форматирует дату в относительный формат
   * @param {string} dateString - Строка с датой
   * @returns {string} Отформатированное время
   */
  function formatTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000); // Разница в секундах

    if (diff < 60) return "только что";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return date.toLocaleDateString();
  }

  /**
   * Обновляет кнопку "Загрузить еще"
   * @param {number} currentPage - Текущая страница
   */
  function updateLoadMoreButton(currentPage) {
    const button = document.getElementById("load-more");
    if (!button) return;

    const loadedCount = currentPage * COMMENTS_PER_PAGE;

    if (totalCommentsCount > loadedCount) {
      button.classList.remove("hidden");
      button.onclick = () => {
        currentPage++;
        loadComments(testId, currentPage);
      };
    } else {
      button.classList.add("hidden");
    }
  }

  /**
   * Назначает обработчики событий для кнопок лайков/дизлайков
   */
  function setupCommentActions() {
    document.querySelectorAll(".like-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        handleLike(e.currentTarget.getAttribute("data-id"));
      });
    });

    document.querySelectorAll(".dislike-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        handleDislike(e.currentTarget.getAttribute("data-id"));
      });
    });
  }

  /**
   * Обрабатывает реакции на комментарий
   */
  async function handleReaction(commentId, reactionType) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const localStorageKey = `reaction_${commentId}`;
      const currentReaction = localStorage.getItem(localStorageKey);

      // Генерация уникального ID для анонимных пользователей
      let anonId = localStorage.getItem("anon_id");
      if (!user && !anonId) {
        anonId = `anon_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("anon_id", anonId);
      }

      // Удаление противоположной реакции
      if (currentReaction && currentReaction !== reactionType) {
        await supabase.rpc("handle_reaction", {
          comment_id: commentId,
          reaction_type: currentReaction,
          input_user_id: user?.id || null,
          input_user_ip: user ? null : anonId,
          is_increment: false,
        });
      }

      // Добавление/удаление реакции
      const { data: result, error } = await supabase.rpc("handle_reaction", {
        comment_id: commentId,
        reaction_type: reactionType,
        input_user_id: user?.id || null,
        input_user_ip: user ? null : anonId,
        is_increment: currentReaction !== reactionType,
      });

      if (!error) {
        if (currentReaction === reactionType) {
          localStorage.removeItem(localStorageKey);
        } else {
          localStorage.setItem(localStorageKey, reactionType);
        }
        updateCommentUI(commentId, result);
      }
    } catch (error) {
      console.error(`Ошибка при обработке ${reactionType}:`, error);
    }
  }
  /**
   * Обрабатывает лайк комментария
   * @param {string} commentId - ID комментария
   */
  async function handleLike(commentId) {
    await handleReaction(commentId, "like");
  }

  /**
   * Обрабатывает дизлайк комментария
   * @param {string} commentId - ID комментария
   */
  async function handleDislike(commentId) {
    await handleReaction(commentId, "dislike");
  }

  /**
   * Обновляет UI комментария после реакции
   * @param {string} commentId - ID комментария
   * @param {Object} data - Данные для обновления
   */

  function updateCommentUI(commentId, data) {
    const commentEl = document.querySelector(
      `.comment[data-id="${commentId}"]`
    );
    if (!commentEl || !data) return;

    const likeBtn = commentEl.querySelector(".like-btn");
    const dislikeBtn = commentEl.querySelector(".dislike-btn");
    const reaction = localStorage.getItem(`reaction_${commentId}`);

    const isLiked = data.user_liked || reaction === "like";
    const isDisliked = data.user_disliked || reaction === "dislike";

    likeBtn.innerHTML = `
      <img src="../my-img/icons/${isLiked ? "like-filled" : "like"}.svg" />
      ${data.likes || 0}
    `;
    dislikeBtn.innerHTML = `
      <img src="../my-img/icons/${
        isDisliked ? "dislike-filled" : "dislike"
      }.svg" />
      ${data.dislikes || 0}
    `;

    likeBtn.classList.toggle("active", isLiked);
    dislikeBtn.classList.toggle("active", isDisliked);
  }

  /**
   * Получает или создает имя пользователя
   * @param {Object} user - Объект пользователя
   * @returns {Promise<string>} Имя пользователя
   */
  async function getUsername(user) {
    try {
      // 1. Попробуем получить профиль
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && profile) {
        return profile.username;
      }

      // 2. Если профиля нет - создаём его
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: user.email.split("@")[0],
        email: user.email,
      });

      if (!upsertError) {
        return user.email.split("@")[0];
      }

      // 3. Если всё провалилось - используем email
      return user.email.split("@")[0] || "Аноним";
    } catch (e) {
      console.error("Ошибка получения username:", e);
      return user.email.split("@")[0] || "Аноним";
    }
  }

  /**
   * Инициализирует модуль комментариев
   */
  function init() {
    // Инициализация анонимного пользователя
    if (!localStorage.getItem("anon_user_id")) {
      localStorage.setItem(
        "anon_user_id",
        "anon_" + Math.random().toString(36).substring(2, 11)
      );
    }

    // Инициализация формы комментария
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", handleCommentSubmit);
    }

    // Загрузка комментариев при загрузке страницы
    document.addEventListener("DOMContentLoaded", async () => {
      if (testId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        loadComments(testId, 1, user?.id);
      }
    });
  }

  /**
   * Обрабатывает отправку нового комментария
   * @param {Event} e - Событие submit
   */
  async function handleCommentSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const textarea = form.querySelector("textarea");
    const text = textarea.value.trim();
    const button = form.querySelector("button");

    if (!text) return;

    button.disabled = true;
    button.textContent = "Отправка...";

    try {
      // Получаем данные пользователя
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Получаем или создаём username
      const username = await getUsername(user);

      // Создаем комментарий
      const { error } = await supabase.from("comments").insert([
        {
          test_id: testId,
          user_id: user.id,
          author_name: username,
          text: text,
        },
      ]);

      if (error) throw error;

      textarea.value = "";
      // Перезагружаем комментарии с первой страницы
      currentPage = 1;
      loadComments(testId, currentPage);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Не удалось отправить комментарий: " + error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Отправить";
    }
  }

  // Публичные методы
  return {
    init,
    loadComments,
    handleLike,
    handleDislike,
  };
})();

// Инициализация модуля
CommentsModule.init();

// При изменении статуса авторизации
authState.subscribe((session) => {
  const form = document.getElementById("comment-form");
  form.style.display = session ? "block" : "none";
});
