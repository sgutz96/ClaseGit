
(() => {
  "use strict";

  const sections = [...document.querySelectorAll(".section")];
  const tabs = document.getElementById("tabs");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const sectionLabel = document.getElementById("sectionLabel");
  const currentSectionName = document.getElementById("currentSectionName");
  const toast = document.getElementById("toast");
  const themeButton = document.getElementById("themeButton");
  const printButton = document.getElementById("printButton");
  const menuButton = document.getElementById("menuButton");
  const nav = document.getElementById("sectionNav");

  let current = 0;
  let toastTimer;

  function buildNavigation() {
    sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      button.dataset.index = index;
      button.textContent = section.dataset.title || `Sección ${index + 1}`;
      button.setAttribute("aria-controls", section.id || `section-${index + 1}`);

      if (!section.id) {
        section.id = `section-${index + 1}`;
      }

      button.addEventListener("click", () => go(index));
      tabs.appendChild(button);
    });
  }

  function updateNavigation() {
    [...tabs.children].forEach((button, index) => {
      const active = index === current;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");

      if (active) {
        button.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    });
  }

  function go(index, shouldScroll = true) {
    if (!sections.length) return;

    current = Math.max(0, Math.min(sections.length - 1, index));

    sections.forEach((section, index) => {
      const active = index === current;
      section.classList.toggle("active", active);
      section.setAttribute("aria-hidden", active ? "false" : "true");
    });

    const title = sections[current].dataset.title || `Sección ${current + 1}`;
    const percent = ((current + 1) / sections.length) * 100;

    progressText.textContent = `${current + 1} / ${sections.length}`;
    progressBar.style.width = `${percent}%`;
    sectionLabel.textContent = title;
    currentSectionName.textContent = title;

    updateNavigation();

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function showToast(message = "Copiado al portapapeles") {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
  }

  async function copyCode(pre, button) {
    const clone = pre.cloneNode(true);
    const copy = clone.querySelector(".copy-button");
    if (copy) copy.remove();

    const text = clone.innerText.trim();

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "✓ Copiado";
      showToast();
    } catch {
      // Fallback para contextos donde Clipboard API no está disponible.
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();

      try {
        document.execCommand("copy");
        button.textContent = "✓ Copiado";
        showToast();
      } catch {
        showToast("No se pudo copiar");
      } finally {
        area.remove();
      }
    }

    setTimeout(() => {
      button.textContent = "Copiar";
    }, 1200);
  }

  function addCopyButtons() {
    document.querySelectorAll("pre").forEach(pre => {
      if (pre.querySelector(".copy-button")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.textContent = "Copiar";
      button.setAttribute("aria-label", "Copiar código");

      button.addEventListener("click", event => {
        event.stopPropagation();
        copyCode(pre, button);
      });

      pre.appendChild(button);
    });
  }

  function setupCodeTabs() {
    document.querySelectorAll(".codetabs").forEach(container => {
      const buttons = [...container.querySelectorAll(".ctab")];
      const panels = [...container.querySelectorAll(".ctab-panel")];

      buttons.forEach((button, index) => {
        button.type = "button";
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");

        button.addEventListener("click", () => {
          buttons.forEach((item, i) => {
            const active = i === index;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
          });

          panels.forEach((panel, i) => {
            panel.classList.toggle("active", i === index);
          });
        });
      });
    });
  }

  function setupKeyboardNavigation() {
    document.addEventListener("keydown", event => {
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        go(current + 1);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(current - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        go(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        go(sections.length - 1);
      }
    });
  }

  function setupTheme() {
    const saved = localStorage.getItem("git-aula-theme");
    if (saved === "light") document.body.classList.add("light");

    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("light");
      localStorage.setItem(
        "git-aula-theme",
        document.body.classList.contains("light") ? "light" : "dark"
      );
    });
  }

  function setupMobileMenu() {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });

    tabs.addEventListener("click", () => {
      if (window.innerWidth <= 640) {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  // Navigation requested by the existing lesson buttons:
  // onclick="go(n)" continues to work because go is exposed globally.
  window.go = go;

  buildNavigation();
  addCopyButtons();
  setupCodeTabs();
  setupKeyboardNavigation();
  setupTheme();
  setupMobileMenu();

  printButton?.addEventListener("click", () => window.print());

  go(0, false);
})();
