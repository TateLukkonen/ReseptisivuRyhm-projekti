const sList = document.getElementById("s-list");
const g1 = document.getElementById("g1");
const hSearch = document.getElementById("h-search");
const fSearch = document.getElementById("f-search");
const filterPopup = document.getElementById("filterBarPopupMobile");
const filterBar = document.getElementById("filter-bar");

const p1 = document.getElementById("p1");
const p1Img = document.getElementById("p1-img");
const p1Name = document.getElementById("p1-name");
const p1Instructions = document.getElementById("p1-instructions");
const p1Ingredients = document.getElementById("p1-ingredients");
const p1Close = document.getElementById("p1-close");
const p1Prev = document.getElementById("p1-prev");
const p1Next = document.getElementById("p1-next");

let mealsData = [];
let currentIndex = 0;
let searchTimeout = null;
let activeFetchController = null;

function safeFetch(url) {
  if (activeFetchController) activeFetchController.abort();
  activeFetchController = new AbortController();
  const signal = activeFetchController.signal;
  return fetch(url, { signal })
    .then((r) => r.json())
    .catch((e) => {
      if (e.name === "AbortError") return null;
      throw e;
    });
}

const flagCodes = {
  American: "us",
  British: "gb",
  Canadian: "ca",
  Chinese: "cn",
  Croatian: "hr",
  Dutch: "nl",
  Egyptian: "eg",
  French: "fr",
  Greek: "gr",
  Indian: "in",
  Irish: "ie",
  Italian: "it",
  Jamaican: "jm",
  Japanese: "jp",
  Kenyan: "ke",
  Malaysian: "my",
  Mexican: "mx",
  Moroccan: "ma",
  Polish: "pl",
  Portuguese: "pt",
  Russian: "ru",
  Spanish: "es",
  Thai: "th",
  Tunisian: "tn",
  Turkish: "tr",
  Vietnamese: "vn",
  Norwegian: "no",
  Filipino: "ph",
  Ukrainian: "ua",
};

const flagAliases = {};
Object.keys(flagCodes).forEach((area) => {
  const lower = area.toLowerCase();
  flagAliases[lower] = area;
  flagAliases[lower.replace(" ", "")] = area;
  flagAliases[lower + "n"] = area;
  flagAliases[lower.replace("an", "")] = area;
  if (area.endsWith("n")) flagAliases[lower.slice(0, -1)] = area;
});

function hideOnWidth() {
  if (window.innerWidth > 375) {
    filterBar.classList.remove("hidden");
  } else {
    filterBar.classList.add("hidden");
  }
}
hideOnWidth();
window.addEventListener("resize", hideOnWidth);

filterPopup.addEventListener("click", () => {
  filterBar.classList.toggle("hidden");
});

if (fSearch) {
  fSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = fSearch.value.trim();
      if (query) {
        window.location.href = `reseptisivu.html?search=${encodeURIComponent(
          query
        )}`;
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("search");

  await loadC1();

  if (query) {
    if (hSearch) hSearch.value = query;
    const flagArea = flagAliases[query.toLowerCase()];
    if (flagArea) {
      await loadByFlag(flagArea);
      return;
    }
    const data = await safeFetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        query
      )}`
    );
    if (data?.meals) {
      mealsData = data.meals;
      showMeals1(mealsData);
    } else {
      g1.innerHTML = "<p>No meals found.</p>";
    }
  }
});

async function loadC1() {
  const data = await safeFetch(
    "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
  );
  sList.innerHTML = "";

  const allLi = document.createElement("li");
  allLi.textContent = "All";
  allLi.classList.add("active");
  allLi.addEventListener("click", async () => {
    document
      .querySelectorAll("#s-list li")
      .forEach((li) => li.classList.remove("active"));
    allLi.classList.add("active");
    await loadAllMeals();
  });
  sList.appendChild(allLi);

  data.meals.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = c.strCategory;
    li.addEventListener("click", async () => {
      document
        .querySelectorAll("#s-list li")
        .forEach((li) => li.classList.remove("active"));
      li.classList.add("active");
      await loadMealsC1(c.strCategory);
    });
    sList.appendChild(li);
  });

  await loadAllMeals();
}

async function loadAllMeals() {
  g1.innerHTML = "<p>Loading meals...</p>";
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const allMeals = [];

  for (const letter of letters) {
    const data = await safeFetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
    );
    if (!data) return;
    if (data.meals) allMeals.push(...data.meals);
  }

  mealsData = allMeals;
  showMeals1(mealsData);
}

async function loadMealsC1(category) {
  g1.innerHTML = "<p>Loading meals...</p>";

  const data = await safeFetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );
  if (!data || !data.meals) return;

  const detailedMeals = [];

  for (const m of data.meals) {
    const mealData = await safeFetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`
    );
    if (!mealData) return;
    detailedMeals.push(mealData.meals[0]);
  }

  mealsData = detailedMeals;
  showMeals1(mealsData);
}

