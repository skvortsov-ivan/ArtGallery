let currentFilteredImages = [];
let currentIndex = 0;
let images = [];
const modal = document.getElementById('modal');

// Asyncrone function that loads images from images.json
async function loadImages() {
  try {
    const response = await fetch('images.json');
    if (!response.ok) {
      throw new Error('Error while fetching images');
    }
    images = await response.json();
    // Renders all images initially
    renderGallery(images);
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

// Function that filters images by category
function filterByCategory(allImages, category) {
  if (category === 'all') {
    return allImages;
  }
  return allImages.filter(img => img.category === category);
}

// Function that searches for images user input
function searchByTags(allImages, input) {
  if (!input) {
    return allImages;
  }
  const lowerInput = input.toLowerCase();
  return allImages.filter(img => 
    img.tags.some(tag => tag.toLowerCase().includes(lowerInput))
  );
}

// Function that renders the gallery and updates the webpage
function renderGallery(images) {
  // This is the gallery content visible to the user and updated automatically with user input
  const gallery = document.getElementById('gallery');
  // Very necessary to clear already existing content
  gallery.innerHTML = '';
  images.forEach(img => {
    const figure = document.createElement('figure');
    const thumbnailImg = document.createElement('img');
    thumbnailImg.src = img.thumbnail;
    thumbnailImg.alt = img.alt;
    // Lazy loading
    thumbnailImg.loading = 'lazy';
    // ID for navigation
    thumbnailImg.dataset.id = img.id.toString();
    thumbnailImg.addEventListener('click', () => showFullImage(img));
    figure.appendChild(thumbnailImg);
    gallery.appendChild(figure);
  });
}

// Function that shows full image with navigation
function showFullImage(img) {
  
  // Acquiring the currently visible thumbnails and pairing the images with their id
  const currentThumbs = document.getElementById('gallery').querySelectorAll('figure img');
  
  // Extracting the Ids of the currently visible images
  const currentIds = [];
  for (let i = 0; i < currentThumbs.length; i++) {
    const thumb = currentThumbs[i];
    const id = parseInt(thumb.dataset.id);
    currentIds.push(id);
  }

  // Matching the thumbnail image id to the corresponding full image
  currentFilteredImages = [];
  for (let i = 0; i < currentIds.length; i++) {
    const id = currentIds[i];
    const matchingImage = images.find(image => image.id === id);
    if (matchingImage) { 
      currentFilteredImages.push(matchingImage);
    }
  }

  currentIndex = currentFilteredImages.findIndex(i => i.id === img.id);

  // Updating display
  updateModalDisplay();
  modal.showModal();
}

// Function that updates modal content
function updateModalDisplay() {
  const img = currentFilteredImages[currentIndex];
  if (!img) {
    return;
  }

  const fullImg = document.getElementById('full-image');
  const caption = document.getElementById('image-caption');

  fullImg.src = img.full;
  fullImg.alt = img.alt;
  caption.textContent = img.alt;

  // Enable/disable arrows
  document.getElementById('prev-image').disabled = currentIndex === 0;
  document.getElementById('next-image').disabled = currentIndex === currentFilteredImages.length - 1;
}

// Event listener for closing modal
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('modal').close();
});

// Event listeners for arrows
document.getElementById('prev-image').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateModalDisplay();
  }
});

document.getElementById('next-image').addEventListener('click', () => {
  if (currentIndex < currentFilteredImages.length - 1) {
    currentIndex++;
    updateModalDisplay();
  }
});

// Event listener for category buttons
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    // Get current search input to combine filters
    const searchinput = document.getElementById('search-input').value;
    let filtered = filterByCategory(images, category);
    filtered = searchByTags(filtered, searchinput);
    renderGallery(filtered);
    // Updating active class
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// Event listener for search input
document.getElementById('search-input').addEventListener('input', (e) => {
  const input = e.target.value;
  // Get current category from active button
  const activeButton = document.querySelector('nav button.active');
  const category = activeButton ? activeButton.dataset.category : 'all';
  let filtered = filterByCategory(images, category);
  filtered = searchByTags(filtered, input);
  renderGallery(filtered);
});

// Initialize
loadImages();

// Jest testing category filtering and tag searching
module.exports = {
  filterByCategory,
  searchByTags
};
