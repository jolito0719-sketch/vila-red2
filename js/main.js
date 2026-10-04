(function () {

/* ---------- Menú lateral (nodo 33:291) ---------- */
const menuBtn = document.querySelector(".nav__menu");
const drawer = document.getElementById("menu");
const backdrop = document.querySelector(".drawer-backdrop");
const closeBtn = drawer.querySelector(".drawer__close");

function setMenu(open) {
  drawer.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  drawer.inert = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("no-scroll", open);
  (open ? closeBtn : menuBtn).focus();
}

menuBtn.addEventListener("click", () => setMenu(true));
closeBtn.addEventListener("click", () => setMenu(false));
backdrop.addEventListener("click", () => setMenu(false));
drawer.querySelectorAll("a[href^='#']").forEach((a) =>
  a.addEventListener("click", () => setMenu(false))
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("is-open")) setMenu(false);
});

/* ---------- Formulario de contacto ---------- */
const form = document.querySelector(".contact__form");
const status = form.querySelector(".contact__status");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = `Consulta web de ${data.get("nombre")}`;
  const body = [
    `Nombre: ${data.get("nombre")}`,
    `Teléfono: ${data.get("telefono") || "-"}`,
    `Email: ${data.get("email")}`,
    "",
    data.get("mensaje"),
  ].join("\n");
  window.location.href =
    `mailto:info@vilared.es?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Abriendo tu cliente de correo…";
});
})();
