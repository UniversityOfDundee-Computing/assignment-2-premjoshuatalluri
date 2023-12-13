document.addEventListener("DOMContentLoaded", function () {
  // Fetch data from MealDB API
  fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772")
    .then(response => response.json())
    .then(data => {
      // Update HTML with the fetched recipe data
      document.querySelector('.recipe-img').src = data.meals[0].strMealThumb;
      document.querySelector('h1').innerText = data.meals[0].strMeal;
      document.querySelector('p').innerText = data.meals[0].strCategory;

      // Update ingredients and measurements
      const ingredientsList = document.querySelector('.ingredients-container ul');
      const measurementsList = document.querySelector('.measurements-container ul');

      ingredientsList.innerHTML = '';
      measurementsList.innerHTML = '';

      for (let i = 1; i <= 20; i++) {
        const ingredient = data.meals[0]['strIngredient' + i];
        const measurement = data.meals[0]['strMeasure' + i];

        if (ingredient && ingredient.trim() !== "") {
          const ingredientItem = document.createElement('li');
          ingredientItem.innerText = ingredient;
          ingredientsList.appendChild(ingredientItem);
        }

        if (measurement && measurement.trim() !== "") {
          const measurementItem = document.createElement('li');
          measurementItem.innerText = measurement;
          measurementsList.appendChild(measurementItem);
        }
      }

      // Update cooking instructions
      document.querySelector('.accordion-content p').innerText = data.meals[0].strInstructions;

      // Update video section
      const videoEmbed = document.querySelector('.recipe-video .d-flex');
      const videoUrl = data.meals[0].strYoutube;

      if (videoUrl) {
        const videoFrame = document.createElement('iframe');
        videoFrame.src = videoUrl.replace("watch?v=", "embed/");
        videoFrame.width = "560";
        videoFrame.height = "315";
        videoFrame.allowFullscreen = true;

        videoEmbed.appendChild(videoFrame);
      }
    })
    .catch(error => console.error('Error fetching data:', error));
});
