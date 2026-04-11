(function () {
  const root = document.body;
  const progressBar = document.getElementById("reading-progress");
  const topButton = document.getElementById("back-to-top");
  const themeButton = document.querySelector('[data-action="toggle-theme"]');
  const themeStorageKey = "dslwb-theme";
  const fontStorageKey = "dslwb-font-size";
  const chapterStorageKey = "dslwb-last-chapter";
  const fontSizes = [16, 18, 20, 22];

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures so the site still works in restricted contexts.
    }
  }

  function updateThemeButtonLabel(theme) {
    if (!themeButton) {
      return;
    }

    themeButton.textContent = theme === "dark" ? "切換淺色模式" : "切換深色模式";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    updateThemeButtonLabel(theme);
  }

  function applyFontSize(size) {
    root.style.setProperty("--base-font-size", size + "px");
  }

  function getStoredFontSize() {
    const stored = Number.parseInt(storageGet(fontStorageKey) || "18", 10);
    return fontSizes.includes(stored) ? stored : 18;
  }

  function updateProgress() {
    if (!progressBar) {
      return;
    }

    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    progressBar.style.width = `${ratio * 100}%`;
  }

  function updateTopButton() {
    if (!topButton) {
      return;
    }

    topButton.classList.toggle("is-visible", window.scrollY > 280);
  }

  function cycleFont(direction) {
    const current = getStoredFontSize();
    const index = fontSizes.indexOf(current);
    const nextIndex = Math.min(fontSizes.length - 1, Math.max(0, index + direction));
    const nextSize = fontSizes[nextIndex];
    storageSet(fontStorageKey, String(nextSize));
    applyFontSize(nextSize);
  }

  function setupControls() {
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action");

        if (action === "toggle-theme") {
          const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
          storageSet(themeStorageKey, nextTheme);
          applyTheme(nextTheme);
        }

        if (action === "font-up") {
          cycleFont(1);
        }

        if (action === "font-down") {
          cycleFont(-1);
        }
      });
    });
  }

  function setupTopButton() {
    if (!topButton) {
      return;
    }

    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function rememberChapter() {
    const chapterId = root.dataset.chapter;
    if (!chapterId) {
      return;
    }

    storageSet(chapterStorageKey, chapterId);
  }

  function highlightCurrentChapter() {
    const savedChapter = storageGet(chapterStorageKey);
    if (!savedChapter) {
      return;
    }

    const currentLink = document.querySelector(`[data-chapter-link="${savedChapter}"]`);
    if (currentLink) {
      currentLink.classList.add("is-current");
    }
  }

  function updateReadingStatus() {
    const savedChapter = storageGet(chapterStorageKey);
    const lastReadLabel = document.getElementById("last-read-label");
    const availableLabel = document.getElementById("available-label");

    if (availableLabel) {
      const readyCount = document.querySelectorAll("[data-ready='true']").length;
      const totalCount = document.querySelectorAll("[data-chapter-link]").length;
      availableLabel.textContent = `${readyCount} / ${totalCount} 章完成第一版內容`;
    }

    if (!lastReadLabel) {
      return;
    }

    if (!savedChapter) {
      lastReadLabel.textContent = "尚未開始閱讀";
      return;
    }

    const currentLink = document.querySelector(`[data-chapter-link="${savedChapter}"]`);
    lastReadLabel.textContent = currentLink
      ? currentLink.getAttribute("data-chapter-title") || currentLink.textContent.trim()
      : "已閱讀章節已不在目錄中";
  }

  function init() {
    const theme = storageGet(themeStorageKey) || "light";
    applyTheme(theme);
    applyFontSize(getStoredFontSize());
    setupControls();
    setupTopButton();
    rememberChapter();
    highlightCurrentChapter();
    updateReadingStatus();
    updateProgress();
    updateTopButton();
    window.addEventListener("scroll", () => {
      updateProgress();
      updateTopButton();
    });
  }

  init();
})();