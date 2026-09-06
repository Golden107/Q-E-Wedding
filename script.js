const SETTINGS = {
  weddingDate: "2026-11-22T18:00:00+08:00",
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxEhurUMK47JpOyC-LpvImuM_L0Ly2FcaIrVPFpntfAjFBDBj-ehyAgmVaFmlR60CJKeQ/exec"
};

const opening = document.getElementById("opening");
const openInvitation = document.getElementById("openInvitation");
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let musicPlaying = false;

openInvitation.addEventListener("click", () => {
  opening.classList.add("opened");
  window.scrollTo(0, 0);

  setTimeout(() => {
    opening.classList.add("hide");
    document.body.classList.remove("locked");
    window.scrollTo({top: 0, left: 0, behavior: "auto"});
    document.querySelector(".hero-center")?.classList.add("hero-enter");
  }, 1150);

  bgMusic.play()
    .then(() => {
      musicPlaying = true;
      musicBtn.classList.add("playing");
      musicBtn.textContent = "Ⅱ";
    })
    .catch(() => {
      musicPlaying = false;
      musicBtn.classList.remove("playing");
      musicBtn.textContent = "♪";
    });
});

let openingSafetyTimer = null;
openInvitation.addEventListener("click", () => {
  clearTimeout(openingSafetyTimer);
  openingSafetyTimer = setTimeout(() => {
    opening.classList.add("hide");
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
  }, 2800);
}, {once: true});

const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

musicBtn.addEventListener("click", async () => {
  try {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
      musicBtn.classList.remove("playing");
      musicBtn.textContent = "♪";
    } else {
      await bgMusic.play();
      musicPlaying = true;
      musicBtn.classList.add("playing");
      musicBtn.textContent = "Ⅱ";
    }
  } catch (e) {
    alert("目前找不到背景音樂檔。請確認 Hand in Hand.mp3 與 index.html 位於同一層，或檢查 audio 的 src。");
  }
});

const heroSlides = [...document.querySelectorAll(".slide")];
let heroIndex = 0;
setInterval(() => {
  heroSlides[heroIndex].classList.remove("active");
  heroIndex = (heroIndex + 1) % heroSlides.length;
  heroSlides[heroIndex].classList.add("active");
}, 5000);

const cinemaFrames = [...document.querySelectorAll(".cinema-frame")];
let cinemaIndex = 0;
setInterval(() => {
  cinemaFrames[cinemaIndex].classList.remove("active");
  cinemaIndex = (cinemaIndex + 1) % cinemaFrames.length;
  cinemaFrames[cinemaIndex].classList.add("active");
}, 5200);

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      io.unobserve(entry.target);
    }
  });
}, {threshold: .14});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const weddingDate = new Date(SETTINGS.weddingDate);

function tick() {
  const diff = weddingDate - new Date();
  const ids = ["days", "hours", "minutes", "seconds"];

  if (diff <= 0) {
    ids.forEach(id => document.getElementById(id).textContent = "00");
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  document.getElementById("days").textContent = String(days).padStart(3, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

const seatName = document.getElementById("seatName");
const seatResult = document.getElementById("seatResult");
const seatBtn = document.getElementById("seatBtn");

async function searchSeat() {
  const name = seatName.value.trim();

  if (!name) {
    seatResult.textContent = "請先輸入姓名。";
    seatName.focus();
    return;
  }

  seatBtn.disabled = true;
  seatBtn.textContent = "查詢中…";
  seatResult.textContent = "正在查詢您的桌次…";

  try {
    const url = SETTINGS.GAS_WEB_APP_URL + "?action=seat&name=" + encodeURIComponent(name) + "&_=" + Date.now();
    const response = await fetch(url, {cache: "no-store"});

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.found) {
      seatResult.innerHTML =
        `歡迎 <strong>${escapeHtml(String(data.name || ""))}</strong><br>` +
        `您的桌次：<strong>${escapeHtml(String(data.table || "未安排"))}</strong>` +
        `${data.seat ? `・${escapeHtml(String(data.seat))}` : ""}` +
        `${data.note ? `<br>${escapeHtml(String(data.note))}` : ""}`;
    } else {
      seatResult.textContent = "查無資料，請確認姓名是否正確。";
    }
  } catch (error) {
    console.error("Seat lookup failed:", error);
    seatResult.textContent = "目前無法查詢桌次，請稍後再試。";
  } finally {
    seatBtn.disabled = false;
    seatBtn.textContent = "查詢桌次";
  }
}

seatBtn.addEventListener("click", searchSeat);

seatName.addEventListener("keydown", e => {
  if (e.key === "Enter") searchSeat();
});

const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");

rsvpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const url = SETTINGS.GAS_WEB_APP_URL;

  if (!url || url.includes("PASTE_YOUR")) {
    rsvpStatus.textContent = "示範模式：表單已驗證完成。正式上線前，請填入 Google Apps Script Web App URL。";
    return;
  }

  rsvpStatus.textContent = "送出中…";

  const formData = new FormData(rsvpForm);
  formData.append("timestamp", new Date().toISOString());
  formData.append("type", "rsvp");

  const payload = new URLSearchParams();
  for (const [key, value] of formData.entries()) payload.append(key, value);

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"},
      body: payload.toString()
    });
    rsvpStatus.textContent = "已收到您的回覆，謝謝您 ♡";
    rsvpForm.reset();
  } catch (error) {
    rsvpStatus.textContent = "目前無法送出，請稍後再試。";
  }
});

