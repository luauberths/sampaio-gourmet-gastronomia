const menus = document.querySelector(".menus-page");

if (menus) {
  const dialog = menus.querySelector("dialog");
  const viewport = document.querySelector('meta[name="viewport"]');
  const originalViewport = viewport?.getAttribute("content");
  let activeContent = null;
  let placeholder = null;
  let activePhoto = null;

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
    if (activePhoto) {
      activeContent.prepend(activePhoto);
      activePhoto = null;
    }
    dialog.classList.remove("has-menu-photo");
    activeContent.hidden = true;
    placeholder.replaceWith(activeContent);
    activeContent = null;
    placeholder = null;
  }

  dialog.addEventListener("close", () => {
    if (!dialog.open) {
      restoreContent();
      if (viewport) {
        if (originalViewport === null) viewport.removeAttribute("content");
        else viewport.setAttribute("content", originalViewport);
      }
    }
  });

  menus.querySelectorAll(".menu-choice-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      restoreContent();
      const content = button.closest(".menu-choice").querySelector(".menu-choice-body");
      placeholder = document.createComment("menu-content-position");
      content.replaceWith(placeholder);
      activeContent = content;
      content.hidden = false;
      activePhoto = content.querySelector(".menu-photo");
      if (activePhoto) {
        dialog.insertBefore(activePhoto, dialog.querySelector(".page-header"));
        dialog.classList.add("has-menu-photo");
      }
      dialog.insertBefore(content, dialog.querySelector(".menu-dialog-footer"));
      dialog.querySelector("#menu-dialog-title .section-title-text").textContent =
        button.querySelector(".menu-choice-name").dataset.menuTitle ||
        button.querySelector(".menu-choice-name").textContent.trim();

      if (!dialog.open) {
        if (viewport) {
          const settings = (originalViewport || "width=device-width, initial-scale=1.0")
            .replace(/,?\s*viewport-fit\s*=\s*[^,]+/gi, "");
          viewport.setAttribute("content", `${settings}, viewport-fit=cover`);
        }
        dialog.showModal();
      }
      fitClosingNote();
      dialog.scrollTop = 0;
      content.scrollTop = 0;
    });
  });
}
