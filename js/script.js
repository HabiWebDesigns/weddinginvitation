/* ============================================================
   CONFIGURATION — change these values for your own wedding.
   ============================================================ */
const weddingConfig = {
  groomName: "JOE",                            // CHANGE
  brideName: "JANE",                           // CHANGE
  weddingDate: "2027-06-20T15:00:00",          // CHANGE (countdown + calendar)
  ceremonyTime: "3:00 PM",                     // CHANGE
  receptionTime: "5:00 PM",                    // CHANGE
  venue: "The Enchanted Garden",               // CHANGE
  address: "123 Garden Avenue",                // CHANGE
  rsvpEndpoint: "YOUR_GOOGLE_APPS_SCRIPT_URL"  // CHANGE: Apps Script Web App URL (see README)
};
const weddingDate = new Date(weddingConfig.weddingDate);
const RSVP_ENDPOINT = weddingConfig.rsvpEndpoint;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const titleCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/* ---------- Config -> page text ---------- */
function applyConfig() {
  const c = weddingConfig;
  const dateLong = weddingDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const values = { ...c, brideName: titleCase(c.brideName), groomName: titleCase(c.groomName), dateLong };
  $$("[data-cfg]").forEach(el => { el.textContent = values[el.dataset.cfg]; });
  $("#mapBtn").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${c.venue}, ${c.address}`);
}

/* ---------- Photos: load images; keep the pretty placeholder if a file is missing ---------- */
function initPhotos() {
  $$("img[data-src]").forEach(img => {
    const holder = img.closest(".ph");
    img.loading = "lazy";
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `View larger image: ${img.alt}`);
    img.addEventListener("load", () => holder && holder.classList.add("has-img"));
    img.addEventListener("error", () => img.remove());
    img.src = img.dataset.src;
  });
}

/* ---------- Image preview ---------- */
function initImagePreview() {
  const dialog = $("#imagePreview"), preview = $("#previewImage"), caption = $("#previewCaption");
  function openPreview(img) {
    if (!img.naturalWidth) return;
    preview.src = img.currentSrc || img.src;
    preview.alt = img.alt;
    caption.textContent = img.alt;
    dialog.showModal();
  }
  document.addEventListener("click", e => {
    const img = e.target.closest("img[data-src]");
    if (img) openPreview(img);
  });
  document.addEventListener("keydown", e => {
    const img = e.target.closest && e.target.closest("img[data-src]");
    if (img && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openPreview(img);
    }
  });
  $(".image-preview-close", dialog).addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => {
    if (e.target === dialog) dialog.close();
  });
}

/* ---------- Petals, dust and fireflies ---------- */
function createParticles(count = 24) {
  const box = $("#particles");
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const kind = i % 4 === 0 ? "petal" : i % 4 === 1 ? "fly" : "";
    const size = kind === "fly" ? 4 + Math.random() * 3 : 4 + Math.random() * 10;
    p.className = kind;
    Object.assign(p.style, {
      left: Math.random() * 100 + "%", width: size + "px", height: (kind === "petal" ? size * 1.4 : size) + "px",
      animationDuration: (kind === "fly" ? 6 : 12) + Math.random() * 14 + "s", animationDelay: -Math.random() * 20 + "s"
    });
    if (kind === "fly") p.style.bottom = Math.random() * 70 + "%";
    p.style.setProperty("--dx", Math.random() * 160 - 80 + "px");
    box.appendChild(p);
  }
}

/* ---------- Music ---------- */
const audio = $("#audio"), musicBtn = $("#music");
function setMusicState(on) {
  musicBtn.setAttribute("aria-pressed", on);
  musicBtn.setAttribute("aria-label", on ? "Pause music" : "Play music");
}
function playMusic() {
  audio.volume = 0.5;
  return audio.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
}
function initMusic() {
  musicBtn.addEventListener("click", () => audio.paused ? playMusic() : (audio.pause(), setMusicState(false)));
  audio.addEventListener("play", () => setMusicState(true));
  audio.addEventListener("pause", () => setMusicState(false));
}

/* ---------- Door sequence ---------- */
function initDoor() {
  const intro = $("#intro"), door = $("#door"), main = $("#main");
  const wait = ms => reduceMotion ? 50 : ms;
  let started = false;
  function open() {
    if (started) return; started = true;
    door.classList.add("open");                                     // 1. doors swing inward
    setTimeout(() => intro.classList.add("go"), wait(1500));        // 2. walk through the doorway
    setTimeout(() => {                                              // 3. arrive in the garden
      intro.classList.add("reveal");
      main.classList.add("shown"); main.removeAttribute("aria-hidden");
      document.body.classList.remove("locked");
      musicBtn.hidden = false; scrollTo(0, 0);
    }, wait(3400));
    setTimeout(() => intro.remove(), wait(5400));
  }
  door.addEventListener("click", open);
  $("#openBtn").addEventListener("click", open);
}

/* ---------- Scroll reveal + parallax ---------- */
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$(".rv").forEach((el, i) => { el.style.setProperty("--d", (i % 4) * 0.12 + "s"); io.observe(el); });
  if (reduceMotion) return;
  const img = $("#couplePhoto"), banner = $(".banner img");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      [[img, 0.04, 1.08], [banner, 0.08, 1.2]].forEach(([el, k, s]) => {
        if (!el || !el.isConnected || !el.parentElement) return;
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) el.style.transform = `translateY(${(r.top - innerHeight / 2) * -k}px) scale(${s})`;
      });
      ticking = false;
    });
  }, { passive: true });
}

/* ---------- Countdown ---------- */
function initCountdown() {
  const ids = ["months", "days", "hours", "minutes", "seconds"];
  const els = Object.fromEntries(ids.map(k => [k, $("#cd-" + k)]));
  const pad = n => String(n).padStart(2, "0");
  function update() {
    const now = new Date();
    if (now >= weddingDate) { $("#clock").outerHTML = '<p class="today">Today is the day!</p>'; return clearInterval(timer); }
    let months = (weddingDate.getFullYear() - now.getFullYear()) * 12 + weddingDate.getMonth() - now.getMonth();
    let anchor = new Date(now); anchor.setMonth(now.getMonth() + months);
    if (anchor > weddingDate) { months--; anchor = new Date(now); anchor.setMonth(now.getMonth() + months); }
    const s = Math.floor((weddingDate - anchor) / 1000);
    const v = { months, days: Math.floor(s / 86400), hours: Math.floor(s % 86400 / 3600), minutes: Math.floor(s % 3600 / 60), seconds: s % 60 };
    ids.forEach(k => {
      const t = pad(v[k]);
      if (els[k].textContent !== t) { els[k].textContent = t; els[k].classList.remove("tick"); void els[k].offsetWidth; els[k].classList.add("tick"); }
    });
  }
  const timer = setInterval(update, 1000); update();
}

/* ---------- Save the Date (.ics download) ---------- */
function initCalendar() {
  $("#calBtn").addEventListener("click", () => {
    const c = weddingConfig, fmt = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(weddingDate.getTime() + 5 * 3600 * 1000);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${fmt(weddingDate)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:Wedding of ${titleCase(c.brideName)} & ${titleCase(c.groomName)}`, `LOCATION:${c.venue}\\, ${c.address}`,
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "wedding.ics"; a.click(); URL.revokeObjectURL(a.href);
  });
}

