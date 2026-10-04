(function () {
const { setup, render } = window.VilaRedShader;

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

/* ---------- Shader "Moving gradient" (nodo 76:38) ---------- */
const SHADER_PARAMS = {
  intensity: 4.289999961853027,
  gradient: {
    stops: [
      { position: 0, color: { r: 0.9098039269447327, g: 0.4000000059604645, b: 0.0235294122248888, a: 1 } },
      { position: 0.5, color: { r: 1, g: 1, b: 1, a: 0.949999988079071 } },
      { position: 1, color: { r: 0.9098039269447327, g: 0.4000000059604645, b: 0.0235294122248888, a: 1 } },
    ],
  },
  gradientBalance: 0,
  material: 0,
  morphSpeed: 3.740000009536743,
  detail: 1.7799999713897705,
  twist: 0.03999999910593033,
  zoom: 72,
  gradientMethod: 0,
  warp: 0.25999999046325684,
  rotationSpeed: 12,
};

async function startShader(canvas) {
  if (!navigator.gpu) return;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return;
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const frame = { state: {}, params: SHADER_PARAMS, time: 0, output: null };
  setup(device, frame);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = true;
  let raf = 0;
  const start = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function draw(now) {
    resize();
    frame.output = context.getCurrentTexture();
    frame.time = reduceMotion.matches ? 0 : now - start;
    render(device, frame);
  }

  function loop(now) {
    draw(now);
    raf = visible && !reduceMotion.matches ? requestAnimationFrame(loop) : 0;
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) kick();
  }).observe(canvas);
  new ResizeObserver(kick).observe(canvas);
  reduceMotion.addEventListener("change", kick);

  canvas.classList.add("is-ready");
  kick();
}

startShader(document.querySelector(".about__shader")).catch((err) =>
  console.warn("Shader WebGPU no disponible, se usa el degradado CSS.", err)
);
})();
