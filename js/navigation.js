import { initializeMap, deselectBranch } from "./map.js";
import {
  populateBranchSelect,
  populateCategorySelect,
  populateTransmissionTypeSelect,
  renderVehicleCards,
  setupReservationFormHandler,
  prefillReservationForm,
} from "./reservation.js";
import { populateHourSelects } from "./reservation.js";
import { getSelectedBranchId } from "./state.js";
import { initScrollToTop } from "./components/scrollToTop.js";
import { handleLogout, initializeAccountPage } from "./account.js";

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
        requestAnimationFrame(() => {
          setupProximaReservaButton();
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

// configurar el botón de próxima reserva
function setupProximaReservaButton() {
  const proximaReservaBtn = document.getElementById("proxima-reserva-btn");
  if (proximaReservaBtn) {
    proximaReservaBtn.addEventListener("click", () => {
      loadSrcPage("proxima-reserva");
    });
  }
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
