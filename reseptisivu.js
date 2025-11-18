const sList = document.getElementById("s-list");
const g1 = document.getElementById("g1");
const hSearch = document.getElementById("h-search");

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

async function loadC1() {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
  );
  const data = await res.json();

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
  g1.innerHTML = "<p>Loading all meals...</p>";
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const allMeals = [];

  for (const letter of letters) {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
    );
    const data = await res.json();
    if (data.meals) allMeals.push(...data.meals);
  }

  mealsData = allMeals;
  showMeals1(mealsData);
}

async function loadMealsC1(category) {
  g1.innerHTML = "<p>Loading meals...</p>";
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );
  const data = await res.json();

  const detailedMeals = await Promise.all(
    data.meals.map(async (m) => {
      const mealRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`
      );
      const mealData = await mealRes.json();
      return mealData.meals[0];
    })
  );

  mealsData = detailedMeals;
  showMeals1(mealsData);
}

hSearch.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = hSearch.value.trim();
    if (!query) return;

    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    const data = await res.json();

    if (data.meals) {
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
    stepDiv.innerHTML = `
      <span class="step-num">${i + 1}.</span>
      <span class="step-text">${step}</span>
    `;
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
      li.innerHTML = `
        <img class="ing-img" src="${imgUrl}" alt="${ing}">
        <span class="ing-text">${measure ? measure + " " : ""}${ing}</span>
      `;
      p1Ingredients.appendChild(li);
    }
  }

  p1.classList.add("p1-show");
  p1.classList.remove("hidden")
}

p1Close.addEventListener("click", () => p1.classList.remove("p1-show"));
p1Prev.addEventListener("click", () => {
  if (currentIndex > 0) openPopup(currentIndex - 1);
});
p1Next.addEventListener("click", () => {
  if (currentIndex < mealsData.length - 1) openPopup(currentIndex + 1);
});

loadC1();
