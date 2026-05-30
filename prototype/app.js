const titles = {
  today: "今天",
  records: "记录",
  meals: "饮食",
  family: "家庭"
};

const panels = Array.from(document.querySelectorAll(".tab-panel"));
const tabButtons = Array.from(document.querySelectorAll(".bottom-tabs button"));
const title = document.querySelector("#pageTitle");

function showPage(page) {
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.page === page);
  });

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === page);
  });

  title.textContent = titles[page] || "今天";
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.target));
});

document.querySelectorAll(".member-pill").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".member-pill").forEach((item) => {
      item.classList.remove("active");
    });
    button.classList.add("active");
  });
});

const initialPage = new URLSearchParams(window.location.search).get("page");
if (titles[initialPage]) {
  showPage(initialPage);
}
