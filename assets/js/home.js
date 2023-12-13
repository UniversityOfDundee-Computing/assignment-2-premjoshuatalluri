document.addEventListener("DOMContentLoaded", function () {
  const dishContainer = document.getElementById("dishContainer");
  const dishSlider = document.getElementById("dishSlider");
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("prevButton");

  const dishNames = ["Sushi", "Wontons", "Lasagne", "Pancakes","Margherita", "Big Mac", "Biryani", "Pasta", "Fried Chicken", "Cake"];

  // Fetching data for specific dishes from TheMealDB 
  Promise.all(dishNames.map(dish => fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${dish}`)
    .then(response => response.json())))
    .then(dishResponses => {
      const meals = dishResponses.map(response => response.meals[0]); // Extracting the first meal for each dish
      displayDishes(meals);

      // Update dishes on next button click
      nextButton.addEventListener("click", () => {
        if (startIndex < meals.length - 5) {
          startIndex += 1;
          dishSlider.value = startIndex;
          displayDishes(meals);
        }
      });

      // Update dishes on prev button click
      prevButton.addEventListener("click", () => {
        if (startIndex > 0) {
          startIndex -= 1;
          dishSlider.value = startIndex;
          displayDishes(meals);
        }
      });
    })
    .catch(error => console.error("Error fetching data:", error));

  let startIndex = 0;

  // Function to display dishes based on startIndex
  function displayDishes(meals) {
    dishContainer.innerHTML = "";
    const endIndex = Math.min(startIndex + 5, meals.length);

    for (let i = startIndex; i < endIndex; i++) {
      const meal = meals[i];
      const dishCard = document.createElement("div");
      dishCard.className = "dish-card";
      dishCard.innerHTML = `
        <img src="${meal.strMealThumb}" class="card-img rounded-1" alt="${meal.strMeal}">
        <div class="body-card">
          <h5>${meal.strMeal}</h5>
          <p>${meal.strArea}</p>
          <a href="recipe.html?mealId=${meal.idMeal}" class="card-button">View</a>
        </div>
      `;
      dishContainer.appendChild(dishCard);
    }
  }
});
