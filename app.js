const motions = [
  {
    name: "界面微交互动效",
    role: "UI Micro Interaction",
    src: "./assets/1.mp4",
  },
  {
    name: "运动模式选择",
    role: "Sport Mode Selection",
    src: "./assets/2.mp4",
  },
  {
    name: "开屏动画",
    role: "Splash Screen Animation",
    src: "./assets/3.mp4",
  },
  {
    name: "AI 产品官网首屏设计",
    role: "AI Product Homepage Hero",
    src: "./assets/4.mp4",
  },
  {
    name: "世界杯动效展示",
    role: "World Cup Motion",
    src: "./assets/5.mp4",
  },
];

const section = document.querySelector("#motionSection");
const stage = document.querySelector("#carouselStage");
const dots = document.querySelector("#dots");
const prevButton = document.querySelector(".nav-prev");
const nextButton = document.querySelector(".nav-next");

const PREVIEW_TIME = 0.6;

let activeIndex = 0;
let hoveredIndex = null;

function signedOffset(index) {
  const count = motions.length;
  let offset = index - activeIndex;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

function playVideo(card) {
  const video = card.querySelector("video");
  if (!video) return;
  video.play().catch(() => {});
}

function pauseVideo(card, reset = true) {
  const video = card.querySelector("video");
  if (!video) return;
  video.pause();
  if (reset) {
    const previewTime = Math.min(PREVIEW_TIME, Math.max(0, video.duration || PREVIEW_TIME));
    try {
      video.currentTime = previewTime;
    } catch {}
  }
}

function setPlayingCard(index) {
  hoveredIndex = index;
  document.querySelectorAll(".motion-card").forEach((card, cardIndex) => {
    const isPlaying = cardIndex === hoveredIndex;
    card.classList.toggle("is-hovered", isPlaying);
    if (isPlaying) playVideo(card);
    else pauseVideo(card);
  });
}

function clearPlayingCard() {
  hoveredIndex = null;
  document.querySelectorAll(".motion-card").forEach((card) => {
    card.classList.remove("is-hovered");
    pauseVideo(card);
  });
}

function setActive(index) {
  activeIndex = (index + motions.length) % motions.length;

  document.querySelectorAll(".motion-card").forEach((card, cardIndex) => {
    const offset = signedOffset(cardIndex);
    card.classList.toggle("is-active", offset === 0);
    card.classList.toggle("is-left", offset === -1);
    card.classList.toggle("is-right", offset === 1);
    card.classList.toggle("is-hidden", Math.abs(offset) > 1);
  });

  document.querySelectorAll(".dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeIndex);
  });
}

function createCard(motion, index) {
  const card = document.createElement("article");
  card.className = "motion-card";
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${motion.name} 视频展示`);
  card.innerHTML = `
    <div class="video-frame">
      <video src="${motion.src}" muted loop playsinline preload="metadata"></video>
    </div>
    <footer class="card-info">
      <span class="card-title">
        <strong>${motion.name}</strong>
        <span>${motion.role}</span>
      </span>
      <span class="play-state"><span class="play-dot" aria-hidden="true"></span>Hover 播放</span>
    </footer>
  `;

  const video = card.querySelector("video");
  video.addEventListener("loadedmetadata", () => {
    const ratio = video.videoWidth / video.videoHeight;
    card.dataset.ratio = ratio.toFixed(3);
    card.classList.toggle("is-portrait-video", ratio < 1);
    card.classList.toggle("is-wide-video", ratio >= 1.7);
    const previewTime = Math.min(PREVIEW_TIME, Math.max(0, video.duration || PREVIEW_TIME));
    try {
      video.currentTime = previewTime;
    } catch {}
  });

  card.addEventListener("mouseenter", () => setPlayingCard(index));
  card.addEventListener("mouseleave", clearPlayingCard);
  card.addEventListener("focus", () => setPlayingCard(index));
  card.addEventListener("blur", clearPlayingCard);

  card.addEventListener("click", () => {
    setActive(index);
    setPlayingCard(index);
  });

  return card;
}

function createDot(index) {
  const dot = document.createElement("button");
  dot.className = "dot";
  dot.type = "button";
  dot.setAttribute("aria-label", `查看第 ${index + 1} 张卡片`);
  dot.addEventListener("click", () => {
    setActive(index);
    clearPlayingCard();
  });
  return dot;
}

motions.forEach((motion, index) => {
  stage.appendChild(createCard(motion, index));
  dots.appendChild(createDot(index));
});

prevButton.addEventListener("click", () => {
  setActive(activeIndex - 1);
  clearPlayingCard();
});

nextButton.addEventListener("click", () => {
  setActive(activeIndex + 1);
  clearPlayingCard();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setActive(activeIndex - 1);
    clearPlayingCard();
  }
  if (event.key === "ArrowRight") {
    setActive(activeIndex + 1);
    clearPlayingCard();
  }
});

const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      section.classList.add("is-ready");
      observer.disconnect();
    }
  },
  { threshold: 0.28 }
);

observer.observe(section);
setActive(0);







