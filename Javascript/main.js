const currentYear = document.getElementById("current-year");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const menuClose = document.getElementById("menu-close");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks && menuClose) {
  let menuScrollPosition = 0;

  const closeMenu = () => {
    if (!navLinks.classList.contains("active-modal")) return;
    navLinks.classList.remove("active-modal");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.top = "";

    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, menuScrollPosition);
    document.documentElement.style.scrollBehavior = scrollBehavior;
  };

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-controls", navLinks.id);

  menuToggle.addEventListener("click", () => {
    menuScrollPosition = window.scrollY;
    document.body.style.top = `-${menuScrollPosition}px`;
    navLinks.classList.add("active-modal");
    menuToggle.setAttribute("aria-expanded", "true");
  });

  menuClose.addEventListener("click", closeMenu);
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}
