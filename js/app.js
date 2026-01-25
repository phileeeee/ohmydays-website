/**
 * OhMyDays Website - Card Shuffle Landing Page
 */

// Sample events with Unsplash images (same as app)
const sampleEvents = [
  {
    id: '1',
    title: 'Baby Oliver',
    number: '16',
    label: 'MONTHS AGO',
    image: 'https://plus.unsplash.com/premium_photo-1701984401372-37d75e47dd6a?w=400&h=500&fit=crop&crop=focalpoint&fp-y=0.65&q=80',
  },
  {
    id: '2',
    title: 'Bali Trip',
    number: '52',
    label: 'DAYS TO GO',
    image: 'https://plus.unsplash.com/premium_photo-1692897457030-b37d3f6f9abd?w=400&h=500&fit=crop&crop=focalpoint&fp-z=1.5&q=80',
  },
  {
    id: '3',
    title: 'Our Wedding',
    number: '8',
    label: 'YEARS AGO',
    image: 'https://images.unsplash.com/photo-1596744743105-b1e229d13036?w=400&h=500&fit=crop&q=80',
  },
  {
    id: '4',
    title: 'New Car',
    number: '5',
    label: 'MONTHS TO GO',
    image: 'https://images.unsplash.com/photo-1576658363469-f5323eab79cf?w=400&h=500&fit=crop&q=80',
  },
  {
    id: '5',
    title: 'Marathon',
    number: '30',
    label: 'DAYS TO GO',
    image: 'https://images.unsplash.com/photo-1758506971986-b0d0edebd8d5?w=400&h=500&fit=crop&q=80',
  },
  {
    id: '6',
    title: 'NYE Party',
    number: '28',
    label: 'DAYS TO GO',
    image: 'https://images.unsplash.com/photo-1643186921363-d9fb2191f798?w=400&h=500&fit=crop&crop=focalpoint&fp-z=1.5&q=80',
  },
  {
    id: '7',
    title: 'Tokyo Summit',
    number: '3',
    label: 'MONTHS TO GO',
    image: 'https://images.unsplash.com/photo-1584660470766-20ac1a28c7fe?w=400&h=500&fit=crop&q=80',
  },
  {
    id: '8',
    title: "Mochi's Birthday",
    number: '14',
    label: 'DAYS TO GO',
    image: 'https://plus.unsplash.com/premium_photo-1707410050564-df6b5503f220?w=400&h=500&fit=crop&q=80',
  },
];

// Get card width based on screen size
function getCardWidth() {
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1024) return 120;
  if (screenWidth >= 768) return 110;
  if (screenWidth >= 480) return 95;
  return 120;
}

// Fan slot positions: [translateX multiplier, scale, zIndex]
// 5 visible slots + 3 hidden slots
function getFanSlots() {
  return [
    [-1.6, 0.82, 2],   // Slot 0: Far left
    [-0.85, 0.90, 4],  // Slot 1: Left
    [0, 1.05, 6],      // Slot 2: Center (focus)
    [0.85, 0.90, 4],   // Slot 3: Right
    [1.6, 0.82, 2],    // Slot 4: Far right
    [-0.85, 0.70, 1],  // Slot 5: Hidden behind left
    [0.85, 0.70, 1],   // Slot 6: Hidden behind right
    [0, 0.60, 0],      // Slot 7: Hidden behind center
  ];
}

// Map card index to slot based on focused card
function getCardSlots(focusIndex) {
  const slots = [];
  for (let i = 0; i < sampleEvents.length; i++) {
    const offset = (i - focusIndex + sampleEvents.length) % sampleEvents.length;
    // Map offset to slot: 0->2 (center), 1->3, 2->4, 3->6, 4->7, 5->5, 6->0, 7->1
    const slotMapping = [2, 3, 4, 6, 7, 5, 0, 1];
    slots[i] = slotMapping[offset];
  }
  return slots;
}

// State
let focusedCardIndex = 0;
let cardElements = [];

// Create card HTML
function createCard(event, index) {
  const card = document.createElement('div');
  card.className = 'shuffle-card';
  card.dataset.index = index;
  card.style.backgroundImage = `url(${event.image})`;

  card.innerHTML = `
    <div class="card-content">
      <span class="card-number">${event.number}</span>
      <span class="card-label">${event.label}</span>
      <span class="card-title">${event.title}</span>
    </div>
  `;

  card.addEventListener('click', () => handleCardClick(index));

  return card;
}

// Update card positions
function updateCardPositions(animate = true) {
  const cardWidth = getCardWidth();
  const fanSlots = getFanSlots();
  const slots = getCardSlots(focusedCardIndex);

  cardElements.forEach((card, index) => {
    const slot = slots[index];
    const [xMultiplier, scale, zIndex] = fanSlots[slot];
    const translateX = xMultiplier * cardWidth;

    if (animate) {
      card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
    } else {
      card.style.transition = 'none';
    }

    card.style.transform = `translateX(${translateX}px) scale(${scale})`;
    card.style.zIndex = zIndex;
    card.style.opacity = zIndex === 0 ? 0.5 : 1;
  });
}

// Handle card click
function handleCardClick(index) {
  if (index === focusedCardIndex) return;

  focusedCardIndex = index;
  updateCardPositions(true);
}

// Initialize card shuffle
function initCardShuffle() {
  const container = document.getElementById('card-shuffle');
  if (!container) return;

  // Create all cards
  sampleEvents.forEach((event, index) => {
    const card = createCard(event, index);
    container.appendChild(card);
    cardElements.push(card);
  });

  // Set initial positions without animation
  updateCardPositions(false);

  // Animate in after a short delay
  setTimeout(() => {
    cardElements.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(0) scale(0.5)';
    });

    // Stagger the fan-out animation
    setTimeout(() => {
      updateCardPositions(true);
    }, 100);
  }, 300);

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCardPositions(false);
    }, 100);
  });

  // Add swipe support for touch devices
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next card
        focusedCardIndex = (focusedCardIndex + 1) % sampleEvents.length;
      } else {
        // Swipe right - previous card
        focusedCardIndex = (focusedCardIndex - 1 + sampleEvents.length) % sampleEvents.length;
      }
      updateCardPositions(true);
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCardShuffle);
