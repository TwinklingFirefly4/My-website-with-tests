const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});
loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// Функция для показа/скрытия пароля
function setupPasswordToggle() {
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const field = e.currentTarget.closest('.password-field');
      const input = field.querySelector('input');
      const icon = field.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });
}

// Сброс пароля
async function handlePasswordReset() {
  const email = document.getElementById('signin-email').value;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo: window.location.origin + '/update-password.html'
    redirectTo: './update-password.html'
  });

  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('Ссылка для сброса отправлена на ' + email);
  }
}
document.getElementById('forgot-password').addEventListener('click', handlePasswordReset);

// Вызовите при загрузке страницы
document.addEventListener('DOMContentLoaded', setupPasswordToggle);
