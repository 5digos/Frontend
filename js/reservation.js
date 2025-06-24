import {
  getVehicles,
  getVehicleCategories,
  getBranches,
  getTransmissionTypes,
} from "./api/index.js";
import {
  getSelectedBranchId,
  setReservationData,
  setReservationForm,
  getReservationForm,
} from "./state.js";
import { loadPage } from "./navigation.js";

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

export async function populateBranchSelect(
  selectIds = ["branchInicio", "branchDestino"],
  selectedBranchId = null
) {
  try {
    const branches = await getBranches();

    for (const id of selectIds) {
      const select = document.getElementById(id);
      if (!select) continue;

      select.innerHTML = "";

      branches.forEach((branch) => {
        const option = document.createElement("option");
        option.value = String(branch.branchOfficeId);
        option.textContent = branch.name;
        select.appendChild(option);
      });

      if (selectedBranchId !== null) {
        select.value = String(selectedBranchId);
      }
    }
  } catch (error) {
    console.error("Error cargando sucursales:", error);
  }
}

export async function populateCategorySelect() {
  const select = document.getElementById("category");
  if (!select) return;

  select.innerHTML = "";

  const anyOption = document.createElement("option");
  anyOption.value = "";
  anyOption.textContent = "Cualquiera";
  anyOption.selected = true;
  select.appendChild(anyOption);

  try {
    const categories = await getVehicleCategories();

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.vehicleCategoryId;
      option.textContent = category.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

export async function populateTransmissionTypeSelect() {
  const select = document.getElementById("transmission");
  if (!select) return;

  select.innerHTML = "";

  const anyOption = document.createElement("option");
  anyOption.value = "";
  anyOption.textContent = "Cualquiera";
  anyOption.selected = true;
  select.appendChild(anyOption);

  try {
    const transmissionTypes = await getTransmissionTypes();

    transmissionTypes.forEach((transmission) => {
      const option = document.createElement("option");
      option.value = transmission.id;
      option.textContent = transmission.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando tipos de transmisión:", error);
  }
}

// cards de los autos
export async function renderVehicleCards(
  containerId = "vehicle-cards-container"
) {
  const section = document.getElementById(containerId);
  if (!section) return;

  section.innerHTML = "";

  try {
    const vehicles = await getVehicles();

    vehicles.forEach((vehicle) => {
      const card = document.createElement("div");
      card.className =
        "w-full flex-shrink-0 rounded-xl shadow-md overflow-hidden ";

      card.innerHTML = `
        <a href="#" class="block w-full h-full group rounded-xl overflow-hidden shadow-md">
          <img
            src="${vehicle.imageUrl}"
            onerror="this.onerror=null; this.src='img/img-not-found.jpg';"
            class="w-full h-35 object-cover"
            alt="${vehicle.brand} ${vehicle.model}"
          />
          <div class="p-2 bg-neutral-200 dark:bg-stone-900 text-stone-800 dark:text-neutral-200
                      transition-colors duration-300
                      group-hover:bg-neutral-300 group-hover:dark:bg-stone-950">
            <h3 class="text-lg font-semibold text-red-400 text-center">${vehicle.model}</h3>
          </div>
        </a>
      `;

      section.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando vehículos:", error);
  }
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
    const branchDestino = Number(formData.get("branchDestino"));
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

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) {
      el.value = value;
    }
  };

  if (!state || Object.keys(state).length === 0) {
    const now = new Date();

    const rounded = new Date(now);
    rounded.setHours(now.getHours() + 1, 0, 0, 0);

    const fechaInicio = rounded.toISOString().split("T")[0];
    const horaInicio = `${rounded.getHours().toString().padStart(2, "0")}:00`;

    const devolucionDate = new Date(rounded);
    devolucionDate.setDate(devolucionDate.getDate() + 1);
    const fechaDevolucion = devolucionDate.toISOString().split("T")[0];

    setValue("fechaInicio", fechaInicio);
    setValue("horaInicio", horaInicio);
    setValue("fechaDevolucion", fechaDevolucion);
    setValue("horaDevolucion", horaInicio);
    return;
  }

  setValue("branchInicio", state.branchInicio);
  setValue("fechaInicio", state.fechaInicio);
  setValue("horaInicio", state.horaInicio);
  setValue("fechaDevolucion", state.fechaDevolucion);
  setValue("horaDevolucion", state.horaDevolucion);
  setValue("branchDestino", state.branchDestino);
  setValue("category", state.category);
  setValue("transmission", state.transmission);
  setValue("seatingCapacity", state.seatingCapacity);
  setValue("maxPrice", state.maxPrice);
}

// combinar fecha y hora en un objeto Date
function combineDateTime(date, hour) {
  return new Date(`${date}T${hour}`);
}
