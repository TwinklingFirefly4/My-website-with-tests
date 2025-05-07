document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Загружаем список доступных тестов
    const tests = await loadAvailableTests();
    console.log(tests);
    // Заполняем сетку тестов
    populateTestsGrid(tests);

    // Добавляем обработчики событий
    setupTestCards();
  } catch (error) {
    console.error("Ошибка загрузки тестов:", error);
    showError("Не удалось загрузить список тестов");
  }
});

/**
 * Загружает список доступных тестов
 */
async function loadAvailableTests() {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select(`
        id,
        title,
        description,
        preview_image,
        difficulty,
        questions:questions(count)
      `)
      .eq('is_public', true);

    if (error) throw error;

    return data.map(test => ({
      id: test.id,
      name: test.title,
      description: test.description,
      previewImage: test.preview_image,
      questionsCount: test.questions[0].count, // Доступ к count через массив
      difficulty: test.difficulty
    }));
  } catch (error) {
    console.error("Ошибка загрузки тестов:", error);
    throw error;
  }
}

/**
 * Заполняет сетку тестов карточками
 */
function populateTestsGrid(tests) {
  const grid = document.querySelector(".tests-grid");
  grid.innerHTML = ""; // Очищаем существующие карточки

  tests.forEach((test) => {
    const testCard = createTestCard(test);
    grid.appendChild(testCard);
  });
}

/**
 * Создает карточку теста
 */
function createTestCard(test) {
  const card = document.createElement("div");
  card.className = "test-card";
  card.dataset.testId = test.id;

  card.innerHTML = `
      <img src="${test.previewImage || "./my-img/small_img/graphs.jpg"}" 
           alt="${test.name}" 
           class="test-image">
      <div class="test-content">
        <h2 class="test-title">${test.name}</h2>
        <p class="test-description">${test.description}</p>
        <div class="test-meta">
          <span>${test.questionsCount} вопросов</span>
          <span>${test.difficulty}</span>
        </div>
      </div>
    `;
  return card;
}

/**
 * Настраивает обработчики кликов для карточек тестов
 */
function setupTestCards() {
  document.querySelectorAll(".test-card").forEach((card) => {
    card.addEventListener("click", function () {
      const testId = this.dataset.testId;

      // Формируем URL с учетом basePath
      const testUrl = new URL(`./test-page.html`, window.location.href);
      testUrl.searchParams.set("test", testId);

      window.location.href = testUrl.toString();
    });
  });
}

/**
 * Показывает сообщение об ошибке
 */
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.querySelector("main").appendChild(errorDiv);
}
