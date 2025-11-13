async function randomizeEtusivu() {
    const randomRecipe = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
    const data = await randomRecipe.json()
    const meal = data.meals[0]
    
    document.getElementById("tempImg").innerHTML = `<img src="${meal.strMealThumb}" alt="randomFoodImg">`;
}

randomizeEtusivu()