
/* global gsap, ScrollTrigger */

gsap.registerPlugin(ScrollTrigger); // [2](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Render projects from JSON (easy file management)
async function loadProjects() {
  try {
    const res = await fetch("./assets/data/projects.json");
    const projects = await res.json();

    const grid = document.getElementById("projectsGrid");
    grid.innerHTML = projects.map(p => `
      <article class="project reveal">
        <h3 class="project__title">${escapeHTML(p.title)}</h3>
        <p class="project__desc">${escapeHTML(p.description)}</p>
        <div class="project__tags">
          ${(p.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join("")}
        </div>
        <div class="project__links">
          ${p.demo ? `${p.demo}Live</a>` : ""}
          ${p.repo ? `${p.repo}Code</a>` : ""}
        </div>
      </article>
    `).join("");
  } catch (e) {
    console.warn("Could not load projects.json", e);
  }
}

function escapeHTML(str="") {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[s]);
}

// Intro animation
function intro() {
  const preloader = document.getElementById("preloader");
  if (!preloader || prefersReducedMotion) {
    if (preloader) preloader.style.display = "none";
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".preloader__mark", { y: 18, opacity: 0, duration: 0.6 })
    .from(".preloader__title", { y: 16, opacity: 0, duration: 0.6 }, "-=0.35")
    .from(".preloader__sub",   { y: 10, opacity: 0, duration: 0.5 }, "-=0.35")
    .from(".preloader__waves", { y: 14, opacity: 0, duration: 0.6 }, "-=0.35")
    .to("#preloader", { opacity: 0, duration: 0.55, delay: 0.25 })
    .set("#preloader", { display: "none" });
}

// Scroll reveals
function scrollReveals() {
  if (prefersReducedMotion) return;

  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(el,
      { y: 24, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "bottom 40%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Skills bars animate on enter
  gsap.utils.toArray(".skill__bar span").forEach((bar) => {
    const level = Math.max(0, Math.min(1, Number(bar.dataset.level || 0)));
    gsap.to(bar, {
      width: `${Math.round(level * 100)}%`,
      duration: 1.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: bar,
        start: "top 88%"
      }
    });
  });

  // Parallax-ish waves in hero
  gsap.utils.toArray(".waves .wave").forEach((w, i) => {
    gsap.to(w, {
      x: i % 2 === 0 ? -80 : 80,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  });

  // Slight float for blob
  gsap.to(".liquid-blob", {
    y: 20,
    duration: 3.2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
}

// Smooth anchor fix for sticky header
function fixAnchorOffset() {
  const header = document.querySelector(".header");
  if (!header) return;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 10);
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
}

// Init
window.addEventListener("load", async () => {
  await loadProjects();
  intro();
  scrollReveals();
  fixAnchorOffset();

  // Refresh ScrollTrigger after dynamic content renders
  if (!prefersReducedMotion) ScrollTrigger.refresh();
});
