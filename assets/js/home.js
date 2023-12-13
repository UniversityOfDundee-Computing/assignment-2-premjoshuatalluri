document.addEventListener("DOMContentLoaded", function () {
  const dishContainer = document.getElementById("dishContainer");
  const dishSlider = document.getElementById("dishSlider");
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("prevButton");

  let startIndex = 0;

  // Fetching data from TheMealDB 
  fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
    .then(response => response.json())
    .then(data => {
      const meals = data.meals.slice(0, 10); // Fetching up to 10 dishes initially
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
