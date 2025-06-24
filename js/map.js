import { getBranches } from "./api/index.js";
import { loadPage } from "./navigation.js";
import { setSelectedBranchId } from "./state.js";

let map = null;
let branches = [];

// cargar mapa
export async function initializeMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.warn("#map element not found");
    return;
  }

  if (map !== null) {
    map.remove();
    map = null;
  }

  mapElement.style.height = "100%";

  try {
    branches = await getBranches();
    if (branches.length === 0) {
      console.warn("No se encontraron sucursales");
      return;
    }

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
          L.marker([branch.latitude, branch.longitude], {
            icon: customIcon,
          })
            .addTo(map)
            .on("click", () => handleBranchSelection(branch.branchOfficeId));
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
          L.marker([branch.latitude, branch.longitude], {
            icon: customIcon,
          })
            .addTo(map)
            .on("click", () => handleBranchSelection(branch.branchOfficeId));
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

  branch = selected; // actualiza la sucursal seleccionada
  console.log("Sucursal seleccionada: ", branch.name);
  setSelectedBranchId(branchId);

  const infoPanel = document.getElementById("branch-info");
  if (!infoPanel) return;

  // mostrar panel
  infoPanel.classList.remove("hidden");
  infoPanel.classList.add("flex");

  // cargar datos
  document.getElementById("branch-name").textContent = branch.name;
  document.getElementById(
    "branch-location"
  ).textContent = `${branch.address}, ${branch.city}`;
  document.getElementById("branch-location-reference").textContent =
    branch.locationReference;
  document.getElementById(
    "branch-vehicles"
  ).textContent = `${branch.VehiclesAvailable} Vehículos disponibles`;

  // boton de seleccionar sucursal
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

  // resetear datos
  document.getElementById("branch-name").textContent = "";
  document.getElementById("branch-location").textContent = "";
  document.getElementById("branch-location-reference").textContent = "";
  document.getElementById("branch-vehicles").textContent = "";

  branch = null;
  setSelectedBranchId(null);
  console.log("Sucursal deseleccionada");
}
