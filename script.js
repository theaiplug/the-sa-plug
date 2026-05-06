function fakeSubmit(event, id) {
  event.preventDefault();
  const message = document.getElementById(id);
  if (message) {
    message.textContent = "Demo form saved. In the live version, this can send an email, save a lead, and trigger follow-up.";
  }
  return false;
}

const menuBtn = document.querySelector(".menu-btn");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    alert("Demo menu. In the full build, this opens a mobile navigation panel.");
  });
}
