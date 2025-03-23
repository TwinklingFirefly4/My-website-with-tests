document.addEventListener("DOMContentLoaded", function () {
  fetch("nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navigation-placeholder").innerHTML = data;
      const navToggle = document.querySelector(".nav-toggle");
      const navList = document.querySelector(".nav-list");
      const header = document.querySelector(".header");
      
      console.log(navToggle);
      console.log(navList);
      
      const updateMenuPosition = function () {
        const headerHeight = header.offsetHeight;
        navList.style.top = `${headerHeight}px`;
        console.log(`HEADER HEIGHT: ${headerHeight}`);
      };
      navToggle.addEventListener("click", function () {
        console.log("СLICK");
        updateMenuPosition();
        navList.classList.toggle("active");
      });
    });
});
