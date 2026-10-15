const SETTINGS = {
  weddingDate: "2026-11-22T18:00:00+08:00",
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxEhurUMK47JpOyC-LpvImuM_L0Ly2FcaIrVPFpntfAjFBDBj-ehyAgmVaFmlR60CJKeQ/exec"
};

const opening = document.getElementById("opening");
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let musicPlaying = false;

window.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    opening?.classList.add("opened");
  }, 400);

  setTimeout(() => {
    opening?.classList.add("hide");
    document.body.classList.remove("locked");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector(".hero-center")?.classList.add("hero-enter");
  }, 1900);

  bgMusic?.play().then(() => {
    musicPlaying = true;
    musicBtn?.classList.add("playing");
    if (musicBtn) musicBtn.textContent = "Ⅱ";
  }).catch(() => {
    musicPlaying = false;
  });
});

const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  nav?.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

menuBtn?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
});

navLinks?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

musicBtn?.addEventListener("click", async () => {
  if (!bgMusic) return;
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
  } catch (error) {
    console.error("Music error:", error);
    alert("目前無法播放背景音樂，請確認 Hand in Hand.mp3 與 index.html 位於同一層。");
  }
});

const heroSlides = [...document.querySelectorAll(".slide")];
let heroIndex = 0;
if (heroSlides.length > 1) {
  setInterval(() => {
    heroSlides[heroIndex].classList.remove("active");
    heroIndex = (heroIndex + 1) % heroSlides.length;
    heroSlides[heroIndex].classList.add("active");
  }, 5000);
}

const portraitTrack = document.getElementById("portraitTrack");
const portraitGroup = document.getElementById("portraitGroup");
if (portraitTrack && portraitGroup) {
  const clonedGroup = portraitGroup.cloneNode(true);
  clonedGroup.removeAttribute("id");
  clonedGroup.setAttribute("aria-hidden", "true");
  clonedGroup.querySelectorAll("img").forEach(image => {
    image.alt = "";
    image.loading = "lazy";
  });
  portraitTrack.appendChild(clonedGroup);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      portraitTrack.classList.add("is-ready");
    });
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .14 });

document.querySelectorAll(".reveal").forEach(element => {
  revealObserver.observe(element);
});

const weddingDate = new Date(SETTINGS.weddingDate);
function updateCountdown() {
  const now = new Date();
  const difference = weddingDate - now;
  if (difference <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = "00";
    });
    return;
  }
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor(difference / 3600000) % 24;
  const minutes = Math.floor(difference / 60000) % 60;
  const seconds = Math.floor(difference / 1000) % 60;

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  if (daysElement) daysElement.textContent = String(days).padStart(3, "0");
  if (hoursElement) hoursElement.textContent = String(hours).padStart(2, "0");
  if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, "0");
  if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

const seatName = document.getElementById("seatName");
const seatBtn = document.getElementById("seatBtn");
const seatResult = document.getElementById("seatResult");

