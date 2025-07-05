import { setupAuthTabs } from "./auth-tabs.js";
import { loadPage, setupNavLinks } from "./navigation.js";
import { getAuthenticated } from "./state.js";

document.addEventListener("DOMContentLoaded", async () => {
    await waitForElement("#main");
    await waitForElement("#navbar");

  if (!getAuthenticated()) {
    loadLoginView();
  } else {
    initializeApp();
  }
});

export function loadLoginView() {
  fetch("pages/login.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("main").innerHTML = html;
      setupAuthTabs();
    });
}

export function initializeApp() {
  fetch("components/navbar.html")
    .then((res) => res.text())
    .then((data) => {
        const navbar = document.getElementById("navbar");
        if (!navbar) {
            console.error("No se encontró el contenedor #navbar");
            return;
        }
        navbar.innerHTML = data;
        setupNavLinks();
        
        // Configurar manejo de hash para navegación
        setupHashNavigation();
        
        // Verificar si hay una ruta en el hash al cargar
        const hash = window.location.hash.substring(1); // quitar el #
        console.log('Hash inicial detectado:', hash);
        
        if (hash) {
          console.log('Procesando hash inicial:', hash);
          handleHashRoute(hash);
        } else {
          console.log('Sin hash, cargando página por defecto');
          const lastPage = JSON.parse(localStorage.getItem("lastPage"));
          if (lastPage?.page) {
            loadPage(lastPage.page);
          } else {
            loadPage("home");
          }
        }
    });
}

function setupHashNavigation() {
  console.log('Configurando manejo de hash navigation');
  
  window.addEventListener('hashchange', (event) => {
    console.log('Hash cambió:', {
      oldURL: event.oldURL,
      newURL: event.newURL,
      hash: window.location.hash
    });
    
    const hash = window.location.hash.substring(1);
    if (hash) {
      handleHashRoute(hash);
    }
  });
}

function handleHashRoute(hash) {
  console.log('handleHashRoute llamado con:', hash);
  
  // Separar la ruta de los parámetros si los hay
  const [route, queryString] = hash.split('?');
  
  console.log('Ruta extraída:', route, 'Query string:', queryString);
  
  if (route === 'payment-success') {
    console.log('Navegando a payment-success');
    
    // Para payment-success, necesitamos pasar los parámetros a la página
    if (queryString) {
      // Agregar los parámetros a la URL actual para que la página los pueda leer
      const currentUrl = new URL(window.location);
      currentUrl.search = '?' + queryString;
      window.history.replaceState({}, '', currentUrl);
      console.log('Parámetros agregados a URL:', currentUrl.search);
    }
    loadPage('payment-success');
  } else if (route) {
    // Para otras rutas, simplemente cargar la página
    console.log('Navegando a página:', route);
    loadPage(route);
  } else {
    console.log('Ruta vacía, cargando home');
    loadPage('home');
  }
}

export function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${selector} no apareció en el DOM.`));
        }, timeout);
    });
}
