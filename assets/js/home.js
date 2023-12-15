document.addEventListener("DOMContentLoaded", function () {
  // Getting references to HTML elements
  const dishContainer = document.getElementById("dishContainer");
  const dishSlider = document.getElementById("dishSlider");
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("prevButton");
  const searchField = document.getElementById("searchInput");

  // Array of dish names
  const dishNames = ["Sushi", "Wontons", "Lasagne", "Pancakes", "Margherita", "Big Mac", "Biryani", "Pasta", "Fried Chicken", "Cake"];

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

  // Variable to keep track of the starting index for displayed dishes
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

  // Event listener for the "Enter" key in the search input
  searchField.addEventListener("keydown", function (event) {
    if (event.key === 'Enter') {
      const query = searchField.value.trim();
      if (query.length > 0) {
        // Redirect to detail.html with the entered dish name as a query parameter
        window.location.href = `detail.html?dishName=${encodeURIComponent(query)}`;
      }
    }
  });

  // Event listener for category links
  const categoryLinks = document.querySelectorAll('.categories-card a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const categoryName = link.id;

      // Perform the search based on the category name
      searchDishByCategory(categoryName)
        .then(meals => displayDishes(meals))
        .catch(error => console.error('Error fetching data:', error));
    });
  });

  // Function to fetch data from MealDB API based on the category
  async function searchDishByCategory(category = '') {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      const data = await response.json();
      
      // Fetch area details for each meal in the category
      const mealsWithArea = await Promise.all(data.meals.map(async meal => {
        const areaResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const areaData = await areaResponse.json();
        return { ...meal, strArea: areaData.meals[0].strArea };
      }));

      return mealsWithArea;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
});
