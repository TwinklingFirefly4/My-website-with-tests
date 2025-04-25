// получим значение, на которое мы пролистываем страницу вниз
window.addEventListener("scroll", (e) => {
  // scrollTop - css переменная, которую мы интерполируем с динамической js переменной
  document.body.style.cssText += `--scrollTop: ${this.scrollY}px`;
});
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
ScrollSmoother.create({
  wrapper: ".wrapper",
  content: ".content",
});
