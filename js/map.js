import { loadPage } from "./navigation.js";
import { setSelectedBranchId } from "./state.js";

const apiBaseUrl = "https://localhost:7053"; // api

let map = null;
let branches = [];
let vehiclesPerBranch = {};
let branch = null;
let mapInitialized = false;

// función para obtener las sucursales
async function fetchBranches() {
  const res = await fetch(`${apiBaseUrl}/api/v1/BranchOffice`);
  return await res.json();
}

// función para obtener los vehículos (todavia no esta)
async function fetchVehicles() {
  const res = await fetch(`${apiBaseUrl}/api/v1/Vehicle`);
  return await res.json();
}

// Inicializar el mapa
export async function initializeMap() {
  if (mapInitialized) return;
  mapInitialized = true;
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.warn("#map element not found");
    return;
  }

  // destruir el mapa anterior si ya existe
  if (map !== null) {
    map.remove();
    document.getElementById("map").innerHTML = ""; // limpio el dom
    map = null;
  }

  mapElement.style.height = "100%";

  // traigo sucursales y vehículos
  branches = await fetchBranches();
  const vehicles = await fetchVehicles();

  // agrupar la cantidad de vehículos por sucursal
  vehiclesPerBranch = {};
  vehicles.forEach((v) => {
    if (v.status.name !== "Disponible") return;
    const branchId = v.branchOffice.branchOfficeId;
    if (!vehiclesPerBranch[branchId]) {
      vehiclesPerBranch[branchId] = 0;
    }
    vehiclesPerBranch[branchId]++;
  });

  console.log("Sucursales cargadas:", branches);
  console.log("Vehículos por sucursal:", vehiclesPerBranch);

  // Crear el mapa
  map = L.map("map", { attributionControl: false }).setView(
    [branches[0].latitude, branches[0].longitude],
    14
  );

  // Capa base
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // icono personalizado
  const customIcon = L.icon({
    iconUrl: "../img/branchLocationIcon.png",
    iconSize: [70, 70],
    iconAnchor: [35, 35],
    popupAnchor: [0, -26],
  });

  // Agregar marcadores de sucursales
  branches.forEach((branch) => {
    const marker = L.marker([branch.latitude, branch.longitude], {
      icon: customIcon,
    })
      .addTo(map)
      .on("click", () => handleBranchSelection(branch.branchOfficeId));
  });
}

// Manejar selección de sucursal
function handleBranchSelection(branchId) {
  const selected = branches.find((b) => b.branchOfficeId === branchId);

  if (!selected) return;

  branch = selected;
  console.log("Sucursal seleccionada: ", branch.name);
  setSelectedBranchId(branchId);

  const infoPanel = document.getElementById("branch-info");
  if (!infoPanel) return;

  // Mostrar panel
  infoPanel.classList.remove("hidden");
  infoPanel.classList.add("flex");

  // Cargar datos
  document.getElementById("branch-name").textContent = branch.name;
  document.getElementById(
    "branch-location"
  ).textContent = `${branch.address}, ${branch.city}`;
  document.getElementById("branch-location-reference").textContent =
    branch.locationReference;

  const available = vehiclesPerBranch[branch.branchOfficeId] || 0;
  document.getElementById(
    "branch-vehicles"
  ).textContent = `${available} Vehículos disponibles`;

  // Botón de seleccionar sucursal
  document.getElementById("branch-select-btn").onclick = () => {
    loadPage("reservation");
  };
}

// Deseleccionar sucursal
export function deselectBranch() {
  const infoPanel = document.getElementById("branch-info");
  if (!infoPanel) return;

  infoPanel.classList.add("hidden");
  infoPanel.classList.remove("flex");

  // Limpiar datos
  document.getElementById("branch-name").textContent = "";
  document.getElementById("branch-location").textContent = "";
  document.getElementById("branch-location-reference").textContent = "";
  document.getElementById("branch-vehicles").textContent = "";

  branch = null;
  setSelectedBranchId(null);
  console.log("Sucursal deseleccionada");
}
