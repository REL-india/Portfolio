const dataFiles = {
  profile: "data/profile.json",
  projects: "data/projects.json",
  achievements: "data/achievements.json",
  timeline: "data/timeline.json",
  research: "data/research.json",
  skills: "data/skills.json"
};

const state = {
  projects: [],
  projectFilter: "all",
  gallery: [],
  galleryIndex: 0
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tags(items = []) {
  return items.map((item) => `<span class="tag">${escapeHTML(item)}</span>`).join("");
}

function initials(name = "Your Name") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "YN";
}

function mediaPlaceholder(label = "Portfolio visual", height) {
  const style = height ? ` style="--gallery-height:${height}px"` : "";
  return `
    <div class="media-placeholder"${style} role="img" aria-label="${escapeHTML(label)}">
      <div class="media-code" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
}
function imageOrPlaceholder(src, alt, height) {
  if (src) {
    return `
      <img
        class="site-image"
        src="${escapeHTML(src)}"
        alt="${escapeHTML(alt || "")}"
        ${height ? `style="height:${height}px"` : ""}
      >
    `;
  }

  return mediaPlaceholder(alt, height);
}
async function loadJSON() {
  const entries = Object.entries(dataFiles);
  const loaded = await Promise.all(entries.map(async ([key, path]) => {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return [key, await response.json()];
    } catch (error) {
      console.error(`Could not load ${path}`, error);
      return [key, null];
    }
  }));

  return Object.fromEntries(loaded);
}

function renderHero(profile) {
  $("#brand").textContent = profile.shortName || profile.name || "Portfolio";
  document.title = `${profile.name || "Your Name"} | Portfolio`;
  const meta = $('meta[name="description"]');
  if (meta && profile.metaDescription) meta.setAttribute("content", profile.metaDescription);

  $("#hero-content").innerHTML = `
    <div class="hero-copy">
      <span class="eyebrow">${escapeHTML(profile.hero?.eyebrow || "Personal portfolio")}</span>
      <h1>${escapeHTML(profile.hero?.headline || "Designing intelligent digital systems.")}</h1>
      <div class="hero-subtitle" id="typed-title"></div>
      <p class="hero-intro">${escapeHTML(profile.hero?.intro || profile.summary || "")}</p>
      <div class="button-row">
        ${(profile.hero?.buttons || []).map((button, index) => `
          <a class="button ${index === 0 ? "primary" : "ghost"}" href="${escapeHTML(button.href)}">
            ${escapeHTML(button.label)}
          </a>
        `).join("")}
      </div>
    </div>
    <div class="hero-card reveal">
     ${
  profile.profileImage
    ? `
      <div class="portrait-placeholder">
        <img
          class="profile-photo"
          src="${escapeHTML(profile.profileImage)}"
          alt="${escapeHTML(profile.profileImageAlt || profile.name)}"
        >
        <div class="profile-strip">
          <strong>${escapeHTML(profile.name)}</strong>
          <span>${escapeHTML((profile.titles || [])[0] || "Software Engineer")}</span>
          <span>${escapeHTML(profile.location || "Location placeholder")}</span>
        </div>
      </div>
    `
    : `
      <div class="portrait-placeholder" role="img" aria-label="${escapeHTML(profile.profileImageAlt || "Profile image placeholder")}">
        <div class="portrait-initials">${escapeHTML(initials(profile.name))}</div>
        <div class="profile-strip">
          <strong>${escapeHTML(profile.name)}</strong>
          <span>${escapeHTML((profile.titles || [])[0] || "Software Engineer")}</span>
          <span>${escapeHTML(profile.location || "Location placeholder")}</span>
        </div>
      </div>
    `
}
  `;

  typeTitles(profile.titles || []);
}

function renderAbout(profile) {
  $("#about-content").innerHTML = `
    <div class="about-layout">
      <div class="about-image reveal">
  ${
    profile.aboutImage
      ? `
        <img
          class="profile-photo about-photo"
          src="${escapeHTML(profile.aboutImage)}"
          alt="${escapeHTML(profile.profileImageAlt || profile.name)}"
        >
      `
      : `
        <div class="portrait-placeholder" role="img" aria-label="${escapeHTML(profile.profileImageAlt || "Profile image placeholder")}">
          <div class="portrait-initials">${escapeHTML(initials(profile.name))}</div>
        </div>
      `
  }
</div>
      <div class="about-copy">
        <div class="lead-card reveal">
          ${(profile.bio || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}
        </div>
        <div class="card-grid">
          ${(profile.highlights || []).map((item) => `
            <article class="glass-card mini-card reveal">
              <span class="kicker">${escapeHTML(item.label)}</span>
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(item.description)}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </div>
    <div class="stats-grid">
      ${(profile.stats || []).map((item) => `
        <article class="glass-card stat-card reveal">
          <span class="stat-value" data-counter="${Number(item.value) || 0}" data-suffix="${escapeHTML(item.suffix || "")}">0${escapeHTML(item.suffix || "")}</span>
          <span class="stat-label">${escapeHTML(item.label)}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTimeline(timeline) {
  $("#timeline-content").innerHTML = (timeline.entries || []).map((item) => `
    <article class="glass-card timeline-card reveal">
      <div class="timeline-meta">
        <span class="pill">${escapeHTML(item.type)}</span>
        <span>${escapeHTML(item.period)}</span>
      </div>
      <h3>${escapeHTML(item.title)}</h3>
      <p><strong>${escapeHTML(item.organization)}</strong></p>
      <p>${escapeHTML(item.description)}</p>
    </article>
  `).join("");
}

function renderProjects(projects) {
  state.projects = projects || [];
  const categories = ["all", ...new Set(state.projects.map((project) => project.category))];

  $("#project-toolbar").innerHTML = `
    <input class="search-field" id="project-search" type="search" placeholder="Search projects" aria-label="Search projects">
    <div class="filter-row">
      ${categories.map((category) => `
        <button class="filter-button ${category === "all" ? "is-active" : ""}" type="button" data-filter="${escapeHTML(category)}">
          ${escapeHTML(category)}
        </button>
      `).join("")}
    </div>
  `;

  $("#project-search").addEventListener("input", renderFilteredProjects);
  $$(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.projectFilter = button.dataset.filter;
      $$(".filter-button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderFilteredProjects();
    });
  });

  renderFilteredProjects();
}

function renderFilteredProjects() {
  const query = ($("#project-search")?.value || "").trim().toLowerCase();
  const filtered = state.projects.filter((project) => {
    const matchesFilter = state.projectFilter === "all" || project.category === state.projectFilter;
    const haystack = [
      project.title,
      project.subtitle,
      project.description,
      ...(project.tags || [])
    ].join(" ").toLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });

  const grid = $("#project-grid");
  grid.innerHTML = filtered.length ? filtered.map((project) => `
    <article class="glass-card project-card reveal" data-project-id="${escapeHTML(project.id)}" tabindex="0" role="button" aria-label="Open ${escapeHTML(project.title)} details">
      ${imageOrPlaceholder(
  project.image,
  project.imageAlt || project.title
)}
      <div class="project-body">
        <span class="pill">${escapeHTML(project.category)}</span>
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <div class="tag-row">${tags(project.tags)}</div>
        <div class="project-actions">
          <span class="text-link">View details</span>
          ${project.links?.live ? `<a class="text-link" href="${escapeHTML(project.links.live)}" target="_blank" rel="noopener">Live</a>` : ""}
          ${project.links?.github ? `<a class="text-link" href="${escapeHTML(project.links.github)}" target="_blank" rel="noopener">Code</a>` : ""}
        </div>
      </div>
    </article>
  `).join("") : `<div class="glass-card empty-state">No projects match that search yet.</div>`;

  $$(".project-card", grid).forEach((card) => {
    const open = () => openProjectModal(card.dataset.projectId);
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      open();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  observeReveals(grid);
}

function openProjectModal(projectId) {
  const project = state.projects.find((item) => String(item.id) === String(projectId));
  if (!project) return;

  $("#project-modal-card").innerHTML = `
    <div class="modal-head">
      <div>
        <span class="pill">${escapeHTML(project.category)} / ${escapeHTML(project.year)}</span>
        <h3>${escapeHTML(project.title)}</h3>
      </div>
      <button class="icon-button" type="button" data-close-modal aria-label="Close project details">x</button>
    </div>
    ${imageOrPlaceholder(
  project.image,
  project.imageAlt || project.title,
  420
)}
    <div class="modal-content">
      <p><strong>${escapeHTML(project.subtitle || "")}</strong></p>
      ${(project.longDescription || "").split(/\n+/).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}
      <div class="tag-row">${tags(project.tags)}</div>
      ${(project.highlights || []).length ? `
        <h4>Highlights</h4>
        <div class="card-grid">
          ${project.highlights.map((highlight) => `<div class="glass-card mini-card"><p>${escapeHTML(highlight)}</p></div>`).join("")}
        </div>
      ` : ""}
      <div class="project-actions">
        ${project.links?.live ? `<a class="button primary" href="${escapeHTML(project.links.live)}" target="_blank" rel="noopener">Open live</a>` : ""}
        ${project.links?.github ? `<a class="button ghost" href="${escapeHTML(project.links.github)}" target="_blank" rel="noopener">View code</a>` : ""}
      </div>
    </div>
  `;

  openOverlay("#project-modal");
  $("[data-close-modal]").addEventListener("click", () => closeOverlay("#project-modal"));
}

function renderAchievements(data) {
  $("#achievements-content").innerHTML = (data.categories || []).map((category, index) => `
    <section class="reveal">
      <h3 class="category-title"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHTML(category.name)}</h3>
      <div class="achievement-grid">
        ${(category.items || []).map((item) => `
          <article class="glass-card achievement-card reveal">
            <h4>${escapeHTML(item.title)}</h4>
            <strong>${escapeHTML(item.organization)}</strong>
            <time>${escapeHTML(item.date)}</time>
            <p>${escapeHTML(item.description)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderResearch(data) {
  $("#research-content").innerHTML = (data.entries || []).map((item) => `
    <article class="glass-card research-card reveal">
      <span class="pill">${escapeHTML(item.type)}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <div class="research-meta">
        ${item.authors ? `<span>${escapeHTML(item.authors)}</span>` : ""}
        ${item.venue ? `<span>${escapeHTML(item.venue)}</span>` : ""}
        ${item.status ? `<span>${escapeHTML(item.status)}</span>` : ""}
        <span>${escapeHTML(item.date)}</span>
      </div>
      <p>${escapeHTML(item.abstract)}</p>
      <div class="tag-row">${tags(item.tags)}</div>
      ${item.link ? `<div class="project-actions"><a class="text-link" href="${escapeHTML(item.link)}" target="_blank" rel="noopener">View details</a></div>` : ""}
    </article>
  `).join("");
}

function renderSkills(data) {
  $("#skills-content").innerHTML = (data.categories || []).map((category) => `
    <article class="glass-card skill-card reveal">
      <span class="pill">${escapeHTML(category.label)}</span>
      <h3>${escapeHTML(category.name)}</h3>
      <div class="skill-list">
        ${(category.skills || []).map((skill) => `
          <div class="skill-line">
            <div class="skill-info">
              <span>${escapeHTML(skill.name)}</span>
              <span>${Number(skill.level) || 0}%</span>
            </div>
            <div class="skill-bar"><div class="skill-fill" data-level="${Number(skill.level) || 0}"></div></div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

function renderGallery(profile) {
  state.gallery = profile.gallery || [];
  $("#gallery-content").innerHTML = state.gallery.map((item, index) => `
    <article class="gallery-item reveal" data-gallery-index="${index}" tabindex="0" role="button" aria-label="Open ${escapeHTML(item.caption)}">
      ${imageOrPlaceholder(
  item.image,
  item.alt || item.caption,
  item.height || 280
)}
      <div class="gallery-caption">${escapeHTML(item.caption || item.alt)}</div>
    </article>
  `).join("");

  $$(".gallery-item").forEach((item) => {
    const open = () => openLightbox(Number(item.dataset.galleryIndex));
    item.addEventListener("click", open);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function renderResume(profile) {
  const resume = profile.resume || {};
  $("#resume-content").innerHTML = `
    <article class="glass-card resume-card reveal">
     <div class="resume-preview" aria-label="Resume preview">
  ${
    resume.image
      ? `
        <img
          class="resume-image"
          src="${escapeHTML(resume.image)}"
          alt="${escapeHTML(resume.previewLabel || "Resume Preview")}"
        >
      `
      : `
        <h3>${escapeHTML(resume.previewLabel || "Resume preview")}</h3>
        ${Array.from({ length: 17 }, () => `<div class="resume-preview-line"></div>`).join("")}
      `
  }
</div>
      <div class="resume-copy">
        <span class="pill">${escapeHTML(resume.status || "Available")}</span>
        <h3>${escapeHTML(resume.title || "Resume")}</h3>
        <p>${escapeHTML(resume.description || "")}</p>
        <div class="resume-meta">
          <span class="tag">Updated ${escapeHTML(resume.lastUpdated || "2026")}</span>
          <span class="tag">${escapeHTML(resume.format || "PDF")}</span>
          <span class="tag">${escapeHTML(resume.size || "Placeholder")}</span>
        </div>
        <a class="button primary" href="${escapeHTML(resume.url || "#")}" download>Download resume</a>
      </div>
    </article>
  `;
}

function renderContact(profile) {
  const social = profile.social || {};
  $("#contact-content").innerHTML = `
    <div class="contact-grid">
      <article class="glass-card contact-card reveal">
        <span class="pill">${escapeHTML(profile.availability || "Available")}</span>
        <h3>${escapeHTML(profile.contact?.headline || "Let us build something excellent.")}</h3>
        <p>${escapeHTML(profile.contact?.intro || "")}</p>
        <div class="contact-list">
          <a href="mailto:${escapeHTML(profile.email)}"><b>Email</b><span>${escapeHTML(profile.email)}</span></a>
          <span><b>Location</b><span>${escapeHTML(profile.location)}</span></span>
          ${social.linkedin ? `<a href="${escapeHTML(social.linkedin)}" target="_blank" rel="noopener"><b>LinkedIn</b><span>Profile</span></a>` : ""}
          ${social.github ? `<a href="${escapeHTML(social.github)}" target="_blank" rel="noopener"><b>GitHub</b><span>Repos</span></a>` : ""}
          ${social.twitter ? `<a href="${escapeHTML(social.twitter)}" target="_blank" rel="noopener"><b>Social</b><span>Updates</span></a>` : ""}
        </div>
      </article>
      <div class="glass-card contact-form reveal">
  <iframe
    src="${escapeHTML(profile.contact?.googleForm || "")}"
    width="100%"
    height="1000"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    loading="lazy">
    Loading...
  </iframe>
</div>
    </div>
  `;
}
document.addEventListener("mousemove",(e)=>{
  document.body.style.setProperty("--x",e.clientX+"px");
  document.body.style.setProperty("--y",e.clientY+"px");
});
document.querySelectorAll(".glass-card").forEach(card=>{
  card.addEventListener("mousemove",(e)=>{
    const rect=card.getBoundingClientRect();

    const x=(e.clientX-rect.left)/rect.width;
    const y=(e.clientY-rect.top)/rect.height;

    card.style.transform=
      `perspective(1000px)
       rotateX(${(0.5-y)*10}deg)
       rotateY(${(x-0.5)*10}deg)`;
  });

  card.addEventListener("mouseleave",()=>{
    card.style.transform="";
  });
});
function renderFooter(profile) {
  $("#footer").innerHTML = `
    <div class="footer-inner">
      <div>${escapeHTML(profile.footer?.copyright || "Copyright placeholder")}</div>
      <div class="footer-links">
        ${(profile.footer?.links || ["About", "Projects", "Skills", "Contact"]).map((item) => `
          <a href="#${escapeHTML(item.toLowerCase())}">${escapeHTML(item)}</a>
        `).join("")}
      </div>
    </div>
  `;
}

function initNavigation() {
  const header = $("#site-header");
  const panel = $("#nav-panel");
  const toggle = $("#nav-toggle");

  const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$("#nav-panel a").forEach((link) => {
    link.addEventListener("click", () => {
      panel.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const sections = $$("main section[id]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$("#nav-panel a").forEach((link) => {
        link.classList.toggle("is-active", link.dataset.section === entry.target.id);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

  sections.forEach((section) => observer.observe(section));
}

function observeReveals(root = document) {
  const items = $$(".reveal:not(.is-visible)", root);
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
    observer.observe(item);
  });
}

function initCounters() {
  const counters = $$("[data-counter]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.counter) || 0;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 1200;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(end * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => observer.observe(counter));
}

function initSkillBars() {
  const bars = $$(".skill-fill");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.width = `${entry.target.dataset.level}%`;
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  bars.forEach((bar) => observer.observe(bar));
}

function typeTitles(titles) {
  const el = $("#typed-title");
  if (!el || !titles.length) return;

  let titleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const text = titles[titleIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = text.slice(0, charIndex);

    if (!deleting && charIndex === text.length) {
      deleting = true;
      setTimeout(tick, 1400);
      return;
    }

    if (deleting && charIndex === 0) {
      deleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
    }

    setTimeout(tick, deleting ? 34 : 58);
  };

  tick();
}

function openOverlay(selector) {
  const overlay = $(selector);
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeOverlay(selector) {
  const overlay = $(selector);
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function initOverlays() {
  $("#project-modal").addEventListener("click", (event) => {
    if (event.target.id === "project-modal") closeOverlay("#project-modal");
  });

  $("#lightbox-close").addEventListener("click", () => closeOverlay("#lightbox"));
  $("#lightbox").addEventListener("click", (event) => {
    if (event.target.id === "lightbox") closeOverlay("#lightbox");
  });
  $("#lightbox-prev").addEventListener("click", () => moveLightbox(-1));
  $("#lightbox-next").addEventListener("click", () => moveLightbox(1));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOverlay("#project-modal");
      closeOverlay("#lightbox");
    }
    if ($("#lightbox").classList.contains("is-open") && event.key === "ArrowLeft") moveLightbox(-1);
    if ($("#lightbox").classList.contains("is-open") && event.key === "ArrowRight") moveLightbox(1);
  });
}

function openLightbox(index) {
  state.galleryIndex = index;
  renderLightbox();
  openOverlay("#lightbox");
}

function moveLightbox(step) {
  if (!state.gallery.length) return;
  state.galleryIndex = (state.galleryIndex + step + state.gallery.length) % state.gallery.length;
  renderLightbox();
}

function renderLightbox() {
  const item = state.gallery[state.galleryIndex];
  if (!item) return;
  $("#lightbox-stage").innerHTML = `
    ${imageOrPlaceholder(
  item.image,
  item.alt || item.caption,
  520
)}
    <div class="gallery-caption">${escapeHTML(item.caption || item.alt)}</div>
  `;
}

function initParticles() {
  const canvas = $("#particle-field");
  const context = canvas.getContext("2d");
  let particles = [];
  let width = 0;
  let height = 0;
  let animationId = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(90, Math.max(32, Math.floor((width * height) / 18000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.8 + 0.7
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(115, 247, 231, 0.7)";
    context.strokeStyle = "rgba(115, 247, 231, 0.12)";
    context.lineWidth = 1;

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 118) {
          context.globalAlpha = 1 - distance / 118;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
    }

    animationId = requestAnimationFrame(draw);
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  resize();
  window.addEventListener("resize", resize);
  if (!reducedMotion) draw();

  window.addEventListener("beforeunload", () => cancelAnimationFrame(animationId));
}

async function init() {
  const data = await loadJSON();

  if (data.profile) {
    renderHero(data.profile);
    renderAbout(data.profile);
    renderGallery(data.profile);
    renderResume(data.profile);
    renderContact(data.profile);
    renderFooter(data.profile);
  }

  if (data.timeline) renderTimeline(data.timeline);
  if (data.projects) renderProjects(data.projects);
  if (data.achievements) renderAchievements(data.achievements);
  // if (data.research) renderResearch(data.research);
  if (data.skills) renderSkills(data.skills);

  initNavigation();
  initOverlays();
  initParticles();
  observeReveals();
  initCounters();
  initSkillBars();

  window.setTimeout(() => $("#loader")?.classList.add("is-hidden"), 500);
}

document.addEventListener("DOMContentLoaded", init);
