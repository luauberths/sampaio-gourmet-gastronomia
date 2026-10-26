const menus = document.querySelector(".menus-page");

if (menus) {
  const dialog = menus.querySelector("dialog");
  const scroller = dialog.querySelector(".menu-dialog-scroll");
  let savedScrollTop = 0;
  let savedScrollLeft = 0;
  let resumePosition = null;
  let resumeFrame = null;
  let resumeTimer = null;
  let activeContent = null;
  let placeholder = null;
  let openingAnimation = null;
  let closingAnimation = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function cancelScrollRestore() {
    if (resumeFrame !== null) cancelAnimationFrame(resumeFrame);
    if (resumeTimer !== null) clearTimeout(resumeTimer);
    resumeFrame = null;
    resumeTimer = null;
    resumePosition = null;
  }

  function rememberScroll() {
    if (!dialog.open || resumePosition || document.visibilityState === "hidden") return;
    savedScrollTop = scroller.scrollTop;
    savedScrollLeft = scroller.scrollLeft;
  }

  function suspendScroll() {
    if (!dialog.open || resumePosition) return;
    resumePosition = { top: savedScrollTop, left: savedScrollLeft };
  }

  function resumeScroll() {
    if (!dialog.open || !resumePosition) return;
    const position = resumePosition;
    const restore = () => {
      if (!dialog.open || resumePosition !== position) return;
      scroller.scrollTop = position.top;
      scroller.scrollLeft = position.left;
    };
    if (resumeFrame !== null) cancelAnimationFrame(resumeFrame);
    if (resumeTimer !== null) clearTimeout(resumeTimer);
    restore();
    resumeFrame = requestAnimationFrame(() => {
      resumeFrame = null;
      restore();
    });
    resumeTimer = setTimeout(() => {
      resumeTimer = null;
      restore();
      resumePosition = null;
      rememberScroll();
    }, 250);
  }

  scroller.addEventListener("scroll", rememberScroll, { passive: true });
  dialog.addEventListener("pointerdown", cancelScrollRestore, { passive: true });
  dialog.addEventListener("wheel", cancelScrollRestore, { passive: true });
  dialog.addEventListener("keydown", cancelScrollRestore);
  window.addEventListener("blur", suspendScroll);
  window.addEventListener("focus", resumeScroll);
  window.addEventListener("pagehide", suspendScroll);
  window.addEventListener("pageshow", resumeScroll);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") suspendScroll();
    else resumeScroll();
  });

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

    const scrollTop = scroller.scrollTop;
    const scrollLeft = scroller.scrollLeft;
    text.style.removeProperty("width");
    const range = document.createRange();
    range.selectNodeContents(text);
    const widths = Array.from(range.getClientRects(), (rect) => rect.width);
    const width = Math.max(0, ...widths);
    if (width > 0) text.style.width = `${Math.ceil(width) + 1}px`;
    scroller.scrollTop = scrollTop;
    scroller.scrollLeft = scrollLeft;
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
      cancelScrollRestore();
      savedScrollTop = 0;
      savedScrollLeft = 0;
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
      cancelScrollRestore();
      savedScrollTop = 0;
      savedScrollLeft = 0;
      restoreContent();
      const content = button.closest(".menu-choice").querySelector(".menu-choice-body");
      placeholder = document.createComment("menu-content-position");
      content.replaceWith(placeholder);
      activeContent = content;
      content.hidden = false;
      scroller.insertBefore(content, scroller.querySelector(".menu-dialog-footer"));
      dialog.querySelector("#menu-dialog-title .section-title-text").textContent =
        button.querySelector(".menu-choice-name").dataset.menuTitle ||
        button.querySelector(".menu-choice-name").textContent.trim();

      if (!dialog.open) dialog.showModal();
      if (event.detail > 0 && dialog.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      fitClosingNote();
      scroller.scrollTop = 0;
      content.scrollTop = 0;
      openingAnimation?.cancel();
      if (!reducedMotion.matches && typeof dialog.animate === "function") {
        openingAnimation = scroller.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 260, easing: "cubic-bezier(.22, 1, .36, 1)" },
        );
      }
    });
  });
}
