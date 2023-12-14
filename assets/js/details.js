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

function updateResults(meals) {
  const resultSection = document.querySelector('.result-section');

  // Clear previous results
  resultSection.innerHTML = '';

  if (meals) {
    meals.forEach(meal => {
      const resultTab = document.createElement('div');
      resultTab.classList.add('result-tab');

      const areaText = meal.strArea ? meal.strArea : 'Unknown Area';

      console.log('Meal:', meal); // Log the entire meal object to inspect its structure

      resultTab.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2 class="dish-name">${meal.strMeal}</h2>
        <p class="dish-area">${areaText}</p>
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
// Function to get selected values from checkboxes
function getSelectedValues(selector) {
  const checkboxes = document.querySelectorAll(selector);
  const selectedValues = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.dataset.value); // Use dataset to get the data-value attribute

  return selectedValues;
}

async function filterDishes(selectedCuisines, selectedCategories) {
  try {
    // Convert selectedCategories to an array
    const categoriesArray = Array.isArray(selectedCategories) ? selectedCategories : [selectedCategories];

    // Fetch dishes based on selected categories
    const categoryResponse = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + categoriesArray.map(category => category.trim()).join(','));
    const categoryData = await categoryResponse.json();
    const categoryMeals = categoryData.meals || [];

    // Fetch complete meal details for selected categories
    const categoryDetails = await Promise.all(categoryMeals.map(async meal => {
      const mealResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const mealData = await mealResponse.json();
      return mealData.meals[0];
    }));

    // Fetch dishes based on selected cuisines
    const areaResponse = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + selectedCuisines.map(area => area.trim()).join(','));
    const areaData = await areaResponse.json();
    const areaMeals = areaData.meals || [];

    // Fetch complete meal details for selected cuisines
    const areaDetails = await Promise.all(areaMeals.map(async meal => {
      const mealResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const mealData = await mealResponse.json();
      return mealData.meals[0];
    }));

    // Combine the results
    const combinedMeals = [...categoryDetails, ...areaDetails];

    return combinedMeals;
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    return null;
  }
}


// Event listener for the "Apply Filters" button
const filterButton = document.querySelector('.filter-button');
filterButton.addEventListener('click', async function () {
  // Get selected cuisines and categories
  const selectedCuisines = getSelectedValues('.list-1 input[type="checkbox"]');
  const selectedCategories = getSelectedValues('.list-2 input[type="checkbox"]');

  // Log the selected cuisines and categories (for debugging)
  console.log('Selected Cuisines:', selectedCuisines);
  console.log('Selected Categories:', selectedCategories);

  // Fetch and display filtered dishes
  const filteredMeals = await filterDishes(selectedCuisines, selectedCategories);
  updateResults(filteredMeals);
});
