(() => {
  const section = document.currentScript.dataset.section;
  if (!section || !window.matchMedia("(max-width: 950px)").matches) return;
  try {
    sessionStorage.setItem("sampaioMobileDestination", section);
  } catch { }
  window.location.replace(`index.html#${section}`);
})();
