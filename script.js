// Application state
let currentContentType = 'posts'; // Current content type (posts/products)
let editingId = null; // ID of item being edited
let isGameOpen = false; // Game overlay visibility state

// Sample data structure
const sampleData = {
  posts: [
    {
      id: 1,
      title: "First Article",
      content: "This is the content of the first sample article.",
      author: "John Doe",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "Second Article",
      content: "Content of the second article with relevant information.",
      author: "Jane Smith",
      date: "2024-01-16"
    }
  ],
  products: [
    {
      id: 1,
      name: "Product A",
      description: "Description of product A with important features.",
      price: 29.99,
      category: "Electronics"
    },
    {
      id: 2,
      name: "Product B",
      description: "Description of product B with technical specifications.",
      price: 49.99,
      category: "Home"
    }
  ]
};

// Form configurations for different content types
const formConfigs = {
  posts: {
    title: 'Add New Article',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  products: {
    title: 'Add New Product',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true }
    ]
  }
};

// Initialize the application
function initializeApp() {
  // Load initial data if it doesn't exist
  if (!localStorage.getItem('posts')) {
    localStorage.setItem('posts', JSON.stringify(sampleData.posts));
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(sampleData.products));
  }

  // Set up event listeners
  setupEventListeners();
  
  // Load initial content
  loadContent(true);
  generateForm();
  
  // Apply saved theme
  applySavedTheme();
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Apply saved theme from localStorage
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) themeIcon.textContent = '☀️';
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const contentType = this.dataset.contentType;
      switchTab(contentType);
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Form submission
  const dynamicForm = document.getElementById('dynamic-form');
  if (dynamicForm) {
    dynamicForm.addEventListener('submit', handleFormSubmit);
  }

  // Local Storage buttons
  const saveStorageBtn = document.getElementById('save-storage');
  if (saveStorageBtn) saveStorageBtn.addEventListener('click', saveToStorage);
  
  const getStorageBtn = document.getElementById('get-storage');
  if (getStorageBtn) getStorageBtn.addEventListener('click', getFromStorage);
  
  const removeStorageBtn = document.getElementById('remove-storage');
  if (removeStorageBtn) removeStorageBtn.addEventListener('click', removeFromStorage);
  
  const clearStorageBtn = document.getElementById('clear-storage');
  if (clearStorageBtn) clearStorageBtn.addEventListener('click', clearStorage);

  // Game button
  const gameIcon = document.getElementById('game-icon');
  if (gameIcon) {
    gameIcon.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (isGameOpen) {
        closeGame();
      } else {
        openGame();
      }
    });
  }

  // Close game button
  const closeGameBtn = document.getElementById('close-game-btn');
  if (closeGameBtn) {
    closeGameBtn.addEventListener('click', closeGame);
  }

  // Retry game button
  const retryGameBtn = document.getElementById('retry-game-btn');
  if (retryGameBtn) {
    retryGameBtn.addEventListener('click', retryGame);
  }

  // Game iframe events
  const gameIframe = document.getElementById('game-iframe');
  if (gameIframe) {
    gameIframe.addEventListener('load', handleGameLoad);
    gameIframe.addEventListener('error', handleGameError);
  }
}