/* ---------- RSVP ---------- */
function initRsvp() {
  const form = $("#rsvpForm"), btn = $("#rsvpBtn"), status = $("#rsvpStatus");
  let sending = false;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (sending) return;                                            // block duplicate submissions
    status.textContent = "";
    $$(".invalid", form).forEach(f => f.classList.remove("invalid"));
    const bad = [...form.elements].filter(f => f.name && f.type !== "radio" && f.required && !f.checkValidity());
    bad.forEach(f => f.classList.add("invalid"));
    if (!form.attendance.value) bad.push(form.attendance[0]);
    if (bad.length) { status.textContent = "Please complete the highlighted fields."; bad[0].focus(); return; }
    if (!RSVP_ENDPOINT || RSVP_ENDPOINT.startsWith("YOUR_")) {
      status.textContent = "RSVP is not connected yet. Add your Google Apps Script URL in js/script.js (see README)."; return;
    }
    sending = true; btn.disabled = true; btn.textContent = "Sending…";
    try {
      // text/plain + no-cors avoids the CORS preflight that Apps Script cannot answer
      await fetch(RSVP_ENDPOINT, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      form.hidden = true; $("#thanks").hidden = false;
    } catch (err) {
      status.textContent = "We couldn’t send your RSVP. Check your connection and try again.";
      sending = false; btn.disabled = false; btn.textContent = "Send RSVP";
    }
  });
}

applyConfig(); initPhotos(); initImagePreview(); createParticles(); initMusic(); initDoor(); initReveal(); initCountdown(); initCalendar(); initRsvp();
