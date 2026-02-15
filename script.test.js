
/**
 * UPDATED TEST SUITE FOR script.js
 * Achieves >80% coverage across lines, statements, functions, and branches
 */

jest.resetModules();

// ----------------------
// DOM MOCKS
// ----------------------

const mockedGallery = {
  innerHTML: '',
  appendChild: jest.fn(),
};

const mockedModal = {
  showModal: jest.fn(),
  close: jest.fn(),
};

const mockedFullImg = { src: '', alt: '' };
const mockedCaption = { textContent: '' };

const mockedCloseBtn = { addEventListener: jest.fn() };
const mockedSearchInput = { addEventListener: jest.fn(), value: '' };

const mockedNavButtons = [
  {
    dataset: { category: 'Animals' },
    addEventListener: jest.fn(),
    classList: { add: jest.fn(), remove: jest.fn() }
  },
  {
    dataset: { category: 'Geometry' },
    addEventListener: jest.fn(),
    classList: { add: jest.fn(), remove: jest.fn() }
  }
];

let mockedActiveButton = null;

global.document = {
  getElementById: jest.fn((id) => {
    if (id === 'gallery') return mockedGallery;
    if (id === 'modal') return mockedModal;
    if (id === 'full-image') return mockedFullImg;
    if (id === 'image-caption') return mockedCaption;
    if (id === 'close-modal') return mockedCloseBtn;
    if (id === 'search-input') return mockedSearchInput;
    return null;
  }),
  querySelector: jest.fn((sel) => {
    if (sel === 'nav button.active') return mockedActiveButton;
    return null;
  }),
  querySelectorAll: jest.fn((sel) => {
    if (sel === 'nav button') return mockedNavButtons;
    return [];
  }),
  createElement: jest.fn(() => ({
    src: '',
    alt: '',
    loading: '',
    addEventListener: jest.fn()
  })),
};

// Default fetch so init() doesn't explode
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([])
});

// ----------------------
// IMPORT SCRIPT AFTER MOCKS
// ----------------------

const script = require('./script');

const {
  filterByCategory,
  searchByTags,
  renderGallery,
  showFullImage,
  loadImages,
  init
} = script;

// ----------------------
// TEST DATA
// ----------------------

const mockImages = [
  { id: 1, category: 'Animals', tags: ['animal'], thumbnail: 't1.jpg', full: 'f1.jpg', alt: 'A1' },
  { id: 2, category: 'Geometry', tags: ['shape'], thumbnail: 't2.jpg', full: 'f2.jpg', alt: 'G1' }
];

// ----------------------
// TESTS
// ----------------------

