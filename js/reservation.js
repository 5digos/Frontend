import {
  getVehicles,
  getVehicleCategories,
  getBranches,
  getTransmissionTypes,
} from "./api/index.js";
import { getAvailableVehicles } from "./api/reservation.js";
import {
  getSelectedBranchId,
  setReservationData,
  setReservationForm,
  getReservationForm,
  getReservationData
} from "./state.js";
import { loadPage } from "./navigation.js";
import { hideSpinner, showSpinner } from "./components/spinners.js";

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
      option.value = category.id;
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

// // cards de los autos
// export async function renderVehicleCards(
//   containerId = "vehicle-cards-container"
// ) {
//   const section = document.getElementById(containerId);
//   if (!section) return;

//   section.innerHTML = "";

//   try {
//     const vehicles = await getVehicles();

//     vehicles.forEach((vehicle) => {
//       const card = document.createElement("div");
//       card.className =
//         "w-full flex-shrink-0 rounded-xl shadow-md overflow-hidden ";

//       card.innerHTML = `
//         <a href="#" class="block w-full h-full group rounded-xl overflow-hidden shadow-md">
//           <img
//             src="${vehicle.imageUrl}"
//             onerror="this.onerror=null; this.src='img/img-not-found.jpg';"
//             class="w-full h-35 object-cover"
//             alt="${vehicle.brand} ${vehicle.model}"
//           />
//           <div class="p-2 bg-neutral-200 dark:bg-stone-900 text-stone-800 dark:text-neutral-200
//                       transition-colors duration-300
//                       group-hover:bg-neutral-300 group-hover:dark:bg-stone-950">
//             <h3 class="text-lg font-semibold text-red-400 text-center">${vehicle.model}</h3>
//           </div>
//         </a>
//       `;

//       section.appendChild(card);
//     });
//   } catch (error) {
//     console.error("Error cargando vehículos:", error);
//   }
// }

export async function renderVehicleCards(
  containerId = "vehicle-cards-container"
) {
  showSpinner();
  const section = document.getElementById(containerId);
  if (!section) return;

  section.innerHTML = "";

  try {
    // Obtener datos obligatorios de estado
    const data = getReservationData();
    if (!data || !data.fechaHoraInicio) {
      console.warn('Sin datos de filtros, redirigiendo a formulario');
      loadPage('reservation');
      return;
    }
    // Obtener filtros opcionales de estado
    const form = getReservationForm();
    const filters = {
      pickupBranchOfficeId: data.branchInicio,
      dropOffBranchOfficeId: data.branchDestino,
      startTime: data.fechaHoraInicio.toISOString(),
      endTime: data.fechaHoraDevolucion.toISOString(),
      // añade opcionales solo si tienen valor
      ...(form.category && { category: form.category }),
      ...(form.seatingCapacity && { seatingCapacity: form.seatingCapacity }),
      ...(form.transmission && { transmissionType: form.transmission }),
      ...(form.maxPrice && { maxPrice: form.maxPrice }),
    };

    const vehicles = await getAvailableVehicles(filters);
    if (!Array.isArray(vehicles)) {   
         throw new Error('La respuesta del servidor no es válida.');           
    }
    if (vehicles.length === 0) {
      if (section) {
        section.innerHTML = `
          <div class="w-full text-center p-6">
            <h2 class="text-2xl font-bold text-gray-700">No hay vehículos disponibles</h2>
            <p class="text-gray-500">Intenta ajustar tus filtros o vuelve más tarde.</p>
          </div>
        `;
      }
      hideSpinner();
      return;
    }

    vehicles.forEach((vehicle) => {
      const card = document.createElement("div");
      card.className = "w-full max-w-sm mx-auto overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-bg rounded-lg";

      // Tarjeta según diseño
      card.innerHTML = `
        <div class="relative">
          <div class="aspect-[4/3] relative overflow-hidden">
            <img src="${vehicle.imageUrl}" onerror="this.onerror=null; this.src='img/img-not-found.jpg';" alt="${vehicle.brand} ${vehicle.model}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
          </div>
          <div class="absolute top-3 right-3">
            <span class="inline-flex items-center rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">${vehicle.category}</span>
          </div>
        </div>
        <div class="p-4 space-y-3">
          <div class="space-y-1">
            <h3 class="font-bold text-lg text-white leading-tight">${vehicle.brand} ${vehicle.model}</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold text-white">$${Number(vehicle.price).toLocaleString()}</span>
              <span class="text-sm text-gray-300 font-medium">/hora</span>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm text-gray-300">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>${vehicle.seatingCapacity} asientos</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>${vehicle.transmissionType}</span>
            </div>
          </div>
          <button onclick="reservarVehiculo('${vehicle.id}')" class="w-full btn-reservar text-white font-semibold py-2.5 rounded-lg transition-all duration-200">Reservar</button>
        </div>
      `;
      section.appendChild(card);
    });
    hideSpinner();
  } catch (error) {
    console.error("Error cargando vehículos:", error);
    hideSpinner();
  }
}

// formulario de reserva
export function setupReservationFormHandler() {
  const form = document.getElementById("reservation-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const branchInicio = Number(formData.get("branchInicio"));
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

// // función global para reservar
// export function reservarVehiculo(vehicleId) {
//   console.log('Reservando vehículo:', vehicleId);
//   alert('Vehículo reservado: ' + vehicleId);
// }
// // Exponer en window para onclick inline
// window.reservarVehiculo = reservarVehiculo;
