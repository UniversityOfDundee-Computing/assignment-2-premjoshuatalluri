// Function to fetch data from MealDB API based on the search query
async function searchDish(query = '') {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await response.json();
    return data.meals; 
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

      resultTab.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2 class="dish-name">${meal.strMeal}</h2>
        <p class="dish-area">${areaText}</p>
        <button class="dish-button" data-meal-id="${meal.idMeal}">View</button>
      `;

      // Add event listener to the "View" button
      resultTab.querySelector('.dish-button').addEventListener('click', function () {
        const mealId = meal.idMeal;
        // Redirect to recipe.html with the mealId as a query parameter
        window.location.href = `recipe.html?mealId=${mealId}`;
      });

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
// Function to handle the initial search based on the query parameter
async function handleInitialSearch() {
  // Get the dishName from the query parameter (added here)
  const urlParams = new URLSearchParams(window.location.search);
  const dishName = urlParams.get('dishName');
  const categoryName = urlParams.get('categoryName'); // added here

  if (dishName) {
    // Set the search input value on the details page
    const searchInput = document.querySelector('.search-box input');
    searchInput.value = dishName;

    // Perform initial search based on the dish name
    const meals = await searchDish(dishName);
    updateResults(meals);
  } else if (categoryName) { 
    // Perform initial search based on the category name
    const meals = await searchDishByCategory(categoryName);
    updateResults(meals);
  } else {
    // Load default dishes if no query parameter
    const defaultMeals = await searchDish();
    updateResults(defaultMeals);
  }
}

// Load default dishes or perform initial search based on query parameter
document.addEventListener('DOMContentLoaded', handleInitialSearch);

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
    let combinedMeals = [];

    if (selectedCuisines.length > 0 && selectedCategories.length > 0) {
      // Multiple cuisines and categories or their combinations
      const categoryResponse = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + selectedCategories.map(category => category.trim()).join(','));
      const categoryData = await categoryResponse.json();
      const categoryMeals = categoryData.meals || [];

      const areaResponse = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + selectedCuisines.map(area => area.trim()).join(','));
      const areaData = await areaResponse.json();
      const areaMeals = areaData.meals || [];

      // Combine the results based on common meal IDs
      combinedMeals = categoryMeals.filter(categoryMeal =>
        areaMeals.some(areaMeal => areaMeal.idMeal === categoryMeal.idMeal)
      );
    } else if (selectedCuisines.length > 0) {
      // Multiple cuisines
      const areaResponse = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + selectedCuisines.map(area => area.trim()).join(','));
      const areaData = await areaResponse.json();
      combinedMeals = areaData.meals || [];
    } else if (selectedCategories.length > 0) {
      // Multiple categories
      const categoryResponse = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + selectedCategories.map(category => category.trim()).join(','));
      const categoryData = await categoryResponse.json();
      combinedMeals = categoryData.meals || [];
    }

    // Fetch complete meal details for the combined results
    const combinedDetails = await Promise.all(combinedMeals.map(async meal => {
      const mealResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const mealData = await mealResponse.json();
      return mealData.meals[0];
    }));

    return combinedDetails;
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