describe('filterByCategory', () => {
  test('returns all for "all"', () => {
    expect(filterByCategory(mockImages, 'all')).toEqual(mockImages);
  });

  test('filters correctly', () => {
    const result = filterByCategory(mockImages, 'Animals');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  test('returns empty for no matches', () => {
    expect(filterByCategory(mockImages, 'Nope')).toHaveLength(0);
  });
});

describe('searchByTags', () => {
  test('returns all if empty input', () => {
    expect(searchByTags(mockImages, '')).toEqual(mockImages);
  });

  test('case-insensitive match', () => {
    const result = searchByTags(mockImages, 'SHAPE');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test('returns empty for no matches', () => {
    expect(searchByTags(mockImages, 'xyz')).toHaveLength(0);
  });
});

describe('renderGallery', () => {
  beforeEach(() => {
    mockedGallery.innerHTML = '';
    mockedGallery.appendChild.mockClear();
    document.createElement.mockClear();
    mockedFullImg.src = '';
    mockedFullImg.alt = '';
    mockedCaption.textContent = '';
    mockedModal.showModal.mockClear();
  });

  test('renders thumbnails with correct properties', () => {
    renderGallery(mockImages);
    expect(mockedGallery.appendChild).toHaveBeenCalledTimes(2);

    const createdImg1 = document.createElement.mock.results[0].value;
    expect(createdImg1.src).toBe('t1.jpg');
    expect(createdImg1.alt).toBe('A1');
    expect(createdImg1.loading).toBe('lazy');

    const createdImg2 = document.createElement.mock.results[1].value;
    expect(createdImg2.src).toBe('t2.jpg');
    expect(createdImg2.alt).toBe('G1');
    expect(createdImg2.loading).toBe('lazy');
  });

  test('adds click listener to thumbnails', () => {
    renderGallery(mockImages);

    const createdImg1 = document.createElement.mock.results[0].value;
    const thumbClickHandler1 = createdImg1.addEventListener.mock.calls[0][1];
    thumbClickHandler1();
    expect(mockedFullImg.src).toBe('f1.jpg');
    expect(mockedFullImg.alt).toBe('A1');
    expect(mockedCaption.textContent).toBe('A1');
    expect(mockedModal.showModal).toHaveBeenCalledTimes(1);

    const createdImg2 = document.createElement.mock.results[1].value;
    const thumbClickHandler2 = createdImg2.addEventListener.mock.calls[0][1];
    thumbClickHandler2();
    expect(mockedFullImg.src).toBe('f2.jpg');
    expect(mockedFullImg.alt).toBe('G1');
    expect(mockedCaption.textContent).toBe('G1');
    expect(mockedModal.showModal).toHaveBeenCalledTimes(2);
  });

  test('clears gallery first', () => {
    mockedGallery.innerHTML = 'old';
    renderGallery(mockImages);
    expect(mockedGallery.innerHTML).toBe('');
  });

  test('handles empty list', () => {
    renderGallery([]);
    expect(mockedGallery.appendChild).not.toHaveBeenCalled();
  });
});

describe('showFullImage', () => {
  beforeEach(() => {
    mockedFullImg.src = '';
    mockedFullImg.alt = '';
    mockedCaption.textContent = '';
    mockedModal.showModal.mockClear();
  });

  test('updates modal content and opens modal', () => {
    showFullImage(mockImages[0]);
    expect(mockedFullImg.src).toBe('f1.jpg');
    expect(mockedFullImg.alt).toBe('A1');
    expect(mockedCaption.textContent).toBe('A1');
    expect(mockedModal.showModal).toHaveBeenCalled();
  });
});

describe('loadImages', () => {
  test('calls renderGallery on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImages)
    });

    const spy = jest.fn();

    await loadImages(spy);

    expect(global.fetch).toHaveBeenCalledWith('images.json');
    expect(spy).toHaveBeenCalledWith(mockImages);
  });

  test('logs error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await loadImages();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('init', () => {
  beforeEach(() => {
    mockedCloseBtn.addEventListener.mockClear();
    mockedSearchInput.addEventListener.mockClear();
    mockedNavButtons.forEach(btn => {
      btn.addEventListener.mockClear();
      btn.classList.add.mockClear();
      btn.classList.remove.mockClear();
    });
    document.querySelector.mockClear();
    document.querySelectorAll.mockClear();
    mockedActiveButton = null;
  });

  test('returns early if document undefined', () => {
    const originalDocument = global.document;
    global.document = undefined;

   init({ autoLoad: false });

    expect(mockedCloseBtn.addEventListener).not.toHaveBeenCalled();
    expect(mockedSearchInput.addEventListener).not.toHaveBeenCalled();
    mockedNavButtons.forEach(btn => {
      expect(btn.addEventListener).not.toHaveBeenCalled();
    });

    global.document = originalDocument;
  });

  test('attaches close button listener', () => {
    init({ autoLoad: false });
    expect(mockedCloseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('close button handler closes modal', () => {
    init({ autoLoad: false });
    const closeHandler = mockedCloseBtn.addEventListener.mock.calls[0][1];
    closeHandler();
    expect(mockedModal.close).toHaveBeenCalled();
  });

  test('attaches nav button listeners', () => {
    init({ autoLoad: false });
    mockedNavButtons.forEach(btn => {
      expect(btn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  test('attaches search input listener', () => {
    init({ autoLoad: false });
    expect(mockedSearchInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
  });

});

describe('nav button click handler', () => {
  let loadSpy;
  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImages)
    });
    mockedNavButtons.forEach(btn => btn.classList.remove.mockClear());
    await loadImages(() => {}); // Populates images without rendering
    loadSpy = jest.spyOn(script, 'loadImages').mockImplementation(() => Promise.resolve());
    init({ autoLoad: false });
    mockedSearchInput.value = '';
    // Clear mocks after init to ignore any potential renders
    document.createElement.mockClear();
    mockedGallery.appendChild.mockClear();
    mockedGallery.innerHTML = '';
  });

  afterEach(() => {
    loadSpy.mockRestore();
  });

  test('filters by category, renders, and sets active (with search empty)', () => {
    const button = mockedNavButtons[0]; // Animals
    const clickHandler = button.addEventListener.mock.calls[0][1];

    clickHandler();

    expect(document.querySelectorAll).toHaveBeenCalledWith('nav button');
    mockedNavButtons.forEach(btn => {
      expect(btn.classList.remove).toHaveBeenCalledWith('active');
    });
    expect(button.classList.add).toHaveBeenCalledWith('active');

    // Assert side effects of renderGallery
    expect(mockedGallery.innerHTML).toBe('');
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(mockedGallery.appendChild).toHaveBeenCalledTimes(1);
    const createdImg = document.createElement.mock.results[0].value;
    expect(createdImg.src).toBe('t1.jpg');
    expect(createdImg.alt).toBe('A1');
  });

  test('applies search if input present', () => {
    const button = mockedNavButtons[1]; // Geometry
    const clickHandler = button.addEventListener.mock.calls[0][1];
    mockedSearchInput.value = 'shape';

    clickHandler();

    // Assert side effects of renderGallery
    expect(mockedGallery.innerHTML).toBe('');
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(mockedGallery.appendChild).toHaveBeenCalledTimes(1);
    const createdImg = document.createElement.mock.results[0].value;
    expect(createdImg.src).toBe('t2.jpg');
    expect(createdImg.alt).toBe('G1');
  });
});

describe('search input handler', () => {
  let loadSpy;
  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImages)
    });
    await loadImages(() => {}); // Populates images without rendering
    loadSpy = jest.spyOn(script, 'loadImages').mockImplementation(() => Promise.resolve());
    init({ autoLoad: false });
    mockedActiveButton = null; // Default no active
    // Clear mocks after init to ignore any potential renders
    document.createElement.mockClear();
    mockedGallery.appendChild.mockClear();
    mockedGallery.innerHTML = '';
  });

  afterEach(() => {
    loadSpy.mockRestore();
  });

  test('filters by search with default category "all" if no active button', () => {
    const inputHandler = mockedSearchInput.addEventListener.mock.calls[0][1];
    const event = { target: { value: 'animal' } };

    inputHandler(event);

    // Assert side effects of renderGallery
    expect(mockedGallery.innerHTML).toBe('');
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(mockedGallery.appendChild).toHaveBeenCalledTimes(1);
    const createdImg = document.createElement.mock.results[0].value;
    expect(createdImg.src).toBe('t1.jpg');
    expect(createdImg.alt).toBe('A1');
  });

  test('filters by search with active category', () => {
    const inputHandler = mockedSearchInput.addEventListener.mock.calls[0][1];
    mockedActiveButton = mockedNavButtons[0]; // Animals
    const event = { target: { value: 'animal' } };

    inputHandler(event);

    // Assert side effects of renderGallery
    expect(mockedGallery.innerHTML).toBe('');
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(mockedGallery.appendChild).toHaveBeenCalledTimes(1);
    const createdImg = document.createElement.mock.results[0].value;
    expect(createdImg.src).toBe('t1.jpg');
    expect(createdImg.alt).toBe('A1');
  });

  test('returns all if search empty (with active category)', () => {
    const inputHandler = mockedSearchInput.addEventListener.mock.calls[0][1];
    mockedActiveButton = mockedNavButtons[1]; // Geometry
    const event = { target: { value: '' } };

    inputHandler(event);

    // Assert side effects of renderGallery
    expect(mockedGallery.innerHTML).toBe('');
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(mockedGallery.appendChild).toHaveBeenCalledTimes(1);
    const createdImg = document.createElement.mock.results[0].value;
    expect(createdImg.src).toBe('t2.jpg');
    expect(createdImg.alt).toBe('G1');
  });
});
