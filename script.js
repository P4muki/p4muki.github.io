// ==========================================================
// p4muki — personal site / script.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  // --- Footer year ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Dark / light theme toggle ---
  // (initial theme is already applied by the inline snippet in <head>,
  //  this just wires up the button + keeps it in sync)
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("p4muki-theme", next); } catch (err) {}
      themeToggle.setAttribute("aria-pressed", String(next === "dark"));
    });
  }

  // --- Highlight the current page in the nav (skips in-page anchor links) ---
  const navLinks = document.querySelectorAll(".nav a[href]");
  const currentPage = location.pathname.split("/").pop() || "index.html";
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href.startsWith("#")) return;
    const linkPage = href.split("#")[0];
    if (linkPage === currentPage) link.classList.add("is-active");
  });

  // --- Animated stat counters ---
  const counterEls = document.querySelectorAll("[data-count-to]");
  if (counterEls.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.countTo, 10) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1100;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = target + suffix;
      } else {
        requestAnimationFrame(tick);
      }
    };
    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counterEls.forEach(el => counterObserver.observe(el));
    } else {
      counterEls.forEach(animateCounter);
    }
  }

  // --- Guestbook (stored locally in this browser via localStorage) ---
  const guestbookForm = document.getElementById("guestbookForm");
  const guestbookEntries = document.getElementById("guestbookEntries");
  const GUESTBOOK_KEY = "p4muki-guestbook";

  function loadGuestbookEntries() {
    try {
      return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
    } catch (err) {
      return [];
    }
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderGuestbook() {
    if (!guestbookEntries) return;
    const entries = loadGuestbookEntries();
    if (!entries.length) {
      guestbookEntries.innerHTML = '<p class="guestbook-empty">// no messages yet — be the first to sign in!</p>';
      return;
    }
    guestbookEntries.innerHTML = entries
      .slice()
      .reverse()
      .map(entry => `
        <div class="guestbook-entry">
          <div class="guestbook-entry-head">
            <span>${escapeHTML(entry.name)}</span>
            <span>${escapeHTML(entry.date)}</span>
          </div>
          <p>${escapeHTML(entry.message)}</p>
        </div>
      `)
      .join("");
  }

  if (guestbookForm) {
    renderGuestbook();
    guestbookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("guestName");
      const msgInput = document.getElementById("guestMessage");
      const name = (nameInput.value || "anonymous").trim().slice(0, 40);
      const message = (msgInput.value || "").trim().slice(0, 240);
      if (!message) return;
      const entries = loadGuestbookEntries();
      entries.push({
        name: name || "anonymous",
        message,
        date: new Date().toLocaleDateString()
      });
      try { localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries)); } catch (err) {}
      msgInput.value = "";
      nameInput.value = "";
      renderGuestbook();
    });
  }

  // --- Search Helper: Finn.no + Facebook Marketplace deep links ---
  const searchForm = document.getElementById("searchHelperForm");
  const searchResults = document.getElementById("searchResults");
  if (searchForm && searchResults) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("searchQuery");
      const query = (input.value || "").trim();
      if (!query) return;
      const encoded = encodeURIComponent(query);
      searchResults.innerHTML = `
        <a class="search-result-link" href="https://www.finn.no/recommerce/forsale/search?q=${encoded}" target="_blank" rel="noopener">
          <span class="search-result-site">FINN.no (Torget) &mdash; "${escapeHTML(query)}"</span>
          <span class="search-result-arrow">&rarr;</span>
        </a>
        <a class="search-result-link" href="https://www.facebook.com/marketplace/search/?query=${encoded}" target="_blank" rel="noopener">
          <span class="search-result-site">Facebook Marketplace &mdash; "${escapeHTML(query)}"</span>
          <span class="search-result-arrow">&rarr;</span>
        </a>
      `;
      searchResults.classList.add("is-visible");
    });
  }

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Typing effect in the hero "editor" ---
  const typedEl = document.getElementById("typedCode");
  const cursorEl = document.getElementById("cursor");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Update these lines with your own info whenever you like.
  const codeLines = [
    "const p4muki = {",
    "  name: \"p4muki\",",
    "  level: \"just starting out\",",
    "  cat: \"Pamuk\", // 🐾",
    "  learning: [\"MC PVP\", \"Python\", \"Github\"],",
    "  goal: \"a little more progress every day\",",
    "};"
  ];
  const fullText = codeLines.join("\n");

  function highlight(text) {
    // Simple syntax highlighting (not a real tokenizer, just for looks)
    return text
      .replace(/"([^"]*)"/g, '<span class="tok-string">"$1"</span>')
      .replace(/\/\/(.*)$/gm, '<span class="tok-comment">//$1</span>')
      .replace(/\b(const)\b/g, '<span class="tok-keyword">$1</span>')
      .replace(/([a-zA-Z0-9_]+)(?=:)/g, '<span class="tok-key">$1</span>');
  }

  function typeText() {
    if (!typedEl) return;

    if (prefersReducedMotion) {
      typedEl.innerHTML = highlight(fullText);
      return;
    }

    let i = 0;
    const speed = 18; // ms per character

    function step() {
      if (i <= fullText.length) {
        typedEl.innerHTML = highlight(fullText.slice(0, i));
        i++;
        setTimeout(step, speed);
      } else if (cursorEl) {
        cursorEl.style.marginLeft = "2px";
      }
    }
    step();
  }
  typeText();

  // --- Scroll reveal for sections ---
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          // Skills section: animate bars once visible
          if (entry.target.id === "skills") {
            entry.target.querySelectorAll(".skill-fill").forEach(bar => {
              bar.classList.add("animate");
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: no IntersectionObserver support
    revealEls.forEach(el => el.classList.add("is-visible"));
    document.querySelectorAll(".skill-fill").forEach(bar => bar.classList.add("animate"));
  }

  // --- Copy email to clipboard ---
  const copyBtn = document.getElementById("copyEmail");
  const copyHint = document.getElementById("copyHint");
  if (copyBtn && copyHint) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyHint.textContent = "copied ✓";
        copyHint.classList.add("copied");
      } catch (err) {
        copyHint.textContent = "couldn't copy";
      }
      setTimeout(() => {
        copyHint.textContent = "copy";
        copyHint.classList.remove("copied");
      }, 1800);
    });
  }

});
