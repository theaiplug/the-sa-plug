function fakeSubmit(event, id) {
  event.preventDefault();
  const message = document.getElementById(id);
  if (message) {
    message.textContent =
      "Demo form saved. In the live version, this can send an email, save a lead, and trigger follow-up.";
  }
  return false;
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