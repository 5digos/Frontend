import { initializeMap, deselectBranch } from "./map.js";
import {
  populateBranchSelect,
  populateCategorySelect,
  populateTransmissionTypeSelect,
  renderVehicleCards,
  setupReservationFormHandler,
  prefillReservationForm,
  setupMapIcons,
} from "./reservation.js";
import { populateHourSelects } from "./reservation.js";
import { getSelectedBranchId } from "./state.js";
import { initScrollToTop } from "./components/scrollToTop.js";
import { handleLogout, initializeAccountPage } from "./account.js";
import { initializeActivityPage } from "./activity.js";

// cargar paginas
export function loadPage(page) {
  const state = { page };
  localStorage.setItem("lastPage", JSON.stringify(state));

  fetch(`pages/${page}.html`)
    .then((res) => {
      if (!res.ok) {
        console.error(`Error al cargar pages/${page}.html:`, res.status, res.statusText);
        document.getElementById("main").innerHTML = `<div style='color:red'>Error al cargar la página: ${res.status} ${res.statusText}</div>`;
        throw new Error(`No se pudo cargar pages/${page}.html`);
      }
      return res.text();
    })
    .then((html) => {
      document.getElementById("main").innerHTML = html;
      updateNavActiveState(page);

      // Log para depuración: mostrar los IDs importantes después de cargar el HTML
      if (page === "activity") {
        setTimeout(() => {
          console.log("[Depuración] activity-section:", document.getElementById("activity-section"));
          console.log("[Depuración] active-content:", document.getElementById("active-content"));
          console.log("[Depuración] proxima-content:", document.getElementById("proxima-content"));
          console.log("[Depuración] historial-content:", document.getElementById("historial-content"));
        }, 100);
      }

      if (page === "home") {
        requestAnimationFrame(() => {
          initializeMap();
          deselectBranch();

          const deselectBtn = document.getElementById("branch-deselect-btn");
          if (deselectBtn) {
            deselectBtn.addEventListener("click", deselectBranch);
          }
        });
      }
      if (page === "account") {
        initializeAccountPage();
      }
      if (page === "reservation") {
        requestAnimationFrame(() => {
          populateCategorySelect();
          populateHourSelects();
          populateBranchSelect(
            ["branchInicio", "branchDestino"],
            getSelectedBranchId()
          );
          populateTransmissionTypeSelect();
          setupReservationFormHandler();
          prefillReservationForm();
          setupMapIcons();
        });
      }
      if (page === "filtered-vehicles") {
        requestAnimationFrame(() => {
          renderVehicleCards("vehicle-cards-container");
          initScrollToTop({
            btnSelector: "#scrollToTopBtn",
            showAfter: 300,
            scrollDuration: 600,
          });
        });
      }
      if (page === "activity") {
        // Solución robusta que maneja elementos faltantes
        setTimeout(() => {
          console.log("[DEBUG] Iniciando verificación de elementos de activity...");
          
          const mainContainer = document.getElementById("main");
          console.log("Main container:", mainContainer);
          
          const activitySection = document.getElementById("activity-section");
          console.log("Activity section encontrada:", activitySection);
          
          if (activitySection) {
            // Buscar elementos existentes
            let activeContent = document.getElementById("active-content");
            let proximaContent = document.getElementById("proxima-content");
            let historialContent = document.getElementById("historial-content");
            
            console.log("Elementos encontrados inicialmente:");
            console.log("- active-content:", activeContent);
            console.log("- proxima-content:", proximaContent);
            console.log("- historial-content:", historialContent);
            
            // Si faltan elementos, crearlos dinámicamente
            if (!proximaContent) {
              console.warn("⚠️ proxima-content no encontrado, creando dinámicamente...");
              // Buscar el contenedor de próxima reserva
              const proximaButton = activitySection.querySelector('button[onclick="toggleAccordion(\'proxima\')"]');
              if (proximaButton && proximaButton.parentElement) {
                proximaContent = document.createElement('div');
                proximaContent.id = 'proxima-content';
                proximaContent.className = 'accordion-content';
                proximaButton.parentElement.appendChild(proximaContent);
                console.log("✅ proxima-content creado exitosamente");
              }
            }
            
            if (!historialContent) {
              console.warn("⚠️ historial-content no encontrado, creando dinámicamente...");
              // Buscar el contenedor de historial
              const historialButton = activitySection.querySelector('button[onclick="toggleAccordion(\'historial\')"]');
              if (historialButton && historialButton.parentElement) {
                historialContent = document.createElement('div');
                historialContent.id = 'historial-content';
                historialContent.className = 'accordion-content';
                historialButton.parentElement.appendChild(historialContent);
                console.log("✅ historial-content creado exitosamente");
              }
            }
            
            // Verificar nuevamente después de crear elementos
            activeContent = document.getElementById("active-content");
            proximaContent = document.getElementById("proxima-content");
            historialContent = document.getElementById("historial-content");
            
            console.log("Elementos finales:");
            console.log("- active-content:", activeContent);
            console.log("- proxima-content:", proximaContent);
            console.log("- historial-content:", historialContent);
            
            if (activeContent && proximaContent && historialContent) {
              console.log("✅ Todos los elementos verificados - Inicializando activity page");
            } else {
              console.log("⚠️ Algunos elementos aún faltan, pero continuando...");
            }
            
            // Inicializar de todas formas
            initializeActivityPage();
            initScrollToTop({
              btnSelector: "#scrollToTopBtn",
              showAfter: 150,
              scrollDuration: 600,
            });
            
          } else {
            console.error("❌ No se encontró activity-section - HTML no cargado");
          }
        }, 300);
      }
      const cancelBtn = document.getElementById("cancel-reservation-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => loadPage("home"));
      }
      const backToReservationBtn = document.getElementById(
        "back-to-reservation-btn"
      );
      if (backToReservationBtn) {
        backToReservationBtn.addEventListener("click", () =>
          loadPage("reservation")
        );
      }
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
      }
    })
    .catch((err) => {
      document.getElementById("main").innerHTML =
        "<p class='text-red-500'>Error cargando la página.</p>";
    });
}

// cargar paginas desde la carpeta src
export function loadSrcPage(pageName) {
  window.location.href = `src/${pageName}.html`;
}
export function waitForElement(selector, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const interval = 50;
    const maxTries = timeout / interval;
    let tries = 0;

    const checkExist = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
      } else if (tries++ >= maxTries) {
        reject(new Error(`Elemento ${selector} no encontrado en el DOM.`));
      } else {
        setTimeout(checkExist, interval);
      }
    };

    checkExist();
  });
}

// switchear paginas
export function setupNavLinks() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-page]");
    if (target) {
      e.preventDefault();
      const page = target.getAttribute("data-page");
      loadPage(page);
    }
  });
}

// actualizar estado activo del navbar
function updateNavActiveState(activePage) {
  const navLinks = document.querySelectorAll(".page-link");

  navLinks.forEach((link) => {
    link.classList.remove("text-white");
  });

  const activeLink = document.querySelector(`[data-page="${activePage}"]`);
  if (activeLink) {
    activeLink.classList.add("text-white");
  }
}
