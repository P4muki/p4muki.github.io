// ==========================================================
// p4muki — personal site / script.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  // --- Footer year ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
    "  learning: [\"HTML\", \"CSS\", \"JavaScript\"],",
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
