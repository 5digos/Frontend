import { vehicles, vehicleCategories, transmissionTypes } from "./seeds.js";
import {
  getSelectedBranchId,
  setReservationData,
  setReservationForm,
  getReservationForm,
} from "./state.js";
import { loadPage } from "./navigation.js";

//sucursales del back
async function fetchBranches() {
  const res = await fetch("https://localhost:7053/api/v1/BranchOffice");
  return await res.json();
}

// horarios de las reservas
const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return `<option value="${h}:00">${h}:00</option>`;
}).join("");

// carga de selects
export function populateHourSelects() {
  const horaInicio = document.getElementById("horaInicio");
  const horaDevolucion = document.getElementById("horaDevolucion");

  if (horaInicio && horaDevolucion) {
    horaInicio.innerHTML = hourOptions;
    horaDevolucion.innerHTML = hourOptions;
  }
}

export async function populateBranchSelect(selectedBranchId = null) {
  const select = document.getElementById("branch");
  if (!select) return;

  select.innerHTML = "";

  try {
    const branches = await fetchBranches();

    branches.forEach((branch) => {
      const option = document.createElement("option");
      option.value = branch.branchOfficeId;
      option.textContent = `${branch.name} (${branch.city})`;
      if (selectedBranchId && branch.branchOfficeId == selectedBranchId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar sucursales:", error);
    select.innerHTML = "<option value=''>Error al cargar sucursales</option>";
  }
}

export function populateCategorySelect() {
  const select = document.getElementById("category");
  if (!select) return;

  select.innerHTML = "";

  const anyOption = document.createElement("option");
  anyOption.value = "";
  anyOption.textContent = "Cualquiera";
  anyOption.selected = true;
  select.appendChild(anyOption);

  vehicleCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.VehicleCategoryId;
    option.textContent = category.Name;
    select.appendChild(option);
  });
}

export function populateTransmissionTypeSelect() {
  const select = document.getElementById("transmission");
  if (!select) return;

  select.innerHTML = "";

  const anyOption = document.createElement("option");
  anyOption.value = "";
  anyOption.textContent = "Cualquiera";
  anyOption.selected = true;
  select.appendChild(anyOption);

  transmissionTypes.forEach((transmission) => {
    const option = document.createElement("option");
    option.value = transmission.Id;
    option.textContent = transmission.Name;
    select.appendChild(option);
  });
}

// cards de los autos
export function renderVehicleCards(containerId = "vehicle-cards-container") {
  const section = document.getElementById(containerId);
  if (!section) return;

  section.innerHTML = "";

  vehicles.forEach((vehicle) => {
    const card = document.createElement("div");
    card.className =
      "w-full flex-shrink-0 rounded-xl shadow-md overflow-hidden ";

    card.innerHTML = `
      <a href="#" class="block w-full h-full group rounded-xl overflow-hidden shadow-md">
        <img
          src="${vehicle.ImageUrl}"
          class="w-full h-35 object-cover"
          alt="${vehicle.Brand} ${vehicle.Model}"
        />
        <div class="p-2 bg-neutral-200 dark:bg-stone-900 text-stone-800 dark:text-neutral-200
                    transition-colors duration-300
                    group-hover:bg-neutral-300 group-hover:dark:bg-stone-950">
          <h3 class="text-lg font-semibold text-red-400 text-center">${vehicle.Model}</h3>
        </div>
      </a>
    `;

    section.appendChild(card);
  });
}

// formulario de reserva
export function setupReservationFormHandler() {
  const form = document.getElementById("reservation-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const branchInicio = getSelectedBranchId();
    const fechaInicio = formData.get("fechaInicio");
    const horaInicio = formData.get("horaInicio");
    const branchDestino = Number(formData.get("branch"));
    const fechaDevolucion = formData.get("fechaDevolucion");
    const horaDevolucion = formData.get("horaDevolucion");

    const fechaHoraInicio = combineDateTime(fechaInicio, horaInicio);
    const fechaHoraDevolucion = combineDateTime(
      fechaDevolucion,
      horaDevolucion
    );

    const category = formData.get("category");
    const transmission = formData.get("transmission");
    const seatingCapacity = formData.get("seatingCapacity");
    const maxPrice = formData.get("maxPrice");

    setReservationData({
      branchInicio,
      branchDestino,
      fechaHoraInicio,
      fechaHoraDevolucion,
    });

    setReservationForm({
      fechaInicio,
      horaInicio,
      fechaDevolucion,
      horaDevolucion,
      branchDestino,
      category,
      transmission,
      seatingCapacity,
      maxPrice,
    });

    loadPage("filtered-vehicles");
  });
}

// cargar formulario de reserva con datos previos
export function prefillReservationForm() {
  const state = getReservationForm();
  if (!state || Object.keys(state).length === 0) return;

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) {
      el.value = value;
    }
  };

  setValue("fechaInicio", state.fechaInicio);
  setValue("horaInicio", state.horaInicio);
  setValue("fechaDevolucion", state.fechaDevolucion);
  setValue("horaDevolucion", state.horaDevolucion);
  setValue("branch", state.branchDestino);
  setValue("category", state.category);
  setValue("transmission", state.transmission);
  setValue("seatingCapacity", state.seatingCapacity);
  setValue("maxPrice", state.maxPrice);
}

// combinar fecha y hora en un objeto Date
function combineDateTime(date, hour) {
  return new Date(`${date}T${hour}`);
}
