// Estado de la aplicación
let currentContentType = 'posts';
let editingId = null;
let isGameOpen = false;

// Datos de ejemplo
const sampleData = {
  posts: [
    {
      id: 1,
      title: "Primer Artículo",
      content: "Este es el contenido del primer artículo de ejemplo.",
      author: "Juan Pérez",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "Segundo Artículo",
      content: "Contenido del segundo artículo con información relevante.",
      author: "María González",
      date: "2024-01-16"
    }
  ],
  products: [
    {
      id: 1,
      name: "Producto A",
      description: "Descripción del producto A con características importantes.",
      price: 29.99,
      category: "Electrónicos"
    },
    {
      id: 2,
      name: "Producto B",
      description: "Descripción del producto B con especificaciones técnicas.",
      price: 49.99,
      category: "Hogar"
    }
  ]
};

// Configuración de formularios
const formConfigs = {
  posts: {
    title: 'Agregar Nuevo Artículo',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'content', label: 'Contenido', type: 'textarea', required: true },
      { name: 'author', label: 'Autor', type: 'text', required: true },
      { name: 'date', label: 'Fecha', type: 'date', required: true }
    ]
  },
  products: {
    title: 'Agregar Nuevo Producto',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true },
      { name: 'price', label: 'Precio', type: 'number', required: true },
      { name: 'category', label: 'Categoría', type: 'text', required: true }
    ]
  }
};

// Inicializar la aplicación
function initializeApp() {
  // Cargar datos iniciales si no existen
  if (!localStorage.getItem('posts')) {
    localStorage.setItem('posts', JSON.stringify(sampleData.posts));
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(sampleData.products));
  }

  // Configurar event listeners
  setupEventListeners();
  
  // Cargar contenido inicial
  loadContent(true);
  generateForm();
  
  // Aplicar tema guardado
  applySavedTheme();
}

// Asegurar que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) themeIcon.textContent = '☀️';
  }
}

function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const contentType = this.dataset.contentType;
      switchTab(contentType);
    });
  });

  // Tema
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Formulario
  const dynamicForm = document.getElementById('dynamic-form');
  if (dynamicForm) {
    dynamicForm.addEventListener('submit', handleFormSubmit);
  }

  // Local Storage
  const saveStorageBtn = document.getElementById('save-storage');
  if (saveStorageBtn) saveStorageBtn.addEventListener('click', saveToStorage);
  
  const getStorageBtn = document.getElementById('get-storage');
  if (getStorageBtn) getStorageBtn.addEventListener('click', getFromStorage);
  
  const removeStorageBtn = document.getElementById('remove-storage');
  if (removeStorageBtn) removeStorageBtn.addEventListener('click', removeFromStorage);
  
  const clearStorageBtn = document.getElementById('clear-storage');
  if (clearStorageBtn) clearStorageBtn.addEventListener('click', clearStorage);

  // Juego
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

  // Botón cerrar juego
  const closeGameBtn = document.getElementById('close-game-btn');
  if (closeGameBtn) {
    closeGameBtn.addEventListener('click', closeGame);
  }

  // Botón reintentar juego
  const retryGameBtn = document.getElementById('retry-game-btn');
  if (retryGameBtn) {
    retryGameBtn.addEventListener('click', retryGame);
  }

  // Iframe del juego
  const gameIframe = document.getElementById('game-iframe');
  if (gameIframe) {
    gameIframe.addEventListener('load', handleGameLoad);
    gameIframe.addEventListener('error', handleGameError);
  }
}

function switchTab(contentType) {
  currentContentType = contentType;
  editingId = null;
  
  // Actualizar botones activos
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.contentType === contentType) {
      btn.classList.add('active');
    }
  });
  
  // Cargar contenido y regenerar formulario
  loadContent();
  generateForm();
  
  // Forzar scroll al inicio
  window.scrollTo(0, 0);
}

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
        <h3>No hay ${currentContentType === 'posts' ? 'artículos' : 'productos'} disponibles</h3>
        <p>Agrega el primer ${currentContentType === 'posts' ? 'artículo' : 'producto'} usando el formulario de abajo.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = data.map(item => createContentItem(item)).join('');
  void container.offsetHeight;
}

function createContentItem(item) {
  if (currentContentType === 'posts') {
    return `
      <div class="content-item">
        <h3>${item.title}</h3>
        <p><strong>Autor:</strong> ${item.author}</p>
        <p><strong>Fecha:</strong> ${item.date}</p>
        <p>${item.content}</p>
        <div class="actions">
          <button class="edit-btn" onclick="editItem(${item.id})">Editar</button>
          <button class="delete-btn" onclick="deleteItem(${item.id})">Eliminar</button>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="content-item">
        <h3>${item.name}</h3>
        <p><strong>Categoría:</strong> ${item.category}</p>
        <p><strong>Precio:</strong> $${item.price}</p>
        <p>${item.description}</p>
        <div class="actions">
          <button class="edit-btn" onclick="editItem(${item.id})">Editar</button>
          <button class="delete-btn" onclick="deleteItem(${item.id})">Eliminar</button>
        </div>
      </div>
    `;
  }
}

