const menus = document.querySelector(".menus-page");

if (menus) {
  const dialog = menus.querySelector("dialog");
  let activeContent = null;
  let placeholder = null;
  let openingAnimation = null;
  let closingAnimation = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function closeDialog() {
    if (!dialog.open || closingAnimation) return;
    openingAnimation?.cancel();
    if (reducedMotion.matches || typeof dialog.animate !== "function") {
      dialog.close();
      return;
    }
    closingAnimation = dialog.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(4px)" },
      ],
      { duration: 150, easing: "ease-in", fill: "forwards" },
    );
    closingAnimation.finished.then(() => {
      if (dialog.open) dialog.close();
    }, () => {});
  }

  dialog.querySelector('form[method="dialog"]').addEventListener("submit", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    openingAnimation?.cancel();
    if (closingAnimation && dialog.open) dialog.close();
  });

  function fitClosingNote() {
    if (!dialog.open || !activeContent) return;
    const text = activeContent.querySelector(".menu-note-text");
    if (!text) return;

    const scrollTop = dialog.scrollTop;
    const scrollLeft = dialog.scrollLeft;
    text.style.removeProperty("width");
    const range = document.createRange();
    range.selectNodeContents(text);
    const widths = Array.from(range.getClientRects(), (rect) => rect.width);
    const width = Math.max(0, ...widths);
    if (width > 0) text.style.width = `${Math.ceil(width) + 1}px`;
    dialog.scrollTop = scrollTop;
    dialog.scrollLeft = scrollLeft;
  }

  let noteFrame = null;
  function scheduleClosingNote() {
    if (noteFrame !== null) cancelAnimationFrame(noteFrame);
    noteFrame = requestAnimationFrame(() => {
      noteFrame = null;
      fitClosingNote();
    });
  }

  let noteViewportWidth = document.documentElement.clientWidth;
  window.addEventListener("resize", () => {
    const width = document.documentElement.clientWidth;
    if (width === noteViewportWidth) return;
    noteViewportWidth = width;
    scheduleClosingNote();
  });
  if (document.fonts) {
    document.fonts.ready.then(scheduleClosingNote);
    document.fonts.addEventListener("loadingdone", scheduleClosingNote);
  }
  
  function restoreContent() {
    if (!activeContent) return;
    activeContent.hidden = true;
    placeholder.replaceWith(activeContent);
    activeContent = null;
    placeholder = null;
  }

  dialog.addEventListener("close", () => {
    if (!dialog.open) {
      openingAnimation?.cancel();
      closingAnimation?.cancel();
      openingAnimation = null;
      closingAnimation = null;
      restoreContent();
    }
  });

  menus.querySelectorAll(".menu-choice-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (closingAnimation) return;
      restoreContent();
      const content = button.closest(".menu-choice").querySelector(".menu-choice-body");
      placeholder = document.createComment("menu-content-position");
      content.replaceWith(placeholder);
      activeContent = content;
      content.hidden = false;
      dialog.insertBefore(content, dialog.querySelector(".menu-dialog-footer"));
      dialog.querySelector("#menu-dialog-title .section-title-text").textContent =
        button.querySelector(".menu-choice-name").dataset.menuTitle ||
        button.querySelector(".menu-choice-name").textContent.trim();

      if (!dialog.open) dialog.showModal();
      if (event.detail > 0 && dialog.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      fitClosingNote();
      dialog.scrollTop = 0;
      content.scrollTop = 0;
      openingAnimation?.cancel();
      if (!reducedMotion.matches && typeof dialog.animate === "function") {
        openingAnimation = dialog.animate(
          [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 200, easing: "cubic-bezier(.22, 1, .36, 1)" },
        );
      }
    });
  });
}
