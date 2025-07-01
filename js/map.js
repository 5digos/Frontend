import { getBranches } from "./api/index.js";
import { loadPage } from "./navigation.js";
import { setSelectedBranchId } from "./state.js";

let map = null;
let branches = [];
const branchMarkers = {};

// cargar mapa
export async function initializeMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.warn("#map element not found");
    return;
  }

  if (map !== null) {
    map.remove();
    mapElement.innerHTML = "";
    map = null;
  }

  mapElement.style.height = "100%";

  const firstName = getFirstNameFromToken();
  if (firstName) {
    const span = document.getElementById("user-first-name");
    if (span) span.textContent = firstName;
  }

  try {
    branches = await getBranches();
    if (branches.length === 0) {
      console.warn("No se encontraron sucursales");
      return;
    }
    setupAutocomplete(branches);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        map = L.map("map", { attributionControl: false }).setView(
          [latitude, longitude],
          13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([latitude, longitude], {
          interactive: false,
          keyboard: false,
        }).addTo(map);

        const customIcon = L.icon({
          iconUrl: "../img/branchLocationIcon.png",
          iconSize: [70, 70],
          iconAnchor: [35, 35],
          popupAnchor: [0, -26],
        });

        branches.forEach((branch) => {
          const marker = L.marker([branch.latitude, branch.longitude], {
            icon: customIcon,
          })
            .addTo(map)
            .on("click", () => handleBranchSelection(branch.branchOfficeId));

          branchMarkers[branch.branchOfficeId] = marker;
        });
      },
      (error) => {
        console.warn(
          "No se pudo obtener la ubicación del usuario:",
          error.message
        );

        map = L.map("map", { attributionControl: false }).setView(
          [branches[0].latitude, branches[0].longitude],
          13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const customIcon = L.icon({
          iconUrl: "../img/branchLocationIcon.png",
          iconSize: [70, 70],
          iconAnchor: [35, 35],
          popupAnchor: [0, -26],
        });

        branches.forEach((branch) => {
          const marker = L.marker([branch.latitude, branch.longitude], {
            icon: customIcon,
          })
            .addTo(map)
            .on("click", () => handleBranchSelection(branch.branchOfficeId));

          branchMarkers[branch.branchOfficeId] = marker;
        });
      }
    );
  } catch (error) {
    console.error("Error cargando sucursales:", error);
  }
}

// sucursal seleccionada
let branch = null;

// seleccionar sucursal
function handleBranchSelection(branchId) {
  const selected = branches.find((b) => b.branchOfficeId === branchId);
  if (!selected) return;

  branch = selected;
  setSelectedBranchId(branchId);

  map.setView([branch.latitude, branch.longitude], 15);

  // Cambiar iconos
  const defaultIcon = L.icon({
    iconUrl: "../img/branchLocationIcon.png",
    iconSize: [70, 70],
    iconAnchor: [35, 35],
    popupAnchor: [0, -26],
  });

  const selectedIcon = L.icon({
    iconUrl: "../img/branchSelectedLocationIcon.png",
    iconSize: [70, 70],
    iconAnchor: [35, 35],
    popupAnchor: [0, -26],
  });

  Object.entries(branchMarkers).forEach(([id, marker]) => {
    const isSelected = Number(id) === branchId;
    marker.setIcon(isSelected ? selectedIcon : defaultIcon);
  });

  // Actualizar panel
  const infoPanel = document.getElementById("branch-info");
  if (!infoPanel) return;

  const selectDiv = document.getElementById("branch-select");
  if (selectDiv) {
    selectDiv.classList.add("hidden");
  }

  infoPanel.classList.remove("hidden");
  infoPanel.classList.add("flex");

  document.getElementById("branch-name").textContent = branch.name;
  document.getElementById(
    "branch-location"
  ).textContent = `${branch.address}, ${branch.city}`;
  document.getElementById("branch-location-reference").textContent =
    branch.locationReference;

  document.getElementById("branch-select-btn").onclick = () => {
    loadPage("reservation");
  };
}

// deseleccionar sucursal
export function deselectBranch() {
  const infoPanel = document.getElementById("branch-info");
  if (!infoPanel) return;

  infoPanel.classList.add("hidden");
  infoPanel.classList.remove("flex");

  if (branch && branchMarkers[branch.branchOfficeId]) {
    const defaultIcon = L.icon({
      iconUrl: "../img/branchLocationIcon.png",
      iconSize: [70, 70],
      iconAnchor: [35, 35],
      popupAnchor: [0, -26],
    });

    branchMarkers[branch.branchOfficeId].setIcon(defaultIcon);
  }

  // resetear datos
  document.getElementById("branch-name").textContent = "";
  document.getElementById("branch-location").textContent = "";
  document.getElementById("branch-location-reference").textContent = "";

  branch = null;
  setSelectedBranchId(null);
  console.log("Sucursal deseleccionada");

  const selectDiv = document.getElementById("branch-select");
  if (selectDiv) {
    selectDiv.classList.remove("hidden");
  }
}

// cargar branches en el autocomplete
function setupAutocomplete(branches) {
  const input = document.getElementById("branch-search");
  const suggestionsList = document.getElementById("branch-suggestions");
  const selectDiv = document.getElementById("branch-select");
  const infoDiv = document.getElementById("branch-info");

  if (!input || !suggestionsList) return;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase().trim();

    const matches =
      value.length > 1
        ? branches.filter((b) =>
            b.name
              .toLowerCase()
              .replace(/^sucursal\s*/, "")
              .includes(value)
          )
        : [];

    suggestionsList.innerHTML = "";

    if (matches.length > 0) {
      suggestionsList.classList.remove("hidden");
      matches.forEach((branch) => {
        const li = document.createElement("li");
        li.textContent = branch.name;
        li.className =
          "px-4 py-3 hover:bg-stone-700 cursor-pointer transition duration-200";

        li.addEventListener("click", () => {
          handleBranchSelection(branch.branchOfficeId);
          input.value = "";
          suggestionsList.classList.add("hidden");
        });

        suggestionsList.appendChild(li);
      });
    } else {
      suggestionsList.classList.add("hidden");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => suggestionsList.classList.add("hidden"), 100);
  });

  // seleccionar con enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.value.toLowerCase().trim();
      const match = branches.find((b) =>
        b.name
          .toLowerCase()
          .replace(/^sucursal\s*/, "")
          .includes(value)
      );
      if (match) {
        handleBranchSelection(match.branchOfficeId);
        input.value = "";
        suggestionsList.classList.add("hidden");
        selectDiv.classList.add("hidden");
        infoDiv.classList.remove("hidden");
        infoDiv.classList.add("flex");
      }
    }
  });
}

function getFirstNameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.firstName || payload.FirstName || null;
  } catch (e) {
    console.error("Error al decodificar el token:", e);
    return null;
  }
}
