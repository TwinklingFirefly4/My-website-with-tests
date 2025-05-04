import supabase from "./supabase-init.js";
import { authState } from "./auth-state.js";

/**
 * Валидирует пароль по заданным критериям
 * @param {string} password - Пароль для валидации
 * @returns {string[]} Массив сообщений об ошибках (пустой если пароль валиден)
 */
function validatePassword(password) {
  const errors = [];
  if (password.length < 6) {
    errors.push("Пароль должен содержать минимум 6 символов");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Добавьте хотя бы одну заглавную букву");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Добавьте хотя бы одну цифру");
  }
  return errors;
}

/**
 * Обрабатывает отправку формы регистрации
 * @param {Event} e - Событие отправки формы
 */
async function handleSignUp(e) {
  e.preventDefault();
  console.log("Начало регистрации");

  const email = document.getElementById("signup-email").value;
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const passwordConfirm = document.getElementById(
    "signup-password-confirm"
  ).value;
  const errorElement = document.getElementById("signup-error");

  // Сброс предыдущих ошибок
  errorElement.innerHTML = "";
  errorElement.style.display = "none";

  // Валидация пароля
  const errors = validatePassword(password);

  // Проверка совпадения паролей
  if (password !== passwordConfirm) {
    errors.push("Пароли не совпадают");
  }

  // Проверка имени пользователя
  if (username.length < 3) {
    errors.push("Имя пользователя должно содержать минимум 3 символа");
  }

  if (errors.length > 0) {
    errorElement.innerHTML = errors.join("<br>");
    errorElement.style.display = "block";
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

  try {
    console.log("Попытка регистрации");

    // 1. Регистрация в Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: username,
        },
      },
    });

    if (error) {
      console.error("Ошибка регистрации:", error);
      throw error;
    }
    // 2. Получаем сессию после регистрации
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Не удалось создать сессию после регистрации");
    }

    // 2. Сохранение профиля в отдельной таблице (рекомендуется)
    const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: session.user.id,
      username: username,
      email: email
    });

    if (profileError) throw profileError;

    console.log("Успешная регистрация", data);
    alert("Регистрация успешна! Проверьте email для подтверждения.");
    window.location.href = "login-page.html";
  } catch (error) {
    console.error("Ошибка:", error);
    errorElement.innerHTML = error.message;
    errorElement.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign Up";
  }
}

/**
 * Обрабатывает отправку формы входа
 * @param {Event} e - Событие отправки формы
 */
async function handleSignIn(e) {
  e.preventDefault();
  console.log("Начало входа");

  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  const errorElement = document.getElementById("signin-error");

  try {
    console.log("Попытка входа");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Результат входа:", { data, error });

    if (error) {
      console.error("Ошибка входа:", error);
      throw error;
    }

    console.log("Успешный вход", data);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 100);
  } catch (error) {
    console.error("Ошибка входа:", error);
    errorElement.innerHTML = error.message;
    errorElement.style.display = "block";
  }
}

/**
 * Обновляет UI для авторизованного пользователя
 */
function setAuthenticatedUI() {
  const authLink = document.getElementById("auth-link");
  const createItem = document.getElementById("create");

  if (authLink) {
    authLink.textContent = "Выход";
    authLink.href = "#";
    authLink.onclick = async (e) => {
      e.preventDefault();
      await signOut();
    };
  }

  if (createItem) createItem.style.display = "block";
}

/**
 * Обновляет UI для неавторизованного пользователя
 */
function setUnauthenticatedUI() {
  const authLink = document.getElementById("auth-link");
  const createItem = document.getElementById("create");

  if (authLink) {
    authLink.textContent = "Вход";
    authLink.href = "./login-page.html";
    authLink.onclick = null;
  }

  if (createItem) createItem.style.display = "none";
}

/**
 * Обновляет навигацию в зависимости от статуса аутентификации
 */
async function updateNavigation() {
  console.log("Обновление навигации...");
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("Пользователь не авторизован");
      setUnauthenticatedUI();
      return;
    }

    console.log("Пользователь авторизован");
    setAuthenticatedUI();
  } catch (error) {
    if (error.message.includes("Auth session missing")) {
      console.log(
        "Сессия аутентификации отсутствует - пользователь не авторизован"
      );
      setUnauthenticatedUI();
    } else {
      console.error("Ошибка обновления навигации:", error);
    }
  }
}

/**
 * Выполняет выход пользователя из системы
 */
async function signOut() {
  try {
    console.log("Попытка выхода");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Ошибка выхода:", error);
      throw error;
    }

    console.log("Успешный выход");
    window.location.href = "login-page.html";
  } catch (error) {
    console.error("Ошибка при выходе:", error);
    alert("Ошибка при выходе: " + error.message);
  }
}

/**
 * Обрабатывает изменения статуса аутентификации
 * @param {string} event - Тип события (SIGNED_IN, SIGNED_OUT и т.д.)
 * @param {object} session - Данные сессии
 */
function handleAuthStateChange(event, session) {
  console.log("Изменение статуса авторизации:", event);

  if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
    setUnauthenticatedUI();
  } else if (event === "SIGNED_IN") {
    setAuthenticatedUI();
  }
}

async function handlePasswordUpdate() {
  // Проверяем, есть ли токен в URL (после перенаправления)
  const hash = window.location.hash;
  if (hash.includes('access_token') && hash.includes('type=recovery')) {
    // Перенаправляем на страницу обновления с сохранением токена
    window.location.href = '/update-password.html' + hash;
  }
}

// Вызовите при загрузке страницы
document.addEventListener('DOMContentLoaded', handlePasswordUpdate);

/**
 * Инициализирует обработчики событий
 */
function initEventListeners() {
  document
    .getElementById("signup-form")
    ?.addEventListener("submit", handleSignUp);
  document
    .getElementById("signin-form")
    ?.addEventListener("submit", handleSignIn);
  authState.subscribe(updateNavigation);
  supabase.auth.onAuthStateChange(handleAuthStateChange);
}

/**
 * Инициализирует приложение после загрузки DOM
 */
function initApp() {
  console.log("DOM загружен");
  initEventListeners();
  updateNavigation();
}

// Запуск приложения после полной загрузки DOM
document.addEventListener("DOMContentLoaded", initApp);