const blessingForm = document.getElementById("blessingForm");
const blessingList = document.getElementById("blessingList");
const blessingStatus = document.getElementById("blessingStatus");
const blessingFormStatus = document.getElementById("blessingFormStatus");

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}

function renderBlessing(item, prepend = false) {
  const card = document.createElement("article");
  card.className = "note-card";
  card.style.setProperty("--r", `${(Math.random() * 2 - 1).toFixed(2)}deg`);
  card.innerHTML = `<h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.text)}</p>`;
  prepend ? blessingList.prepend(card) : blessingList.append(card);
}

async function loadBlessings() {
  blessingStatus.textContent = "正在更新祝福牆…";

  try {
    const url = SETTINGS.GAS_WEB_APP_URL + "?action=blessings&_=" + Date.now();
    const response = await fetch(url, {cache: "no-store"});

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    blessingList.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      blessingList.innerHTML = `<article class="note-card"><h4>第一則祝福</h4><p>還沒有留言，歡迎留下第一份祝福 ♡</p></article>`;
      blessingStatus.textContent = "";
      return;
    }

    [...data].reverse().forEach(item => renderBlessing(item));
    blessingStatus.textContent = `目前共有 ${data.length} 則祝福 ♡`;

  } catch (error) {
    console.error("Blessing load failed:", error);
    blessingList.innerHTML = `<article class="note-card"><h4>讀取失敗</h4><p>目前無法讀取祝福牆，請稍後再試。</p></article>`;
    blessingStatus.textContent = "";
  }
}

blessingForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("blessingName").value.trim();
  const textValue = document.getElementById("blessingText").value.trim();

  if (!name || !textValue) return;

  const submitBtn = blessingForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "送出中…";
  blessingFormStatus.textContent = "";

  const payload = new URLSearchParams();
  payload.append("type", "blessing");
  payload.append("name", name);
  payload.append("text", textValue);
  payload.append("timestamp", new Date().toISOString());

  try {
    await fetch(SETTINGS.GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: payload.toString()
    });

    blessingForm.reset();
    blessingFormStatus.textContent = "祝福已送出，謝謝您 ♡";

    await new Promise(resolve => setTimeout(resolve, 900));
    await loadBlessings();

  } catch (error) {
    console.error("Blessing submit failed:", error);
    blessingFormStatus.textContent = "目前無法送出祝福，請稍後再試。";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "留下祝福";
  }
});

loadBlessings();

const parallaxLeaves = [...document.querySelectorAll(".parallax-leaf")];
let pointerX = 0, pointerY = 0;

if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    pointerX = (e.clientX / window.innerWidth - .5) * 12;
    pointerY = (e.clientY / window.innerHeight - .5) * 9;
  }, {passive: true});
}

function updateBotanicalParallax() {
  const y = window.scrollY;
  parallaxLeaves.forEach((el, i) => {
    const depth = Number(el.dataset.depth || .1);
    const scrollShift = (y * depth) % 42;
    const dir = i % 2 === 0 ? 1 : -1;
    el.style.setProperty("--px", `${(pointerX * depth * dir).toFixed(2)}px`);
    el.style.setProperty("--py", `${(scrollShift + pointerY * depth).toFixed(2)}px`);
  });
}

updateBotanicalParallax();
window.addEventListener("scroll", updateBotanicalParallax, {passive: true});
window.addEventListener("pointermove", updateBotanicalParallax, {passive: true});