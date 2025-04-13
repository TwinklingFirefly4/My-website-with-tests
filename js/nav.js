document.addEventListener("DOMContentLoaded", function () {
  fetch("nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navigation-placeholder").innerHTML = data;
      
      const navToggle = document.querySelector(".nav-toggle");
      const navList = document.querySelector(".nav-list");
      const header = document.querySelector(".header");
      
      // Функция для обновления позиции меню
      const updateMenuPosition = function () {
        const headerHeight = header.offsetHeight;
        navList.style.top = `${headerHeight}px`;
      };
      
      // Функция закрытия меню
      const closeMenu = () => {
        navList.classList.remove("active");
      };
      
      // Обработчик клика по кнопке
      navToggle.addEventListener("click", function (e) {
        e.stopPropagation(); // Предотвращаем срабатывание document.click
        updateMenuPosition();
        navList.classList.toggle("active");
      });
      
      // Обработчик клика по документу
      const handleClickOutside = (event) => {
        if (window.innerWidth < 768 && 
            navList.classList.contains("active") && 
            !navList.contains(event.target) && 
            !navToggle.contains(event.target)) {
          closeMenu();
        }
      };
      
      // Обработчик ресайза
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          navList.classList.remove("active");
          navList.style.top = "";
        } else {
          updateMenuPosition();
        }
      };
      
      // Инициализация
      updateMenuPosition();
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('resize', handleResize);
    });
});