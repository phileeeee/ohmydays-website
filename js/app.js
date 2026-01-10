/**
 * OhMyDays Website - Interactive Countdown Demo
 *
 * Note: The Unsplash API key is public by design (client-side usage).
 * Unsplash applies rate limits to prevent abuse.
 */

// Unsplash API Configuration
const UNSPLASH_ACCESS_KEY = 'HY5BCW3WaJPamCWBE15DxTbUwGX0vC7dMyVP5oSOto';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// App State
const state = {
  eventTitle: '',
  eventDate: null,
  selectedPhoto: null,
  countdownInterval: null
};

// DOM Elements
const elements = {
  // Steps
  stepLanding: document.getElementById('step-landing'),
  stepBackground: document.getElementById('step-background'),
  stepCountdown: document.getElementById('step-countdown'),

  // Step 1: Landing
  eventTitle: document.getElementById('event-title'),
  eventDate: document.getElementById('event-date'),
  charCurrent: document.getElementById('char-current'),
  btnContinue: document.getElementById('btn-continue'),

  // Step 2: Background
  btnBack: document.getElementById('btn-back'),
  previewCard: document.getElementById('preview-card'),
  previewDays: document.getElementById('preview-days'),
  previewTitle: document.getElementById('preview-title'),
  unsplashSearch: document.getElementById('unsplash-search'),
  photoGrid: document.getElementById('photo-grid'),
  btnCreate: document.getElementById('btn-create'),

  // Step 3: Countdown
  countdownContainer: document.getElementById('countdown-container'),
  daysValue: document.getElementById('days-value'),
  daysLabel: document.getElementById('days-label'),
  hoursValue: document.getElementById('hours-value'),
  minsValue: document.getElementById('mins-value'),
  secsValue: document.getElementById('secs-value'),
  countdownDirection: document.getElementById('countdown-direction'),
  countdownEventName: document.getElementById('countdown-event-name'),
  countdownEventDate: document.getElementById('countdown-event-date'),
  btnNew: document.getElementById('btn-new')
};

// Initialize
function init() {
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  elements.eventDate.value = formatDateForInput(tomorrow);
  elements.eventDate.min = formatDateForInput(new Date());

  // Event Listeners
  elements.eventTitle.addEventListener('input', handleTitleInput);
  elements.eventDate.addEventListener('change', handleDateChange);
  elements.btnContinue.addEventListener('click', goToStep2);
  elements.btnBack.addEventListener('click', goToStep1);
  elements.unsplashSearch.addEventListener('input', debounce(searchPhotos, 500));
  elements.btnCreate.addEventListener('click', goToStep3);
  elements.btnNew.addEventListener('click', resetAndStart);

  // Validate form on load
  validateForm();
}

// Step Navigation
function showStep(stepElement) {
  document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
  stepElement.classList.add('active');
}

function goToStep1() {
  showStep(elements.stepLanding);
}

function goToStep2() {
  state.eventTitle = elements.eventTitle.value.trim();
  state.eventDate = new Date(elements.eventDate.value);

  // Update preview
  updatePreview();

  // Search for photos based on event title
  elements.unsplashSearch.value = state.eventTitle;
  searchPhotos();

  showStep(elements.stepBackground);
}

function goToStep3() {
  // Set background image
  if (state.selectedPhoto) {
    elements.countdownContainer.style.backgroundImage = `url(${state.selectedPhoto.urls.regular})`;
  }

  // Set event details
  elements.countdownEventName.textContent = state.eventTitle.toUpperCase();
  elements.countdownEventDate.textContent = formatDateForDisplay(state.eventDate);

  // Start countdown
  startCountdown();

  showStep(elements.stepCountdown);
}

function resetAndStart() {
  // Clear state
  state.eventTitle = '';
  state.eventDate = null;
  state.selectedPhoto = null;

  // Clear interval
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
  }

  // Reset form
  elements.eventTitle.value = '';
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  elements.eventDate.value = formatDateForInput(nextWeek);
  elements.charCurrent.textContent = '0';

  // Reset preview
  elements.previewCard.style.backgroundImage = '';
  elements.previewCard.classList.remove('has-image');

  // Reset countdown background
  elements.countdownContainer.style.backgroundImage = '';

  // Validate and go to step 1
  validateForm();
  goToStep1();
}

// Form Handling
function handleTitleInput(e) {
  const value = e.target.value;
  elements.charCurrent.textContent = value.length;
  state.eventTitle = value;
  validateForm();
}

function handleDateChange(e) {
  state.eventDate = new Date(e.target.value);
  validateForm();
}

function validateForm() {
  const hasTitle = elements.eventTitle.value.trim().length > 0;
  const hasDate = elements.eventDate.value !== '';
  elements.btnContinue.disabled = !(hasTitle && hasDate);
}

// Preview
function updatePreview() {
  const days = calculateDays(state.eventDate);
  elements.previewDays.textContent = Math.abs(days);
  elements.previewTitle.textContent = state.eventTitle.toUpperCase();
}

// Countdown
function startCountdown() {
  updateCountdown();
  state.countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  const target = new Date(state.eventDate);
  target.setHours(0, 0, 0, 0);

  const diff = target - now;
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((absDiff % (1000 * 60)) / 1000);

  elements.daysValue.textContent = days;
  elements.daysLabel.textContent = days === 1 ? 'DAY' : 'DAYS';
  elements.hoursValue.textContent = String(hours).padStart(2, '0');
  elements.minsValue.textContent = String(mins).padStart(2, '0');
  elements.secsValue.textContent = String(secs).padStart(2, '0');
  elements.countdownDirection.textContent = isPast ? 'SINCE' : 'TO GO';
}

function calculateDays(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Unsplash API
async function searchPhotos() {
  const query = elements.unsplashSearch.value.trim() || 'nature';

  elements.photoGrid.innerHTML = '<div class="photo-loading">Searching photos...</div>';

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=portrait`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }

    const data = await response.json();
    displayPhotos(data.results);
  } catch (error) {
    console.error('Unsplash API error:', error);
    elements.photoGrid.innerHTML = '<div class="photo-loading">Failed to load photos. Please try again.</div>';
  }
}

function displayPhotos(photos) {
  if (photos.length === 0) {
    elements.photoGrid.innerHTML = '<div class="photo-loading">No photos found. Try a different search.</div>';
    return;
  }

  elements.photoGrid.innerHTML = photos.map(photo => `
    <div class="photo-item" data-photo-id="${photo.id}">
      <img src="${photo.urls.small}" alt="${photo.alt_description || 'Photo'}" loading="lazy">
    </div>
  `).join('');

  // Store photos data for selection
  elements.photoGrid.photosData = photos;

  // Add click handlers
  elements.photoGrid.querySelectorAll('.photo-item').forEach(item => {
    item.addEventListener('click', () => selectPhoto(item.dataset.photoId));
  });

  // Auto-select first photo
  if (photos.length > 0 && !state.selectedPhoto) {
    selectPhoto(photos[0].id);
  }
}

function selectPhoto(photoId) {
  const photos = elements.photoGrid.photosData || [];
  const photo = photos.find(p => p.id === photoId);

  if (!photo) return;

  state.selectedPhoto = photo;

  // Update selection UI
  elements.photoGrid.querySelectorAll('.photo-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.photoId === photoId);
  });

  // Update preview
  elements.previewCard.style.backgroundImage = `url(${photo.urls.small})`;
  elements.previewCard.classList.add('has-image');
}

// Utility Functions
function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

function formatDateForDisplay(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Start app
document.addEventListener('DOMContentLoaded', init);
