let images = [];

// Asynchronous function that loads images from images.json
async function loadImages(renderFn = renderGallery) {
  try {
    const response = await fetch('images.json');
    if (!response.ok) {
      throw new Error('Error while fetching images');
    }
    images = await response.json();
    renderFn(images);   // <-- injected dependency
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

// Function that searches for images with user input
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
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  images.forEach(img => {
    const thumbnailImg = document.createElement('img');
    thumbnailImg.src = img.thumbnail;
    thumbnailImg.alt = img.alt;
    thumbnailImg.loading = 'lazy';
    thumbnailImg.addEventListener('click', () => showFullImage(img));
    gallery.appendChild(thumbnailImg);
  });
}

// Function that shows full image with navigation
function showFullImage(img) {
  const modal = document.getElementById('modal');
  const fullImg = document.getElementById('full-image');
  const caption = document.getElementById('image-caption');
  fullImg.src = img.full;
  fullImg.alt = img.alt;
  caption.textContent = img.alt;
  modal.showModal();
}

// Initialization
function init(options) { const { autoLoad = true } = options || {};
  if (typeof document === 'undefined') return;

  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('modal').close();
  });

  document.querySelectorAll('nav button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      const searchinput = document.getElementById('search-input').value;
      let filtered = filterByCategory(images, category);
      filtered = searchByTags(filtered, searchinput);
      renderGallery(filtered);
      document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    const input = e.target.value;
    const activeButton = document.querySelector('nav button.active');
    const category = activeButton ? activeButton.dataset.category : 'all';
    let filtered = filterByCategory(images, category);
    filtered = searchByTags(filtered, input);
    renderGallery(filtered);
  });

  if (autoLoad) { loadImages(); }
}

// Jest will call init() manually when needed
if (typeof window !== 'undefined' && (typeof process === 'undefined' || !process.env.JEST_WORKER_ID)) {
  init();
}

module.exports = {
  filterByCategory,
  searchByTags,
  loadImages,
  renderGallery,
  showFullImage,
  init
};