async function loadByFlag(area) {
  g1.innerHTML = "<p>Loading meals...</p>";
  const data = await safeFetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
      area
    )}`
  );
  if (!data || !data.meals) {
    g1.innerHTML = "<p>No meals found.</p>";
    return;
  }

  const detailedMeals = [];

  for (const m of data.meals) {
    const mealData = await safeFetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`
    );
    if (!mealData) return;
    detailedMeals.push(mealData.meals[0]);
  }

  mealsData = detailedMeals;
  showMeals1(mealsData);
}

hSearch.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = hSearch.value.trim();
    if (!query) {
      document.querySelector("#s-list li:first-child").click();
      return;
    }

    const lower = query.toLowerCase();
    const flagArea = flagAliases[lower];

    if (flagArea) {
      await loadByFlag(flagArea);
      return;
    }

    const data = await safeFetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    if (data?.meals) {
      mealsData = data.meals;
      showMeals1(mealsData);
    } else {
      g1.innerHTML = "<p>No meals found.</p>";
    }
  }, 500);
});

function showMeals1(meals) {
  g1.innerHTML = "";
  meals.forEach((m, index) => {
    const flagCode = flagCodes[m.strArea] ? flagCodes[m.strArea] : "un";
    const flagURL = `https://flagcdn.com/w40/${flagCode}.png`;
    const c = document.createElement("div");
    c.className = "c1";
    c.innerHTML = `
      <h4 class="c-title">${m.strMeal}</h4>
      <img class="c-img" src="${m.strMealThumb}" alt="${m.strMeal}">
      <p class="c-info">
        <img src="${flagURL}" alt="${m.strArea}" title="${m.strArea}">
        ${m.strArea}
      </p>
    `;
    c.addEventListener("click", () => openPopup(index));
    g1.appendChild(c);
  });
}

function openPopup(index) {
  const m = mealsData[index];
  currentIndex = index;

  p1Img.src = m.strMealThumb;
  p1Name.textContent = m.strMeal;

  p1Instructions.innerHTML = "";
  const steps = m.strInstructions
    ? m.strInstructions.split(/\r?\n/).filter((line) => line.trim() !== "")
    : ["No instructions available."];

  steps.forEach((step, i) => {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step-item";
    stepDiv.innerHTML = `<span class="step-num">${
      i + 1
    }.</span><span class="step-text">${step}</span>`;
    p1Instructions.appendChild(stepDiv);
  });

  p1Ingredients.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const ing = m[`strIngredient${i}`];
    const measure = m[`strMeasure${i}`];
    if (ing && ing.trim() !== "") {
      const li = document.createElement("li");
      const imgUrl = `https://www.themealdb.com/images/ingredients/${encodeURIComponent(
        ing
      )}.png`;
      li.innerHTML = `<img class="ing-img" src="${imgUrl}" alt="${ing}"><span class="ing-text">${
        measure ? measure + " " : ""
      }${ing}</span>`;
      p1Ingredients.appendChild(li);
    }
  }

  p1.classList.add("p1-show");
  p1.classList.remove("hidden");
}

p1Close.addEventListener("click", () => p1.classList.add("hidden"));
p1Prev.addEventListener("click", () => {
  if (currentIndex > 0) openPopup(currentIndex - 1);
});
p1Next.addEventListener("click", () => {
  if (currentIndex < mealsData.length - 1) openPopup(currentIndex + 1);
});
