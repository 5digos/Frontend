import { setupAuthTabs } from "./auth-tabs.js";
import { loadPage, setupNavLinks } from "./navigation.js";
import { getAuthenticated } from "./state.js";

document.addEventListener("DOMContentLoaded", async () => {
    await waitForElement("#main");
    await waitForElement("#navbar");

    // --- INICIO: Manejo de parámetros de pago (sin hash) ---
    const urlParams = new URLSearchParams(window.location.search);
    const paymentResult = urlParams.get("payment");
    if (["success", "failed", "pending"].includes(paymentResult)) {
      // Opcional: puedes extraer payment_id y external_reference si los necesitas
      const payment_id = urlParams.get("payment_id");
      const external_reference = urlParams.get("external_reference");
      // Cargar la vista correspondiente
      loadPage(`payment-${paymentResult}`);
      // Limpiar la URL para evitar recargas accidentales con el mismo resultado
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    // --- FIN: Manejo de parámetros de pago ---

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
        
        // Configurar listener para mensajes de pago completado
        setupPaymentMessageListener();
        
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

// Función para configurar listener global de mensajes de pago
function setupPaymentMessageListener() {
    console.log('Configurando listener global para mensajes de pago');
    
    // Listener para postMessage desde la pestaña de pago
    window.addEventListener('message', (event) => {
        console.log('Mensaje recibido en main.js:', event.data);
        
        if (event.data && event.data.type === 'PAYMENT_COMPLETED') {
            console.log('¡Pago completado detectado via postMessage!');
            
            // Guardar en localStorage para que lo detecten otras partes de la app
            localStorage.setItem('completedPayment', JSON.stringify({
                paymentId: event.data.paymentId,
                transactionId: event.data.transactionId,
                status: 'completed',
                timestamp: Date.now()
            }));
            
            // Manejar las diferentes acciones
            if (event.data.action === 'navigate_to_activity') {
                setTimeout(() => {
                    console.log('Navegando a activity desde main.js');
                    loadPage('activity');
                }, 1000);
            } else if (event.data.action === 'navigate_to_home') {
                setTimeout(() => {
                    console.log('Navegando a home desde main.js');
                    loadPage('home');
                }, 1000);
            }
            
            // Mostrar notificación si es posible
            showPaymentNotification();
        }
    });
    
    // También escuchar cambios en localStorage (fallback)
    window.addEventListener('storage', (event) => {
        if (event.key === 'completedPayment' && event.newValue) {
            console.log('Pago completado detectado via storage en main.js:', event.newValue);
            showPaymentNotification();
        }
    });
}

// Función para mostrar notificación de pago completado
function showPaymentNotification() {
    try {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            font-weight: 500;
        `;
        notification.innerHTML = '✅ ¡Pago completado exitosamente!';
        
        document.body.appendChild(notification);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    } catch (error) {
        console.log('No se pudo mostrar la notificación:', error);
    }
}
