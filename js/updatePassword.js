import supabase from "./supabase-init.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Разбираем hash URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get("access_token");
  const type = hashParams.get("type");

  // Проверяем, что это ссылка для восстановления
  if (type !== "recovery" || !accessToken) {
    document.getElementById("message").textContent =
      "Неверная или устаревшая ссылка. Запросите новую.";
    return;
  }

  // Устанавливаем сессию из токена
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: hashParams.get("refresh_token"),
  });

  if (sessionError) {
    document.getElementById("message").textContent =
      "Ошибка авторизации: " + sessionError.message;
    return;
  }

  // Обработчик формы
  document
    .getElementById("password-update-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (newPassword !== confirmPassword) {
        document.getElementById("message").textContent = "Пароли не совпадают";
        return;
      }

      // Обновляем пароль
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        document.getElementById("message").textContent = error.message;
      } else {
        document.getElementById("message").textContent =
          "Пароль успешно обновлен!";
        setTimeout(() => (window.location.href = "/"), 2000);
      }
    });
});

// Функция для показа/скрытия пароля
function setupPasswordToggle() {
  document.querySelectorAll(".password-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      const field = e.currentTarget.closest(".password-field");
      const input = field.querySelector("input");
      const icon = field.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });
}
// Вызовите при загрузке страницы
document.addEventListener("DOMContentLoaded", setupPasswordToggle);
