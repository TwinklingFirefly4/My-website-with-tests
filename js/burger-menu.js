document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burger-menu');
    if (burgerMenu) {
      burgerMenu.addEventListener('click', function() {
        const navCenter = document.getElementById('nav-center');
        if (navCenter) {
          navCenter.classList.toggle('active');
        }
      });
    } else {
      console.error('Элемент с id="burger-menu" не найден.');
    }
  });