// Switch between content tabs
function switchTab(contentType) {
  currentContentType = contentType;
  editingId = null;
  
  // Update active tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.contentType === contentType) {
      btn.classList.add('active');
    }
  });
  
  // Load content and regenerate form
  loadContent();
  generateForm();
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Load content based on current type
function loadContent(initialLoad = false) {
  const container = document.getElementById('content-container');
  if (!container) {
    if (initialLoad) {
      setTimeout(() => loadContent(true), 100);
    }
    return;
  }

  const data = JSON.parse(localStorage.getItem(currentContentType) || '[]');
  
  if (data.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #666;">
        <h3>No ${currentContentType === 'posts' ? 'articles' : 'products'} available</h3>
        <p>Add the first ${currentContentType === 'posts' ? 'article' : 'product'} using the form below.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = data.map(item => createContentItem(item)).join('');
  void container.offsetHeight; // Force reflow
}

// Create HTML for a content item
function createContentItem(item) {
  if (currentContentType === 'posts') {
    return `
      <div class="content-item">
        <h3>${item.title}</h3>
        <p><strong>Author:</strong> ${item.author}</p>
        <p><strong>Date:</strong> ${item.date}</p>
        <p>${item.content}</p>
        <div class="actions">
          <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
          <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="content-item">
        <h3>${item.name}</h3>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Price:</strong> $${item.price}</p>
        <p>${item.description}</p>
        <div class="actions">
          <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
          <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        </div>
      </div>
    `;
  }
}

// Generate form based on current content type
function generateForm() {
  const formContainer = document.getElementById('dynamic-form');
  const formTitle = document.getElementById('form-title');
  
  if (!formContainer || !formTitle) return;
  
  const config = formConfigs[currentContentType];
  
  formTitle.textContent = editingId ? 
    `Edit ${currentContentType === 'posts' ? 'Article' : 'Product'}` : 
    config.title;
  
  formContainer.innerHTML = config.fields.map(field => {
    const inputType = field.type === 'textarea' ? 
      `<textarea name="${field.name}" ${field.required ? 'required' : ''}></textarea>` :
      `<input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>`;
    
    return `
      <div class="form-group">
        <label for="${field.name}">${field.label}:</label>
        ${inputType}
      </div>
    `;
  }).join('') + `
    <button type="submit" class="submit-btn">
      ${editingId ? 'Update' : 'Add'} ${currentContentType === 'posts' ? 'Article' : 'Product'}
    </button>
    ${editingId ? '<button type="button" class="edit-btn" onclick="cancelEdit()">Cancel</button>' : ''}
  `;
  
  if (editingId) {
    fillFormForEdit();
  }
}

// Fill form with data for editing
function fillFormForEdit() {
  const data = JSON.parse(localStorage.getItem(currentContentType) || '[]');
  const item = data.find(i => i.id === editingId);
  
  if (item) {
    const form = document.getElementById('dynamic-form');
    if (!form) return;
    
    Object.keys(item).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && key !== 'id') {
        input.value = item[key];
      }
    });
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = JSON.parse(localStorage.getItem(currentContentType) || '[]');
  
  const newItem = {};
  formData.forEach((value, key) => {
    newItem[key] = value;
  });
  
  if (editingId) {
    const index = data.findIndex(item => item.id === editingId);
    if (index !== -1) {
      newItem.id = editingId;
      data[index] = newItem;
    }
    editingId = null;
  } else {
    newItem.id = Date.now();
    data.push(newItem);
  }
  
  localStorage.setItem(currentContentType, JSON.stringify(data));
  
  e.target.reset();
  loadContent();
  generateForm();
  
  showStatus('success', `${currentContentType === 'posts' ? 'Article' : 'Product'} ${editingId ? 'updated' : 'added'} successfully`);
}

// Edit an item
function editItem(id) {
  editingId = id;
  generateForm();
  const formContainer = document.getElementById('form-container');
  if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Cancel editing
function cancelEdit() {
  editingId = null;
  const form = document.getElementById('dynamic-form');
  if (form) form.reset();
  generateForm();
}

// Delete an item
function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    const data = JSON.parse(localStorage.getItem(currentContentType) || '[]');
    const filteredData = data.filter(item => item.id !== id);
    localStorage.setItem(currentContentType, JSON.stringify(filteredData));
    loadContent();
    showStatus('success', `${currentContentType === 'posts' ? 'Article' : 'Product'} deleted successfully`);
  }
}

// Toggle between light/dark theme
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('.theme-icon');
  
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    if (themeIcon) themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

