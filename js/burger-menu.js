console.log('SCRIPT WORKING');
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burger-menu');
    if (burgerMenu) {
      burgerMenu.addEventListener('click', function() {
        console.log('Кнопка бургер-меню нажата!'); // Проверка срабатывания
        const navCenter = document.getElementById('nav-center');
        if (navCenter) {
          navCenter.classList.toggle('active');
        }
      });
    } else {
      console.error('Элемент с id="burger-menu" не найден.');
      console.log('не то');
    }
  });