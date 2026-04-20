// Search and filter functionality

const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const subjectFilter = document.getElementById("subjectFilter");
const pyqGrid = document.getElementById("pyqGrid");
const items = pyqGrid.querySelectorAll(".item");

function filterItems() {
  const query = searchInput.value.toLowerCase();
  const year = yearFilter.value;
  const subject = subjectFilter.value;

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    const matchQuery = text.includes(query);
    const matchYear = !year || item.dataset.year === year;
    const matchSubject = !subject || item.dataset.subject === subject;

    item.style.display = (matchQuery && matchYear && matchSubject) ? "block" : "none";
  });
}

searchInput.addEventListener("input", filterItems);
yearFilter.addEventListener("change", filterItems);
subjectFilter.addEventListener("change", filterItems);
