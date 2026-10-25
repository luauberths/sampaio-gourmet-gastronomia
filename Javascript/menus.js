const menus = document.querySelector(".menus-page");

if (menus) {
  const dialog = menus.querySelector("dialog");
  let activeContent = null;
  let placeholder = null;

  // Balanced lines can be narrower than their layout box. Fit the box to
  // the rendered text so the olive branches stay beside the words.
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
    // Keep layout measurement from changing the reader's current position.
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
    // Mobile browser controls and screenshot overlays can change only height.
    if (width === noteViewportWidth) return;
    noteViewportWidth = width;
    scheduleClosingNote();
  });
  if (document.fonts) {
    document.fonts.ready.then(scheduleClosingNote);
    document.fonts.addEventListener("loadingdone", scheduleClosingNote);
  }

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
        button.querySelector(".menu-choice-name").dataset.menuTitle ||
        button.querySelector(".menu-choice-name").textContent.trim();

      if (!dialog.open) dialog.showModal();
      fitClosingNote();
      dialog.scrollTop = 0;
      content.scrollTop = 0;
    });
  });
}