async function searchSeat() {
  if (!seatName || !seatResult || !seatBtn) return;
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
    const url = `${SETTINGS.GAS_WEB_APP_URL}?action=seat&name=${encodeURIComponent(name)}&_=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.found) {
      seatResult.innerHTML = `歡迎 <strong>${escapeHtml(data.name)}</strong><br>您的桌次：<strong>${escapeHtml(data.table || "未安排")}</strong>${data.seat ? `・${escapeHtml(data.seat)}` : ""}${data.note ? `<br>${escapeHtml(data.note)}` : ""}`;
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

seatBtn?.addEventListener("click", searchSeat);
seatName?.addEventListener("keydown", event => {
  if (event.key === "Enter") searchSeat();
});

const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");

rsvpForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const url = SETTINGS.GAS_WEB_APP_URL;
  if (!url) return;
  if (rsvpStatus) rsvpStatus.textContent = "送出中…";

  const formData = new FormData(rsvpForm);
  formData.append("timestamp", new Date().toISOString());
  formData.append("type", "rsvp");

  const payload = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    payload.append(key, value);
  }

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString()
    });
    if (rsvpStatus) rsvpStatus.textContent = "已收到您的回覆，謝謝您 ♡";
    rsvpForm.reset();
  } catch (error) {
    console.error("RSVP submit error:", error);
    if (rsvpStatus) rsvpStatus.textContent = "目前無法送出，請稍後再試。";
  }
});

const blessingForm = document.getElementById("blessingForm");
const blessingList = document.getElementById("blessingList");
const blessingStatus = document.getElementById("blessingStatus");
const blessingFormStatus = document.getElementById("blessingFormStatus");

function renderBlessing(item) {
  if (!blessingList) return;
  const card = document.createElement("article");
  card.className = "note-card";
  card.style.setProperty("--r", `${(Math.random() * 2 - 1).toFixed(2)}deg`);
  card.innerHTML = `<h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.text)}</p>`;
  blessingList.appendChild(card);
}

async function loadBlessings() {
  if (!blessingList) return;
  if (blessingStatus) blessingStatus.textContent = "正在更新祝福牆…";
  try {
    const url = `${SETTINGS.GAS_WEB_APP_URL}?action=blessings&_=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    blessingList.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      blessingList.innerHTML = `<article class="note-card"><h4>第一則祝福</h4><p>還沒有留言，歡迎留下第一份祝福 ♡</p></article>`;
      if (blessingStatus) blessingStatus.textContent = "";
      return;
    }
    [...data].reverse().forEach(item => {
      renderBlessing(item);
    });
    if (blessingStatus) blessingStatus.textContent = `目前共有 ${data.length} 則祝福 ♡`;
  } catch (error) {
    console.error("Blessings error:", error);
    blessingList.innerHTML = `<article class="note-card"><h4>讀取失敗</h4><p>目前無法讀取祝福牆，請稍後再試。</p></article>`;
    if (blessingStatus) blessingStatus.textContent = "";
  }
}

blessingForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const name = document.getElementById("blessingName")?.value.trim();
  const message = document.getElementById("blessingText")?.value.trim();
  if (!name || !message) return;

  const button = blessingForm.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = "送出中…";
  }
  if (blessingFormStatus) blessingFormStatus.textContent = "";

  const payload = new URLSearchParams();
  payload.append("type", "blessing");
  payload.append("name", name);
  payload.append("text", message);
  payload.append("timestamp", new Date().toISOString());

  try {
    await fetch(SETTINGS.GAS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString()
    });
    blessingForm.reset();
    if (blessingFormStatus) blessingFormStatus.textContent = "祝福已送出，謝謝您 ♡";
    await new Promise(resolve => setTimeout(resolve, 900));
    await loadBlessings();
  } catch (error) {
    console.error("Blessing submit error:", error);
    if (blessingFormStatus) blessingFormStatus.textContent = "目前無法送出祝福，請稍後再試。";
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "留下祝福";
    }
  }
});

loadBlessings();

const parallaxLeaves = [...document.querySelectorAll(".parallax-leaf")];
let pointerX = 0;
let pointerY = 0;

if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", event => {
    pointerX = (event.clientX / window.innerWidth - .5) * 12;
    pointerY = (event.clientY / window.innerHeight - .5) * 9;
  }, { passive: true });
}

function updateBotanicalParallax() {
  const y = window.scrollY;
  parallaxLeaves.forEach((element, index) => {
    const depth = Number(element.dataset.depth || .1);
    const scrollShift = (y * depth) % 42;
    const direction = index % 2 === 0 ? 1 : -1;
    element.style.setProperty("--px", `${(pointerX * depth * direction).toFixed(2)}px`);
    element.style.setProperty("--py", `${(scrollShift + pointerY * depth).toFixed(2)}px`);
  });
}

updateBotanicalParallax();
window.addEventListener("scroll", updateBotanicalParallax, { passive: true });
window.addEventListener("pointermove", updateBotanicalParallax, { passive: true });