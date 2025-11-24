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

hSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = hSearch.value.trim();
    if (query) {
      window.location.href = `reseptisivu.html?search=${encodeURIComponent(
        query
      )}`;
    }
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

window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("search");

  if (query) {
    if (sSearch) sSearch.value = query;
    await performSearch(query);
  }
});