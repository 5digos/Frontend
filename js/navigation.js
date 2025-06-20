import { initializeMap, deselectBranch } from "./map.js";
import {
  populateBranchSelect,
  populateCategorySelect,
  populateTransmissionTypeSelect,
  renderVehicleCards,
  setupReservationFormHandler,
  prefillReservationForm,
  populateHourSelects,
} from "./reservation.js";
import { getSelectedBranchId } from "./state.js";

let mapInitialized = false;

// cargar paginas
export function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("main").innerHTML = html;
      updateNavActiveState(page);

      if (page === "home") {
        requestAnimationFrame(async () => {
          if (!mapInitialized) {
            await initializeMap();
            mapInitialized = true;
          }
          deselectBranch();
        });
      }

      if (page === "reservation") {
        requestAnimationFrame(() => {
          populateCategorySelect();
          populateHourSelects();
          populateBranchSelect(getSelectedBranchId());
          populateTransmissionTypeSelect();
          setupReservationFormHandler();
          prefillReservationForm();
        });
      }

      if (page === "filtered-vehicles") {
        requestAnimationFrame(() => {
          renderVehicleCards("vehicle-cards-container");
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
    })
    .catch((err) => {
      document.getElementById("main").innerHTML =
        "<p class='text-red-500'>Error cargando la página.</p>";
    });
}

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

function updateNavActiveState(activePage) {
  const navLinks = document.querySelectorAll(".page-link");
  navLinks.forEach((link) => link.classList.remove("text-white"));

  const activeLink = document.querySelector(`[data-page="${activePage}"]`);
  if (activeLink) {
    activeLink.classList.add("text-white");
  }
}
