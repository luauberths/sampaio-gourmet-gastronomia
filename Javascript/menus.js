const menus = document.querySelector(".menus-page");

if (menus) {
  const dialog = menus.querySelector("dialog");

  menus.querySelectorAll(".menu-choice-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.closest(".menu-choice").querySelector(".menu-choice-body");
      const content = source.cloneNode(true);
      content.hidden = false;

      dialog.querySelector(".menu-choice-body")?.remove();
      dialog.append(content);
      dialog.querySelector("#menu-dialog-title .section-title-text").textContent =
        button.querySelector(".menu-choice-name").textContent.trim();
      dialog.showModal();
    });
  });
}
