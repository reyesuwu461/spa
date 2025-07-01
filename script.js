document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const gameIcon = document.getElementById('game-icon');
  
  // Manejar clic en el icono del juego
  gameIcon.addEventListener('click', () => {
    // Ocultar todas las secciones principales
    document.querySelectorAll('main > section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Crear contenedor del juego si no existe
    let gameContainer = document.getElementById('game-iframe-container');
    if (!gameContainer) {
      gameContainer = document.createElement('div');
      gameContainer.id = 'game-iframe-container';
      gameContainer.style.position = 'fixed';
      gameContainer.style.top = '0';
      gameContainer.style.left = '0';
      gameContainer.style.width = '100%';
      gameContainer.style.height = '100%';
      gameContainer.style.backgroundColor = 'rgba(0,0,0,0.9)';
      gameContainer.style.zIndex = '1000';
      gameContainer.style.display = 'flex';
      gameContainer.style.justifyContent = 'center';
      gameContainer.style.alignItems = 'center';
      
      // Botón para cerrar el juego
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'X';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '20px';
      closeBtn.style.right = '20px';
      closeBtn.style.padding = '10px 15px';
      closeBtn.style.background = '#ff0000';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '5px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.zIndex = '1001';
      closeBtn.addEventListener('click', () => {
        gameContainer.remove();
        document.querySelectorAll('main > section').forEach(section => {
          section.style.display = 'block';
        });
      });
      
      gameContainer.appendChild(closeBtn);
      
      // Iframe para el juego
      const iframe = document.createElement('iframe');
      iframe.src = '/game/index.html';
      iframe.style.width = '80%';
      iframe.style.height = '80%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '10px';
      iframe.style.boxShadow = '0 0 20px rgba(255,0,255,0.5)';
      
      gameContainer.appendChild(iframe);
      document.body.appendChild(gameContainer);
    } else {
      gameContainer.style.display = 'flex';
    }
  });

  // Resto de tu código existente...
});

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '/api/posts'; // Ahora usa el proxy

  async function loadPosts() {
    try {
      const response = await fetch(API_URL);
      const posts = await response.json();
      renderPosts(posts);
    } catch (error) {
      console.error("Error de conexión:", error);
      renderPosts([], true);
    }
  }

  function renderPosts(posts, isError = false) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (isError) {
      container.innerHTML = `
        <div class="post-card">
          <h3>Artículos de ejemplo</h3>
          <p>El servidor no está disponible. Mostrando datos de ejemplo.</p>
          ${getSamplePosts().map(post => `
            <div class="post">
              <h4>${post.title}</h4>
              <p>${post.body}</p>
              <small>Autor: ${post.author}</small>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      posts.forEach(post => {
        container.innerHTML += `
          <div class="post-card">
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <p><small>Autor: ${post.author}</small></p>
          </div>
        `;
      });
    }
  }

  function getSamplePosts() {
    return [
      {
        title: "Ejemplo 1",
        body: "Este es un artículo de ejemplo mientras el servidor se conecta.",
        author: "Sistema"
      },
      {
        title: "Ejemplo 2", 
        body: "Los datos reales se cargarán cuando el servidor esté disponible.",
        author: "Sistema"
      }
    ];
  }

  // Cargar posts al inicio
  loadPosts();

  // Intenta reconectar cada 5 segundos
  setInterval(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(posts => {
        if (posts.length > 0) {
          renderPosts(posts);
        }
      })
      .catch(console.error);
  }, 5000);
});

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const themeSwitch = document.getElementById('switch');
  
  // Cargar preferencia de tema
  const darkMode = localStorage.getItem('darkMode') === 'true';
  themeSwitch.checked = darkMode;
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  // Evento para cambiar tema
  themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', themeSwitch.checked);
  });

  // Función para renderizar posts
  function renderPosts(posts, isExample = false) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (isExample) {
      container.innerHTML = `
        <div class="post-card example-notice">
          <h3>Artículos de ejemplo</h3>
          <p>El servidor no está disponible. Mostrando datos de ejemplo.</p>
        </div>
        ${getSamplePosts().map(post => `
          <div class="post-card">
            <h4>${post.title}</h4>
            <p>${post.body}</p>
            <small>Autor: ${post.author}</small>
          </div>
        `).join('')}
      `;
    } else {
      posts.forEach(post => {
        container.innerHTML += `
          <div class="post-card">
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <p><small>Autor: ${post.author}</small></p>
          </div>
        `;
      });
    }
  }

  function getSamplePosts() {
    return [
      {
        title: "Ejemplo 1",
        body: "Este es un artículo de ejemplo mientras el servidor se conecta.",
        author: "Sistema"
      },
      {
        title: "Ejemplo 2", 
        body: "Los datos reales se cargarán cuando el servidor esté disponible.",
        author: "Sistema"
      }
    ];
  }

  // Cargar posts al inicio
  loadPosts();

  async function loadPosts() {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Error en la respuesta');
      const posts = await response.json();
      renderPosts(posts);
    } catch (error) {
      console.log("Mostrando datos de ejemplo:", error);
      renderPosts([], true);
    }
  }
});