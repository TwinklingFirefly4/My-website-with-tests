// Get the data from the URL query parameter
// const params = new URLSearchParams(window.location.search);
// const dataString = params.get("data");
// const resultsData = JSON.parse(decodeURIComponent(dataString));
import supabase from "./supabase-init.js";
import { authState } from "./auth-state.js";
// Для отладки
console.log("Supabase initialized:", supabase);
console.log("AuthState initialized:", authState);
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
    const basePath = isGitHubPages
      ? `${window.location.origin}/My-website-with-tests/`
      : "./";
    //  `${window.location.origin}/My-website-with-tests/tests/tests-manifest.json`
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

  console.log("Auth status:", isAuthenticated);
  console.log("Current session:", session);

  if (isAuthenticated) {
    commentForm.style.display = "block"; // Показываем форму
    unauthorizedMessage.style.display = "none";
    console.log("User is authenticated, showing form");
  } else {
    commentForm.style.display = "none"; // Скрываем форму
    unauthorizedMessage.style.display = "block";
    console.log("User is not authenticated, hiding form");
  }
}

// Проверяем при загрузке
document.addEventListener("DOMContentLoaded", checkAuth);

// Подписываемся на изменения авторизации
authState.subscribe(checkAuth);

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
    const { data: { user } } = await supabase.auth.getUser();
    const anonId = localStorage.getItem('anon_id');

    const { data: comments, count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("test_id", testId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const commentsWithReactions = comments.map(comment => {
      const reaction = localStorage.getItem(`reaction_${comment.id}`);
      return {
        ...comment,
        user_has_liked: user 
          ? comment.liked_by?.includes(user.id) 
          : reaction === 'like',
        user_has_disliked: user 
          ? comment.disliked_by?.includes(user.id) 
          : reaction === 'dislike'
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
          <img src="../my-img/icons/${
            userLiked ? "like-filled" : "like"
          }.svg" /> ${comment.likes || 0}
        </button>
        <button class="dislike-btn ${userDisliked ? "active" : ""}" data-id="${
      comment.id
    }">
          <img src="../my-img/icons/${
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
        loadComments(resultsData.testId, currentPage);
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
  /**
   * Обрабатывает реакции на комментарий
   */
  async function handleReaction(commentId, reactionType) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const localStorageKey = `reaction_${commentId}`;
      const currentReaction = localStorage.getItem(localStorageKey);
  
      // Генерация уникального ID для анонимных пользователей
      let anonId = localStorage.getItem('anon_id');
      if (!user && !anonId) {
        anonId = `anon_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('anon_id', anonId);
      }
  
      // Удаление противоположной реакции
      if (currentReaction && currentReaction !== reactionType) {
        await supabase.rpc("handle_reaction", {
          comment_id: commentId,
          reaction_type: currentReaction,
          input_user_id: user?.id || null,
          input_user_ip: user ? null : anonId,
          is_increment: false
        });
      }
  
      // Добавление/удаление реакции
      const { data: result, error } = await supabase.rpc("handle_reaction", {
        comment_id: commentId,
        reaction_type: reactionType,
        input_user_id: user?.id || null,
        input_user_ip: user ? null : anonId,
        is_increment: currentReaction !== reactionType
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
    const commentEl = document.querySelector(`.comment[data-id="${commentId}"]`);
    if (!commentEl || !data) return;
  
    const likeBtn = commentEl.querySelector(".like-btn");
    const dislikeBtn = commentEl.querySelector(".dislike-btn");
    const reaction = localStorage.getItem(`reaction_${commentId}`);
  
    const isLiked = data.user_liked || reaction === 'like';
    const isDisliked = data.user_disliked || reaction === 'dislike';
  
    likeBtn.innerHTML = `
      <img src="../my-img/icons/${isLiked ? 'like-filled' : 'like'}.svg" />
      ${data.likes || 0}
    `;
    dislikeBtn.innerHTML = `
      <img src="../my-img/icons/${isDisliked ? 'dislike-filled' : 'dislike'}.svg" />
      ${data.dislikes || 0}
    `;
  
    likeBtn.classList.toggle('active', isLiked);
    dislikeBtn.classList.toggle('active', isDisliked);
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
    if (!localStorage.getItem('anon_user_id')) {
      localStorage.setItem('anon_user_id', 'anon_' + Math.random().toString(36).substring(2, 11));
    }
  
    // Инициализация формы комментария
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", handleCommentSubmit);
    }
  
    // Загрузка комментариев при загрузке страницы
    document.addEventListener("DOMContentLoaded", async () => {
      if (resultsData?.testId) {
        const { data: { user } } = await supabase.auth.getUser();
        loadComments(resultsData.testId, 1, user?.id);
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
          test_id: resultsData.testId,
          user_id: user.id,
          author_name: username,
          text: text,
        },
      ]);

      if (error) throw error;

      textarea.value = "";
      // Перезагружаем комментарии с первой страницы
      currentPage = 1;
      loadComments(resultsData.testId, currentPage);
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
