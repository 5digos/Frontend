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
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("main").innerHTML = html;
      updateNavActiveState(page);

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
        waitForElement("#activity-section").then(() => {
          console.log("Se cargó correctamente activity-section.");
          console.log(
            "active-content:",
            document.getElementById("active-content")
          );
          console.log(
            "proxima-content:",
            document.getElementById("proxima-content")
          );
          console.log(
            "historial-content:",
            document.getElementById("historial-content")
          );

          initializeActivityPage();
        });
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
