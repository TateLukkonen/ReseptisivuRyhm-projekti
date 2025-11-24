const hSearch = document.getElementById("h-search");
const sSearch = document.getElementById("s-search");
const g1 = document.getElementById("g1");
const tempImg = document.getElementById("tempImg");
const tempDisc = document.getElementById("tempDisc");
const mainArea = document.getElementById("mainArea");
const filterBar = document.getElementById("filterBar");
const sList = document.getElementById("s-list");
const pageTitle = document.getElementById("pageTitle");

let mealsData = [];
let categoriesLoaded = false;

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

async function randomizeEtusivu() {
  const randomRecipe = await fetch(
    `https://www.themealdb.com/api/json/v1/1/random.php`
  );
  const data = await randomRecipe.json();
  const meal = data.meals[0];

  tempImg.innerHTML = `<img src="${meal.strMealThumb}" alt="randomFoodImg">`;
  tempDisc.innerHTML = `<p>${meal.strInstructions}</p>`;
}

randomizeEtusivu();

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
}

async function loadAllMeals() {
  g1.innerHTML = "<p>Loading meals...</p>";
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

async function performSearch(query) {
  if (!query) {
    mainArea.style.display = "none";
    filterBar.classList.remove("show");
    pageTitle.style.display = "";
    tempImg.style.display = "";
    tempDisc.style.display = "";
    return;
  }

  mainArea.style.display = "flex";
  filterBar.classList.add("show");
  pageTitle.style.display = "none";
  tempImg.style.display = "none";
  tempDisc.style.display = "none";
  g1.innerHTML = "<p>Loading meals...</p>";

  if (!categoriesLoaded) {
    await loadC1();
    categoriesLoaded = true;
  }

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
}

hSearch.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const query = hSearch.value.trim();
    await performSearch(query);
  }
});

sSearch.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const query = sSearch.value.trim();
    if (!query) {
      document.querySelector("#s-list li:first-child").click();
      return;
    }
    await performSearch(query);
  }
});

function showMeals1(meals) {
  g1.innerHTML = "";
  meals.forEach((m) => {
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
    g1.appendChild(c);
  });
}