// Local Storage functions
function saveToStorage() {
  const key = document.getElementById('storage-key').value;
  const value = document.getElementById('storage-value').value;
  
  if (!key.trim()) {
    showStorageStatus('error', 'Please enter a key');
    return;
  }
  
  try {
    localStorage.setItem(key, value);
    showStorageStatus('success', `Saved: ${key} = ${value}`);
    document.getElementById('storage-key').value = '';
    document.getElementById('storage-value').value = '';
  } catch (error) {
    showStorageStatus('error', 'Error saving: ' + error.message);
  }
}

function getFromStorage() {
  const key = document.getElementById('storage-key').value;
  
  if (!key.trim()) {
    showStorageStatus('error', 'Please enter a key');
    return;
  }
  
  const value = localStorage.getItem(key);
  if (value !== null) {
    document.getElementById('storage-value').value = value;
    showStorageStatus('success', `Retrieved: ${key} = ${value}`);
  } else {
    showStorageStatus('error', `Key not found: ${key}`);
  }
}

function removeFromStorage() {
  const key = document.getElementById('storage-key').value;
  
  if (!key.trim()) {
    showStorageStatus('error', 'Please enter a key');
    return;
  }
  
  if (localStorage.getItem(key) !== null) {
    localStorage.removeItem(key);
    showStorageStatus('success', `Removed: ${key}`);
    document.getElementById('storage-key').value = '';
    document.getElementById('storage-value').value = '';
  } else {
    showStorageStatus('error', `Key not found: ${key}`);
  }
}

function clearStorage() {
  if (confirm('Are you sure you want to clear all Local Storage?')) {
    localStorage.clear();
    showStorageStatus('success', 'Local Storage cleared completely');
    document.getElementById('storage-key').value = '';
    document.getElementById('storage-value').value = '';
    
    // Restore sample data
    localStorage.setItem('posts', JSON.stringify(sampleData.posts));
    localStorage.setItem('products', JSON.stringify(sampleData.products));
    loadContent();
  }
}

// Show status message for storage operations
function showStorageStatus(type, message) {
  const output = document.getElementById('storage-output');
  if (!output) return;
  output.innerHTML = `<span class="${type}">${message}</span>`;
  setTimeout(() => {
    if (output) output.innerHTML = '';
  }, 3000);
}

// Show status message for form operations
function showStatus(type, message) {
  const statusDiv = document.getElementById('form-status');
  if (!statusDiv) return;
  statusDiv.innerHTML = `<span class="${type}">${message}</span>`;
  setTimeout(() => {
    if (statusDiv) statusDiv.innerHTML = '';
  }, 3000);
}

// Game functions
function openGame() {
  if (isGameOpen) return;
  
  isGameOpen = true;
  const overlay = document.getElementById('game-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    
    // Check if game loads correctly
    setTimeout(() => {
      const iframe = document.getElementById('game-iframe');
      if (iframe) {
        try {
          if (iframe.contentDocument === null) {
            handleGameError();
          }
        } catch (error) {
          console.warn('Error checking game:', error);
        }
      }
    }, 2000);
  }
}

function closeGame() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  isGameOpen = false;
}

function handleGameLoad() {
  const errorDiv = document.getElementById('game-error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
  console.log('Game loaded successfully');
}

function handleGameError() {
  const errorDiv = document.getElementById('game-error');
  const iframe = document.getElementById('game-iframe');
  
  if (errorDiv && iframe) {
    errorDiv.style.display = 'block';
    iframe.style.display = 'none';
  }
  console.error('Error loading game');
}

function retryGame() {
  const iframe = document.getElementById('game-iframe');
  const errorDiv = document.getElementById('game-error');
  
  if (iframe && errorDiv) {
    errorDiv.style.display = 'none';
    iframe.style.display = 'block';
    iframe.src = iframe.src; // Reload iframe
  }
}

// Make functions globally accessible
window.editItem = editItem;
window.deleteItem = deleteItem;
window.cancelEdit = cancelEdit;
