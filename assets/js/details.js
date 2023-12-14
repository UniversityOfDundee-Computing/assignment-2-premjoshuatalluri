// Function to fetch data from MealDB API based on the search query
async function searchDish(query = '') {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await response.json();
    return data.meals; // Array of meals matching the query
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to update the result-section with the fetched data
function updateResults(meals) {
  const resultSection = document.querySelector('.result-section');

  // Clear previous results
  resultSection.innerHTML = '';

  if (meals) {
    meals.forEach(meal => {
      const resultTab = document.createElement('div');
      resultTab.classList.add('result-tab');

      resultTab.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2 class="dish-name">${meal.strMeal}</h2>
        <p class="dish-area">${meal.strArea}</p>
        <button class="dish-button">View</button>
      `;

      resultSection.appendChild(resultTab);
    });
  } else {
    // Display a message if no results are found
    resultSection.innerHTML = '<p>No results found</p>';
  }
}

// Load default dishes on page load
document.addEventListener('DOMContentLoaded', async function () {
  const defaultMeals = await searchDish(); // Empty query fetches default meals
  updateResults(defaultMeals);
});

// Event listener for the search input
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('input', async function () {
  const query = searchInput.value.trim();

  if (query.length >= 0) {
    // If there is any input (including empty), perform a search
    const meals = await searchDish(query);
    updateResults(meals.length > 0 ? meals : await searchDish()); // Show default dishes if no search results
  } else {
    // If the user didn't type anything, show default dishes
    const defaultMeals = await searchDish();
    updateResults(defaultMeals);
  }
});

// Event listener for the "Enter" key
searchInput.addEventListener('keydown', async function (event) {
  if (event.key === 'Enter') {
    const query = searchInput.value.trim();

    if (query.length >= 0) {
      // If there is any input (including empty), perform a search
      const meals = await searchDish(query);
      updateResults(meals.length > 0 ? meals : await searchDish()); // Show default dishes if no search results
    } else {
      // If the user didn't type anything, show default dishes
      const defaultMeals = await searchDish();
      updateResults(defaultMeals);
    }
  }
});
