import { getBranches } from "../api/information.js";

let selectedBranch = null;
let map = null;

export async function openBranchMapModal(currentBranchId, callback) {
  const modal = document.getElementById("map-modal");
  const mapContainer = document.getElementById("map-modal-map");
  const branchSelect = document.getElementById("branch-selected");

  modal.classList.remove("hidden");

  if (map) {
    map.remove();
    map = null;
  }
  mapContainer.innerHTML = "";

  const branches = await getBranches();

  map = L.map("map-modal-map", { attributionControl: false }).setView(
    [branches[0].latitude, branches[0].longitude],
    13
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const defaultIcon = L.icon({
    iconUrl: "../img/branchLocationIcon.png",
    iconSize: [70, 70],
    iconAnchor: [35, 35],
  });

  const selectedIcon = L.icon({
    iconUrl: "../img/branchSelectedLocationIcon.png",
    iconSize: [70, 70],
    iconAnchor: [35, 35],
  });

  const branchMarkers = {};

  branches.forEach((branch) => {
    const marker = L.marker([branch.latitude, branch.longitude], {
      icon: defaultIcon,
    }).addTo(map);

    branchMarkers[branch.branchOfficeId] = marker;

    marker.on("click", () => {
      // Seleccionar la sucursal
      selectedBranch = branch;
      branchSelect.value = branch.branchOfficeId;

      // Cambiar el ícono de la sucursal seleccionada
      Object.entries(branchMarkers).forEach(([id, marker]) => {
        const isSelected = Number(id) === branch.branchOfficeId;
        marker.setIcon(isSelected ? selectedIcon : defaultIcon);
      });
    });

    if (branch.branchOfficeId === currentBranchId) {
      map.setView([branch.latitude, branch.longitude], 15);
      selectedBranch = branch;
      // Cambiar el ícono si es la sucursal inicial
      marker.setIcon(selectedIcon);
    }
  });

  // select
  branchSelect.innerHTML = "";
  branches.forEach((branch) => {
    const option = document.createElement("option");
    option.value = branch.branchOfficeId;
    option.textContent = branch.name.replace(/^Sucursal\s*/i, "");
    branchSelect.appendChild(option);
  });

  if (currentBranchId) {
    branchSelect.value = currentBranchId;
  }

  branchSelect.onchange = () => {
    const selectedId = Number(branchSelect.value);
    const branch = branches.find((b) => b.branchOfficeId === selectedId);
    if (branch) {
      selectedBranch = branch;
      map.setView([branch.latitude, branch.longitude], 15);

      // Cambiar el ícono de la sucursal seleccionada
      Object.entries(branchMarkers).forEach(([id, marker]) => {
        const isSelected = Number(id) === branch.branchOfficeId;
        marker.setIcon(isSelected ? selectedIcon : defaultIcon);
      });
    }
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        L.marker([latitude, longitude]).addTo(map).openPopup();
      },
      (err) => {
        console.warn("Geolocalización rechazada o fallida:", err.message);
      }
    );
  }

  document.getElementById("map-modal-select").onclick = () => {
    if (selectedBranch) callback(selectedBranch);
    modal.classList.add("hidden");
  };

  document.getElementById("map-modal-close").onclick = () => {
    callback(null);
    modal.classList.add("hidden");
  };
}
