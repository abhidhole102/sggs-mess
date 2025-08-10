
        // API URLs
        const apiUrl = 'https://script.google.com/macros/s/AKfycbzGtrN_D8u5y94rBg44hPd5RKTbO0BHryUL1dsKC76CPjqzUekNOCxnaX3cROTgjEA4cQ/exec';
        // IMPORTANT: Replace this with your Google Apps Script URL for handling ratings
        const ratingApiUrl = 'https://script.google.com/macros/s/YOUR_NEW_OR_MODIFIED_APP_SCRIPT_ID/exec'; 

        // Calendar variables
        let currentDate = new Date();
        let selectedDateObj = new Date();
        let menuData = [];

        // Month names
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Rating variables
        let selectedRating = 0;
        let userHasRated = localStorage.getItem('userRatedToday') === new Date().toDateString();
        let currentAverageRating = 0.0;
        let currentTotalRatings = 0;

        /**
         * Initializes the calendar display and event listeners.
         */
        function initializeCalendar() {
            updateCalendarDisplay();
            updateSelectedDate();
            
            document.getElementById('prevMonth').addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                updateCalendarDisplay();
            });
            
            document.getElementById('nextMonth').addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                updateCalendarDisplay();
            });
        }

        /**
         * Updates the calendar grid to show the correct days for the current month.
         */
        function updateCalendarDisplay() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();
            
            const prevMonth = new Date(year, month, 0);
            const daysInPrevMonth = prevMonth.getDate();
            
            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.innerHTML = '';
            
            for (let i = startingDayOfWeek - 1; i >= 0; i--) {
                const dayElement = createDayElement(daysInPrevMonth - i, true);
                calendarGrid.appendChild(dayElement);
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = createDayElement(day, false);
                calendarGrid.appendChild(dayElement);
            }
            
            const totalCells = calendarGrid.children.length;
            const remainingCells = 42 - totalCells;
            for (let day = 1; day <= remainingCells && totalCells < 42; day++) {
                const dayElement = createDayElement(day, true);
                calendarGrid.appendChild(dayElement);
            }
        }

        /**
         * Creates a single day element for the calendar.
         * @param {number} day - The day of the month.
         * @param {boolean} isOtherMonth - True if the day belongs to a different month.
         * @returns {HTMLElement} The created day element.
         */
        function createDayElement(day, isOtherMonth) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            if (isOtherMonth) {
                dayElement.classList.add('other-month');
            } else {
                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const today = new Date();
                
                if (dayDate.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                if (dayDate.toDateString() === selectedDateObj.toDateString()) {
                    dayElement.classList.add('selected');
                }
                
                const dateString = dayDate.toISOString().split('T')[0];
                if (menuData.some(item => {
                    const itemDate = new Date(item.date);
                    const itemIndiaDate = new Date(itemDate.getTime() + (5.5 * 60 * 60 * 1000));
                    return itemIndiaDate.toISOString().split('T')[0] === dateString;
                })) {
                    dayElement.classList.add('has-menu');
                }
                
                dayElement.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    dayElement.classList.add('selected');
                    
                    selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    updateSelectedDate();
                    loadMenuForDate(selectedDateObj);
                });
            }
            
            return dayElement;
        }

        /**
         * Updates the display to show the currently selected date.
         */
        function updateSelectedDate() {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            document.getElementById('selectedDate').textContent = selectedDateObj.toLocaleDateString('en-IN', options);
        }

        /**
         * Fetches the full menu data and initializes the page.
         */
        function loadMenu() {
            const menuDiv = document.getElementById('menu');
            menuDiv.innerHTML = `
                <div class="loading mx-auto mb-4"></div>
                <p class="text-gray-600 font-medium">Loading delicious menu...</p>
            `;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    menuData = data;
                    updateCalendarDisplay(); // Refresh calendar to show menu indicators
                    loadMenuForDate(selectedDateObj);
                })
                .catch(error => {
                    menuDiv.innerHTML = `
                        <div class="text-center py-8">
                            <div class="text-6xl mb-4">⚠️</div>
                            <p class="text-red-600 font-medium text-lg">Failed to load menu</p>
                            <p class="text-gray-500 text-sm mt-2">Please try refreshing the page</p>
                        </div>
                    `;
                    console.error(error);
                });
        }

        /**
         * Loads the menu for a specific date and updates the UI.
         * @param {Date} date - The date to load the menu for.
         */
        function loadMenuForDate(date) {
            const menuDiv = document.getElementById('menu');
            
            const selectedDateString = date.toISOString().split('T')[0];
            
            const selectedMenu = menuData.find(item => {
                const itemDate = new Date(item.date);
                const itemIndiaDate = new Date(itemDate.getTime() + (5.5 * 60 * 60 * 1000));
                return itemIndiaDate.toISOString().split('T')[0] === selectedDateString;
            });

            if (selectedMenu) {
                menuDiv.innerHTML = `
                    <div class="meal-item">
                        <div class="flex items-center mb-3">
                            <span class="meal-icon">🌅</span>
                            <h3 class="text-base font-semibold text-gray-800">Breakfast</h3>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">${selectedMenu.breakfast}</p>
                    </div>
                    <div class="meal-item">
                        <div class="flex items-center mb-3">
                            <span class="meal-icon">☀️</span>
                            <h3 class="text-base font-semibold text-gray-800">Lunch</h3>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">${selectedMenu.lunch}</p>
                    </div>
                    <div class="meal-item">
                        <div class="flex items-center mb-3">
                            <span class="meal-icon">🍪</span>
                            <h3 class="text-base font-semibold text-gray-800">Snacks</h3>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">${selectedMenu.snacks}</p>
                    </div>
                    <div class="meal-item">
                        <div class="flex items-center mb-3">
                            <span class="meal-icon">🌙</span>
                            <h3 class="text-base font-semibold text-gray-800">Dinner</h3>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">${selectedMenu.dinner}</p>
                    </div>
                `;
            } else {
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date().setHours(0,0,0,0);
                
                menuDiv.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-6xl mb-4">${isPast ? '📅' : '🤔'}</div>
                        <p class="text-gray-600 font-medium text-lg">
                            ${isPast ? 'No menu data available for this past date.' : 
                              isToday ? 'Menu for today is not yet updated.' : 
                              'Menu for this date is not yet available.'}
                        </p>
                        <p class="text-gray-500 text-sm mt-2">
                            ${isToday ? 'Please check back later!' : 'Try selecting a different date.'}
                        </p>
                    </div>
                `;
            }
            
            // Now, also fetch ratings for this date
            fetchRatingsForDate(date);
            initializeRating(); // Re-initialize rating state on date change
        }

        /**
         * Re-fetches the full menu data from the API.
         */
        function refreshMenu() {
            loadMenu();
        }


        // --- Rating System Functions ---

        /**
         * Updates the average and total rating display in the UI.
         */
        function updateRatingDisplay() {
            const avgRatingEl = document.getElementById('averageRating');
            const totalRatingsEl = document.getElementById('totalRatings');

            if (currentAverageRating > 0) {
                avgRatingEl.textContent = currentAverageRating.toFixed(1);
                totalRatingsEl.textContent = `(${currentTotalRatings} ratings)`;
            } else {
                avgRatingEl.textContent = 'N/A';
                totalRatingsEl.textContent = '(No ratings)';
            }
        }
        
        /**
         * Fetches ratings for a specific date from the rating API.
         * @param {Date} date - The date to fetch ratings for.
         */
        async function fetchRatingsForDate(date) {
            const ratingSection = document.getElementById('starRating').closest('.menu-card');
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading mx-auto mb-4';
            const loadingText = document.createElement('p');
            loadingText.className = 'text-gray-600 font-medium';
            loadingText.textContent = 'Fetching ratings...';

            document.getElementById('averageRating').textContent = '...';
            document.getElementById('totalRatings').textContent = '';
            document.getElementById('ratingMessage').classList.add('hidden');
            
            // Add loading indicator if not already present
            if (!ratingSection.querySelector('.loading')) {
                ratingSection.prepend(loadingText);
                ratingSection.prepend(loadingSpinner);
            }

            const dateParam = date.toISOString().split('T')[0];
            try {
                const response = await fetch(`${ratingApiUrl}?action=getRatings&date=${dateParam}`);
                const data = await response.json();

                if (data && typeof data.averageRating === 'number' && typeof data.totalRatings === 'number') {
                    currentAverageRating = data.averageRating;
                    currentTotalRatings = data.totalRatings;
                } else {
                    currentAverageRating = 0.0;
                    currentTotalRatings = 0;
                }
            } catch (error) {
                console.error('Error fetching ratings:', error);
                document.getElementById('averageRating').textContent = 'N/A';
                document.getElementById('totalRatings').textContent = '(Error)';
                document.getElementById('ratingMessage').textContent = 'Could not fetch ratings.';
                document.getElementById('ratingMessage').className = 'mt-3 text-sm text-red-600';
                document.getElementById('ratingMessage').classList.remove('hidden');
            } finally {
                loadingSpinner.remove();
                loadingText.remove();
                updateRatingDisplay();
                initializeRating(); // Re-initialize the rating UI after fetching new data
            }
        }

        /**
         * Initializes the star rating event listeners.
         * It also checks if the user has already rated today.
         */
        function initializeRating() {
            const stars = document.querySelectorAll('.star');
            const submitButton = document.getElementById('submitRating');
            selectedRating = 0; // Reset selected rating
            
            userHasRated = localStorage.getItem('userRatedToday') === new Date().toDateString();

            if (userHasRated) {
                submitButton.disabled = true;
                submitButton.textContent = 'Already Rated Today';
                submitButton.style.background = '#6b7280';
                document.getElementById('ratingMessage').textContent = 'Thank you for your feedback!';
                document.getElementById('ratingMessage').className = 'mt-3 text-sm text-green-600';
                document.getElementById('ratingMessage').classList.remove('hidden');
            } else {
                submitButton.disabled = true; // Disabled by default until a star is selected
                submitButton.textContent = 'Submit Rating';
                submitButton.style.background = '#f59e0b';
                document.getElementById('ratingMessage').classList.add('hidden');
            }

            stars.forEach((star, index) => {
                star.onclick = () => {
                    if (!userHasRated) {
                        selectedRating = index + 1;
                        updateStarDisplay();
                        submitButton.disabled = false;
                    }
                };

                star.onmouseenter = () => {
                    if (!userHasRated) {
                        highlightStars(index + 1);
                    }
                };

                // Remove previous click/hover state
                star.style.filter = 'none';
                star.style.transform = 'scale(1)';
            });

            document.getElementById('starRating').onmouseleave = () => {
                if (!userHasRated) {
                    updateStarDisplay(); // Reset to selected rating or no rating
                }
            };
            
            updateStarDisplay(); // Initial display
        }

        /**
         * Highlights the stars based on the hover rating.
         * @param {number} rating - The number of stars to highlight.
         */
        function highlightStars(rating) {
            const stars = document.querySelectorAll('.star');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.style.filter = 'brightness(1.2) drop-shadow(0 0 8px #fbbf24)';
                    star.style.transform = 'scale(1.1)';
                } else {
                    star.style.filter = 'brightness(0.6)';
                    star.style.transform = 'scale(1)';
                }
            });
        }
        
        /**
         * Updates the star display based on the user's current selected rating.
         */
        function updateStarDisplay() {
            const stars = document.querySelectorAll('.star');
            stars.forEach((star, index) => {
                if (index < selectedRating) {
                    star.style.filter = 'brightness(1.2) drop-shadow(0 0 5px #fbbf24)';
                    star.style.transform = 'scale(1.05)';
                } else {
                    star.style.filter = 'brightness(0.6)';
                    star.style.transform = 'scale(1)';
                }
            });
        }

        /**
         * Submits the user's rating to the API.
         */
        async function submitRating() {
            if (selectedRating === 0) {
                // Using a custom message box instead of alert()
                document.getElementById('ratingMessage').textContent = 'Please select a rating first!';
                document.getElementById('ratingMessage').className = 'mt-3 text-sm text-red-600';
                document.getElementById('ratingMessage').classList.remove('hidden');
                return;
            }

            const submitButton = document.getElementById('submitRating');
            const ratingMessageDiv = document.getElementById('ratingMessage');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            ratingMessageDiv.textContent = 'Submitting your rating...';
            ratingMessageDiv.className = 'mt-3 text-sm text-blue-600';
            ratingMessageDiv.classList.remove('hidden');

            const payload = {
                action: 'submitRating',
                date: selectedDateObj.toISOString().split('T')[0],
                rating: selectedRating
            };

            try {
                const response = await fetch(ratingApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.status === 'success') {
                    localStorage.setItem('userRatedToday', new Date().toDateString());
                    userHasRated = true; 
                    ratingMessageDiv.textContent = 'Rating submitted successfully! Thank you for your feedback.';
                    ratingMessageDiv.className = 'mt-3 text-sm text-green-600';
                    ratingMessageDiv.classList.remove('hidden');
                    
                    // Update displayed average and total ratings from API response
                    currentAverageRating = data.newAverageRating;
                    currentTotalRatings = data.newTotalRatings;
                    updateRatingDisplay();
                    
                    // Final UI update
                    submitButton.textContent = 'Already Rated Today';
                    submitButton.style.background = '#6b7280';
                } else {
                    throw new Error(data.message || 'Failed to submit rating.');
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
                ratingMessageDiv.textContent = `Error: ${error.message || 'Could not submit rating.'}`;
                ratingMessageDiv.className = 'mt-3 text-sm text-red-600';
                ratingMessageDiv.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Rating';
            }
        }

        // Initialize everything
        document.addEventListener('DOMContentLoaded', () => {
            initializeCalendar();
            loadMenu();
            // initializeRating and updateRatingDisplay are now called within loadMenuForDate and fetchRatingsForDate
        });
        document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openFeedback");
    const modal = document.getElementById("feedbackModal");
    const closeBtn = document.getElementById("closeFeedback");

    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // Optional: close when clicking outside the form
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });
});

function loadNotices() {
  const apiUrl = "PASTE_YOUR_APPS_SCRIPT_URL_HERE"; 

  fetch(apiUrl)
  
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("noticeList");
      list.innerHTML = "";

      if (data.length === 0) {
        list.innerHTML = "<li>No current notices.</li>";
        return;
      }

      data.forEach(notice => {
        const li = document.createElement("li");
        li.textContent = notice.text;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Notice fetch error:", err);
      document.getElementById("noticeList").innerHTML = "<li>Failed to load notices.</li>";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadNotices();
});
function openProfile(name, branch, imageUrl) {
  document.getElementById('modalName').textContent = name;
  document.getElementById('modalBranch').textContent = branch;
  document.getElementById('modalImage').src = imageUrl;
  document.getElementById('profileModal').classList.remove('hidden');
}

document.getElementById('closeProfileModal').addEventListener('click', () => {
  document.getElementById('profileModal').classList.add('hidden');
});
function openProfile(name, branch, imageUrl) {
  document.getElementById('modalName').textContent = name;
  document.getElementById('modalBranch').textContent = branch;
  document.getElementById('modalImage').src = imageUrl;
  document.getElementById('profileModal').classList.remove('hidden');
}

document.getElementById('closeProfileModal').addEventListener('click', () => {
  document.getElementById('profileModal').classList.add('hidden');
});
// Add this at the top with your other API URLs
const galleryApiUrl = 'YOUR_APPS_SCRIPT_URL'; // Same as your apiUrl

// Upload functionality
document.getElementById('foodPhoto').addEventListener('change', function(e) {
  const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
  document.getElementById('fileName').textContent = fileName;
});

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const fileInput = document.getElementById('foodPhoto');
  const dishName = document.getElementById('dishName').value;
  const statusEl = document.getElementById('uploadStatus');
  
  if (!fileInput.files[0]) {
    statusEl.textContent = 'Please select a photo first!';
    statusEl.className = 'text-sm text-center mt-2 text-red-600';
    return;
  }
  
  const file = fileInput.files[0];
  const reader = new FileReader();
  
  statusEl.textContent = 'Uploading...';
  statusEl.className = 'text-sm text-center mt-2 text-blue-600';
  
  reader.onload = function(e) {
    const imageData = e.target.result.split(',')[1];
    
    fetch(galleryApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'uploadFoodPhoto',
        image: imageData,
        mimeType: file.type,
        filename: file.name,
        dishName: dishName,
        date: new Date().toISOString().split('T')[0]
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        statusEl.textContent = 'Upload successful!';
        statusEl.className = 'text-sm text-center mt-2 text-green-600';
        fileInput.value = '';
        document.getElementById('fileName').textContent = 'No file selected';
        document.getElementById('dishName').value = '';
        loadFoodGallery();
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      statusEl.textContent = 'Error: ' + error.message;
      statusEl.className = 'text-sm text-center mt-2 text-red-600';
    });
  };
  
  reader.readAsDataURL(file);
});

// Gallery functionality
function loadFoodGallery() {
  const galleryEl = document.getElementById('foodGallery');
  
  galleryEl.innerHTML = `
    <div class="text-center py-8 col-span-full">
      <div class="loading mx-auto mb-4"></div>
      <p class="text-gray-600">Loading food gallery...</p>
    </div>
  `;
  
  fetch(`${galleryApiUrl}?action=getFoodPhotos`)
    .then(response => response.json())
    .then(photos => {
      if (photos.length === 0) {
        galleryEl.innerHTML = `
          <div class="col-span-full text-center py-8">
            <p class="text-gray-600">No photos yet. Be the first to upload!</p>
          </div>
        `;
        return;
      }
      
      galleryEl.innerHTML = '';
      
      photos.forEach(photo => {
        const photoCard = document.createElement('div');
        photoCard.className = 'menu-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow';
        photoCard.innerHTML = `
          <img src="${photo.url}" alt="${photo.dishName}" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 dark:text-white truncate">${photo.dishName}</h3>
            <p class="text-xs text-gray-500 mt-1">Uploaded by ${photo.uploader}</p>
            <p class="text-xs text-gray-400 mt-1">${new Date(photo.date).toLocaleDateString('en-IN')}</p>
          </div>
        `;
        galleryEl.appendChild(photoCard);
      });
    })
    .catch(error => {
      console.error('Gallery load error:', error);
      galleryEl.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-red-600">Failed to load gallery. Please try again later.</p>
        </div>
      `;
    });
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFoodGallery();
});