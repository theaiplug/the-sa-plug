function fakeSubmit(event, id) {
  event.preventDefault();
  const message = document.getElementById(id);
  if (message) {
    message.textContent =
      "Demo form saved. In the live version, this can send an email, save a lead, and trigger follow-up.";
  }
  return false;
}

/** Official Where To Go SA social profiles — single source of truth for footer + connect rows */
const WTGSA_SOCIAL_LINKS = [
  {
    href: "https://instagram.com/visitwheretogosa",
    label: "Instagram",
    platform: "Instagram",
  },
  {
    href: "https://tiktok.com/@visitwheretogosa",
    label: "TikTok",
    platform: "TikTok",
  },
  {
    href: "https://www.youtube.com/@WhereToGoSA",
    label: "YouTube",
    platform: "YouTube",
  },
  {
    href: "https://facebook.com/VisitWhereToGoSA",
    label: "Facebook",
    platform: "Facebook",
  },
  { href: "https://x.com/wheretogosa", label: "X", platform: "X" },
  {
    href: "https://threads.net/@visitwheretogosa",
    label: "Threads",
    platform: "Threads",
  },
  {
    href: "https://pin.it/5vWBJ0a5j",
    label: "Pinterest",
    platform: "Pinterest",
  },
];

function buildWtgsaSocialLinksHtml() {
  return WTGSA_SOCIAL_LINKS.map(
    ({ href, label, platform }) =>
      `<a class="wtgsa-social__link" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Follow Where To Go SA on ${platform}">${label}</a>`
  ).join("");
}

function buildWtgsaSocialBlock(variant) {
  const isInline = variant === "inline";
  const title = "Follow Where To Go SA";
  const modifier = isInline ? "wtgsa-social--inline" : "wtgsa-social--footer";
  return `<section class="wtgsa-social ${modifier}">
  <p class="wtgsa-social__title">${title}</p>
  <nav class="wtgsa-social__links" aria-label="${title}">
    ${buildWtgsaSocialLinksHtml()}
  </nav>
</section>`;
}

function initWtgsaSocialLinks() {
  document.querySelectorAll("footer.footer").forEach((footer) => {
    if (footer.querySelector(".wtgsa-social--footer")) return;
    const note = footer.querySelector(".footer-note");
    const block = document.createRange().createContextualFragment(
      buildWtgsaSocialBlock("footer")
    );
    if (note) {
      footer.insertBefore(block, note);
    } else {
      footer.appendChild(block);
    }
  });

  document.querySelectorAll("[data-wtgsa-social-inline]").forEach((host) => {
    if (host.querySelector(".wtgsa-social")) return;
    host.appendChild(
      document.createRange().createContextualFragment(buildWtgsaSocialBlock("inline"))
    );
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWtgsaSocialLinks);
} else {
  initWtgsaSocialLinks();
}

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
  menuBtn.setAttribute("aria-expanded", "false");

  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("nav-open");
    const isOpen = nav.classList.contains("nav-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}