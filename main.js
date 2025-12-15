const images = [
  { src: "assets/BetweenSteps_thumb.png", alt: "Between Steps", size: "xl", tags: ["editorial"] },
  { src: "assets/WhereObjectsFind_thumb.png", alt: "좁은 집: Where Objectsf Find Their Place", size: "m", tags: ["graphic"] },
  { src: "assets/YouthFantasy_thumb.png", alt: "푸른공상(Youth Fantasy) MV", size: "l", tags: ["video"] },
  { src: "assets/TypoJanchi_thumb.png", alt: "2023 타이포잔치 포스터", size: "l", tags: ["editorial"] },
  { src: "assets/MeAndOthers_thumb.png", alt: "Me&Others", size: "l", tags: ["graphic"] },
  { src: "assets/EwhaStudentCard_thumb.png", alt: "이화 학생증 신청서", size: "m", tags: ["editorial"] },
  { src: "assets/Karma_thumb.png", alt: "영화 카르마", size: "xl", tags: ["graphic", "editorial", "video"] },
  { src: "assets/EwhaInvitation_thumb.png", alt: "2025 이화여대 졸업전시 모바일 초대장", size: "l", tags: ["web"] },
];

const SCALE_MAP = {
  s: 0.60,
  m: 0.80,
  l: 1.00,
  xl: 1.00,
};

const COLSPAN_MAP = {
  s: 1,
  m: 1,
  l: 1,
  xl: 2,
};

function getScale(size) {
  return SCALE_MAP[size] ?? 1;
}

function getColspan(size) {
  return COLSPAN_MAP[size] ?? 1;
}

const grid = document.querySelector(".right-grid");
const filterRoot = document.getElementById("filter");
const filterBtn = document.getElementById("filterBtn");
const filterMenu = document.getElementById("filterMenu");

let currentTag = "all";

function filteredImages() {
  if (currentTag === "all") return images;

  return images.filter((it) => {
    const tags = Array.isArray(it.tags) ? it.tags : [];
    return tags.includes(currentTag);
  });
}

function render() {
  if (!grid) return;

  const list = filteredImages();

  grid.innerHTML = list
    .map((it) => {
      const size = it.size ?? "m";
      const scale = getScale(size);
      const colspan = getColspan(size);

      return `
      <div class="masonry-item"
        data-tags="${(it.tags ?? []).join(",")}"
        data-size="${size}"
        style="--scale:${scale}; --colspan:${colspan};">
      <img src="${it.src}" alt="${it.alt ?? ""}" loading="lazy" decoding="async" />
      </div>
      `;
    })
    .join("");
}

function masonryLayout() {
  if (!grid) return;

  const style = getComputedStyle(grid);
  const rowHeight = parseInt(style.getPropertyValue("grid-auto-rows"), 10);
  const rowGap = parseInt(style.getPropertyValue("row-gap"), 10);

  grid.querySelectorAll(".masonry-item").forEach((item) => {
    const img = item.querySelector("img");
    if (!img || !img.naturalWidth) return; // 로드 실패면 스킵

    // 그리드 셀 실제 폭( col-span 반영 )
    const cellW = item.getBoundingClientRect().width;
    const ratio = img.naturalWidth / img.naturalHeight;
    const baseH = cellW / ratio;

    const span = Math.ceil((baseH + rowGap) / (rowHeight + rowGap) - 0.01);
    item.style.gridRowEnd = `span ${Math.max(1, span)}`;
  });
}

function bindImageLoadOnce() {
  if (!grid) return;

  const imgs = grid.querySelectorAll("img");
  imgs.forEach((img) => {
    if (img.complete && img.naturalWidth) return;
    img.addEventListener("load", masonryLayout, { once: true });
  });
}

function updateGrid() {
  render();
  bindImageLoadOnce();

  requestAnimationFrame(masonryLayout);
  setTimeout(masonryLayout, 120);
}

function setActiveMenu(tag) {
  if (!filterBtn || !filterMenu) return;

  currentTag = tag;
  filterBtn.textContent = tag.toUpperCase();

  filterMenu.querySelectorAll(".filter-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tag === tag);
  });

  updateGrid();
}

function openMenu() {
  if (!filterRoot || !filterBtn) return;
  filterRoot.classList.add("is-open");
  filterBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!filterRoot || !filterBtn) return;
  filterRoot.classList.remove("is-open");
  filterBtn.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  if (!filterRoot) return;
  const isOpen = filterRoot.classList.contains("is-open");
  if (isOpen) closeMenu();
  else openMenu();
}

function bindFilterUI() {
  if (!filterBtn || !filterMenu || !filterRoot) return;

  filterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  filterMenu.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-item");
    if (!btn) return;
    setActiveMenu(btn.dataset.tag || "all");
    closeMenu();
  });

  // 바깥 클릭하면 닫기
  document.addEventListener("click", (e) => {
    if (!filterRoot.classList.contains("is-open")) return;
    if (filterRoot.contains(e.target)) return;
    closeMenu();
  });

  // ESC로 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenu();
  });
}

let raf = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(masonryLayout);
});

bindFilterUI();
setActiveMenu("all"); // 초기 렌더
window.addEventListener("load", () => {
  masonryLayout();
  setTimeout(masonryLayout, 200);
});
