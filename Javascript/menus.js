const menus = document.querySelector(".menus-page");

if (menus) {
  const dialog = menus.querySelector("dialog");
  let activeContent = null;
  let placeholder = null;

  // Restore the original node instead of discarding and cloning its SVGs.
  function restoreContent() {
    if (!activeContent) return;
    activeContent.hidden = true;
    placeholder.replaceWith(activeContent);
    activeContent = null;
    placeholder = null;
  }

  dialog.addEventListener("close", () => {
    // A close event may still be queued if another menu was opened immediately.
    if (!dialog.open) restoreContent();
  });

  menus.querySelectorAll(".menu-choice-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      restoreContent();
      const content = button.closest(".menu-choice").querySelector(".menu-choice-body");
      placeholder = document.createComment("menu-content-position");
      content.replaceWith(placeholder);
      activeContent = content;
      content.hidden = false;
      dialog.append(content);
      dialog.querySelector("#menu-dialog-title .section-title-text").textContent =
        button.querySelector(".menu-choice-name").textContent.trim();

      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
      content.scrollTop = 0;
    });
  });
}