function generateForm() {
  const formContainer = document.getElementById('dynamic-form');
  const formTitle = document.getElementById('form-title');
  
  if (!formContainer || !formTitle) return;
  
  const config = formConfigs[currentContentType];
  
  formTitle.textContent = editingId ? 
    `Editar ${currentContentType === 'posts' ? 'Artículo' : 'Producto'}` : 
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
      ${editingId ? 'Actualizar' : 'Agregar'} ${currentContentType === 'posts' ? 'Artículo' : 'Producto'}
    </button>
    ${editingId ? '<button type="button" class="edit-btn" onclick="cancelEdit()">Cancelar</button>' : ''}
  `;
  
  if (editingId) {
    fillFormForEdit();
  }
}

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
  
  showStatus('success', `${currentContentType === 'posts' ? 'Artículo' : 'Producto'} ${editingId ? 'actualizado' : 'agregado'} exitosamente`);
}

function editItem(id) {
  editingId = id;
  generateForm();
  const formContainer = document.getElementById('form-container');
  if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingId = null;
  const form = document.getElementById('dynamic-form');
  if (form) form.reset();
  generateForm();
}

function deleteItem(id) {
  if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
    const data = JSON.parse(localStorage.getItem(currentContentType) || '[]');
    const filteredData = data.filter(item => item.id !== id);
    localStorage.setItem(currentContentType, JSON.stringify(filteredData));
    loadContent();
    showStatus('success', `${currentContentType === 'posts' ? 'Artículo' : 'Producto'} eliminado exitosamente`);
  }
}

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

// Funciones de Local Storage
function saveToStorage() {
  const key = document.getElementById('storage-key').value;
  const value = document.getElementById('storage-value').value;
  
  if (!key.trim()) {
    showStorageStatus('error', 'Por favor ingresa una clave');
    return;
  }
  
  try {
    localStorage.setItem(key, value);
    showStorageStatus('success', `Guardado: ${key} = ${value}`);
    document.getElementById('storage-key').value = '';
    document.getElementById('storage-value').value = '';
  } catch (error) {
    showStorageStatus('error', 'Error al guardar: ' + error.message);
  }
}

function getFromStorage() {
  const key = document.getElementById('storage-key').value;
  
  if (!key.trim()) {
    showStorageStatus('error', 'Por favor ingresa una clave');
    return;
  }
  
  const value = localStorage.getItem(key);
  if (value !== null) {
    document.getElementById('storage-value').value = value;
    showStorageStatus('success', `Obtenido: ${key} = ${value}`);
  } else {
    showStorageStatus('error', `No se encontró la clave: ${key}`);
  }
}

function removeFromStorage() {
  const key = document.getElementById('storage-key').value;
  
  if (!key.trim()) {
    showStorageStatus('error', 'Por favor ingresa una clave');
    return;
  }
  
  if (localStorage.getItem(key) !== null) {
    localStorage.removeItem(key);
    showStorageStatus('success', `Eliminado: ${key}`);
    document.getElementById('storage-key').value = '';
    document.getElementById('storage-value').value = '';
  } else {
    showStorageStatus('error', `No se encontró la clave: ${key}`);
  }
}

function clearStorage() {
  if (confirm('¿Estás seguro de que quieres limpiar todo el Local Storage?')) {
    localStorage.clear();
    showStorageStatus('success', 'Local Storage limpiado completamente');
    document.getElementById('storage-key').value = '';
    document.getElementById('storage-value').value = '';
    
    localStorage.setItem('posts', JSON.stringify(sampleData.posts));
    localStorage.setItem('products', JSON.stringify(sampleData.products));
    loadContent();
  }
}

function showStorageStatus(type, message) {
  const output = document.getElementById('storage-output');
  if (!output) return;
  output.innerHTML = `<span class="${type}">${message}</span>`;
  setTimeout(() => {
    if (output) output.innerHTML = '';
  }, 3000);
}

function showStatus(type, message) {
  const statusDiv = document.getElementById('form-status');
  if (!statusDiv) return;
  statusDiv.innerHTML = `<span class="${type}">${message}</span>`;
  setTimeout(() => {
    if (statusDiv) statusDiv.innerHTML = '';
  }, 3000);
}

// Funciones del juego
function openGame() {
  if (isGameOpen) return;
  
  isGameOpen = true;
  const overlay = document.getElementById('game-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    
    // Verificar si el juego carga correctamente
    setTimeout(() => {
      const iframe = document.getElementById('game-iframe');
      if (iframe) {
        try {
          if (iframe.contentDocument === null) {
            handleGameError();
          }
        } catch (error) {
          console.warn('Error al verificar el juego:', error);
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
  console.log('Juego cargado exitosamente');
}

function handleGameError() {
  const errorDiv = document.getElementById('game-error');
  const iframe = document.getElementById('game-iframe');
  
  if (errorDiv && iframe) {
    errorDiv.style.display = 'block';
    iframe.style.display = 'none';
  }
  console.error('Error al cargar el juego');
}

function retryGame() {
  const iframe = document.getElementById('game-iframe');
  const errorDiv = document.getElementById('game-error');
  
  if (iframe && errorDiv) {
    errorDiv.style.display = 'none';
    iframe.style.display = 'block';
    iframe.src = iframe.src; // Recargar el iframe
  }
}

// Hacer funciones accesibles globalmente
window.editItem = editItem;
window.deleteItem = deleteItem;
window.cancelEdit = cancelEdit;
