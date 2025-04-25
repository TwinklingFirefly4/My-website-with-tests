document.addEventListener("DOMContentLoaded", function () {
  fetch("nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navigation-placeholder").innerHTML = data;
      
      const navToggle = document.querySelector(".nav-toggle");
      const navList = document.querySelector(".nav-list");
      const header = document.querySelector(".header");
      
      const updateMenuPosition = function () {
        const headerHeight = header.offsetHeight;
        navList.style.top = `${headerHeight}px`;
      };
      
      const closeMenu = () => {
        navList.classList.remove("active");
      };
      
      navToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        updateMenuPosition();
        navList.classList.toggle("active");
      });
      
      const handleClickOutside = (event) => {
        if (window.innerWidth < 768 && 
            navList.classList.contains("active") && 
            !navList.contains(event.target) && 
            !navToggle.contains(event.target)) {
          closeMenu();
        }
      };
      
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          navList.classList.remove("active");
          navList.style.top = "";
        } else {
          updateMenuPosition();
        }
      };
      
      updateMenuPosition();
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('resize', handleResize);
      
      // Инициализация навигации после загрузки
      // setTimeout(updateNavigation, 100);
    });
});