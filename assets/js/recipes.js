document.addEventListener("DOMContentLoaded", function () {
  // Extract mealId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const mealId = urlParams.get('mealId');

  if (!mealId) {
    console.error('Meal ID not found in the URL');
    return;
  }

  // Fetch data for the specified meal ID
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
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

      // Update nearby restaurants section
      const nearbyRestaurants = document.querySelector('.nearby-restaurants .d-flex');

      const nearbyRestaurantsList = document.createElement('ul');
      nearbyRestaurantsList.className = 'restaurants-list';
      nearbyRestaurants.appendChild(nearbyRestaurantsList);

      // Use Google Places API to find nearby restaurants
      const googleApiKey = 'AIzaSyAmM8Oq1DEVYg9L3BH1ppZL9i5vAFWIRxA';

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const userLocation = `${position.coords.latitude},${position.coords.longitude}`;
          const proxyUrl = 'http://localhost:8080/';
          const placesApiUrl = `${proxyUrl}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation}&radius=5000&type=restaurant&keyword=${encodeURIComponent(data.meals[0].strMeal)}&key=${googleApiKey}`;

          fetch(placesApiUrl)
            .then(response => response.json())
            .then(placesData => {
              placesData.results.slice(0, 5).forEach(place => {
                const restaurantItem = document.createElement('li');

                // Extract relevant information from the place object
                const internationalPhoneNumber = place.international_phone_number || 'Number not available';

                // Construct HTML for the restaurant item
                restaurantItem.innerHTML = `
                  <strong>${place.name}</strong><br>
                  <strong>Address:</strong><br>${place.vicinity.replace(/,/g, '<br>')}<br>
                  <strong>Contact number:</strong> ${internationalPhoneNumber}<br>
                `;

                // Append the restaurant item to the list
                nearbyRestaurantsList.appendChild(restaurantItem);
              });
            })
            .catch(error => console.error('Error fetching nearby restaurants:', error));
        });
      }
    })
    .catch(error => console.error('Error fetching data:', error));
});
