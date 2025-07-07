import {
  getVehicles,
  getVehicleCategories,
  getBranches,
  getTransmissionTypes,
} from "./api/index.js";
import { getAvailableVehicles, createReservation } from "./api/reservation.js";
import {
  getSelectedBranchId,
  setReservationData,
  setReservationForm,
  getReservationForm,
  getReservationData,
} from "./state.js";
import { loadPage } from "./navigation.js";
import { hideSpinner, showSpinner } from "./components/spinners.js";
import { showAlert } from "./components/alerts.js";
import { openBranchMapModal } from "./components/branchMapModal.js";

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
        option.textContent = branch.name.replace(/^Sucursal\s*/i, "");
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
    // Obtener filtros desde estado; si no existen, volver a formulario
    const data = getReservationData();
    if (!data || !data.fechaHoraInicio) {
      console.warn("Sin datos de filtros, redirigiendo a formulario");
      loadPage("reservation");
      return;
    }
    const form = getReservationForm();
    
    // Helper para convertir Date a formato ISO local (sin conversión UTC)
    const toLocalISOString = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    
    const filters = {
      pickupBranchOfficeId: data.branchInicio,
      dropOffBranchOfficeId: data.branchDestino,
      startTime: toLocalISOString(parseDateTime(data.fechaHoraInicio)),
      endTime: toLocalISOString(parseDateTime(data.fechaHoraDevolucion)),
      category: form.category,
      seatingCapacity: form.seatingCapacity,
      transmissionType: form.transmission,
      maxPrice: form.maxPrice,
      color: form.color,
      brand: form.brand,
    };
    
    // Debug para verificar que los datos están correctos
    console.log('=== DEBUG FILTROS ===');
    console.log('data.fechaHoraInicio:', data.fechaHoraInicio, typeof data.fechaHoraInicio);
    console.log('data.fechaHoraDevolucion:', data.fechaHoraDevolucion, typeof data.fechaHoraDevolucion);
    console.log('parseDateTime(data.fechaHoraInicio):', parseDateTime(data.fechaHoraInicio));
    console.log('filters.startTime:', filters.startTime);
    console.log('filters.endTime:', filters.endTime);
    console.log('=== FIN DEBUG FILTROS ===');
    const vehicles = await getAvailableVehicles(filters);
    if (!Array.isArray(vehicles)) {
      throw new Error("La respuesta del servidor no es válida.");
    }
    if (vehicles.length === 0) {
      if (section) {
        section.innerHTML = `
          <div class="w-full text-center p-6">
            <h2 class="text-2xl font-bold text-stone-300">No hay vehículos disponibles</h2>
            <p class="text-stone-400">Intenta ajustar tus filtros o vuelve más tarde.</p>
          </div>
        `;
      }
      hideSpinner();
      return;
    }

    vehicles.forEach((vehicle) => {
      const card = document.createElement("div");
      card.className =
        "w-full max-w-sm mx-auto overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 card-bg rounded-lg";

      // Tarjeta según diseño
      card.innerHTML = `
        <div class="relative">
          <div class="aspect-[4/3] relative overflow-hidden">
            <img src="${
              vehicle.imageUrl
            }" onerror="this.onerror=null; this.src='img/img-not-found.jpg';" alt="${
        vehicle.brand
      } ${
        vehicle.model
      }" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
          </div>
          <div class="absolute top-3 right-3">
            <span class="inline-flex items-center rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">${
              vehicle.category
            }</span>
          </div>
        </div>
        <div class="p-4 space-y-3">
          <div class="space-y-1">
            <h3 class="font-bold text-lg text-white leading-tight">${
              vehicle.brand
            } ${vehicle.model}</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold text-white">$${Number(
                vehicle.price
              ).toLocaleString()}</span>
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
          <button onclick="reservarVehiculo('${
            vehicle.id
          }')" class="w-full btn-reservar text-white font-semibold py-2.5 rounded-lg transition-all duration-200">Reservar</button>
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
  // Limpiar datos antiguos con formato incorrecto
  clearOldReservationData();
  
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

    // Validar que todos los campos estén completos
    if (
      !branchInicio ||
      !branchDestino ||
      !fechaInicio ||
      !horaInicio ||
      !fechaDevolucion ||
      !horaDevolucion
    ) {
      showAlert("Por favor completa todos los campos requeridos.", "error");
      return;
    }

    // Validar que la fecha de devolución sea posterior a la de inicio
    if (fechaHoraDevolucion <= fechaHoraInicio) {
      showAlert(
        "La fecha/hora de devolución debe ser posterior a la de inicio.",
        "error"
      );
      return;
    }

    setReservationData({
      branchInicio,
      branchDestino,
      fechaHoraInicio: `${fechaInicio} ${horaInicio}`,
      fechaHoraDevolucion: `${fechaDevolucion} ${horaDevolucion}`,
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

    // Debug temporal - remover después
    console.log("=== DEBUG TEMPORAL ===");
    console.log("INPUTS DEL FORMULARIO:");
    console.log("fechaInicio:", fechaInicio);
    console.log("horaInicio:", horaInicio);
    console.log("fechaDevolucion:", fechaDevolucion);
    console.log("horaDevolucion:", horaDevolucion);
    console.log("STRINGS ALMACENADOS:");
    console.log("Stored fechaHoraInicio:", `${fechaInicio} ${horaInicio}`);
    console.log("Stored fechaHoraDevolucion:", `${fechaDevolucion} ${horaDevolucion}`);
    console.log("DATOS EN LOCALSTORAGE:");
    console.log("reservationData RAW:", localStorage.getItem('reservationData'));
    console.log("reservationForm RAW:", localStorage.getItem('reservationForm'));
    console.log("OBJETOS PARSEADOS:");
    console.log("reservationData:", getReservationData());
    console.log("reservationForm:", getReservationForm());
    console.log("=== FIN DEBUG ===");

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

    const toLocalDateString = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque enero es 0
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const toLocalTimeString = (date) => {
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      return `${hh}:${min}`;
    };

    const fechaInicio = toLocalDateString(rounded);

    const horaInicio = toLocalTimeString(rounded);
    console.log(fechaInicio);
    console.log(horaInicio);

    const devolucionDate = new Date(rounded);
    devolucionDate.setDate(devolucionDate.getDate() + 1);
    const fechaDevolucion = toLocalDateString(devolucionDate);

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

// función helper para convertir string de fecha/hora a Date
function parseDateTime(dateTimeString) {
  // Formato esperado: "2025-01-15 14:00"
  const [datePart, timePart] = dateTimeString.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes);
}

// combinar fecha y hora en un objeto Date (mantener zona horaria local)
function combineDateTime(date, hour) {
  // Parseamos la fecha manteniendo la zona horaria local
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = hour.split(':').map(Number);
  
  // Crear el objeto Date con los componentes locales
  return new Date(year, month - 1, day, hours, minutes);
}

// función global para reservar
export async function reservarVehiculo(vehicleId) {
  try {
    // Verificar autenticación
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para realizar una reserva.");
      loadPage("login");
      return;
    }

    // Obtener datos de la reserva desde el estado
    const reservationData = getReservationData();

    if (
      !reservationData ||
      !reservationData.fechaHoraInicio ||
      !reservationData.fechaHoraDevolucion
    ) {
      alert(
        "Error: No se encontraron datos de la reserva. Por favor, vuelve a realizar la búsqueda."
      );
      loadPage("reservation");
      return;
    }

    // Mostrar modal de confirmación
    let modal = document.getElementById("modal-reservar-vehiculo");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-reservar-vehiculo";
      modal.innerHTML = `
        <div class=\"modal-overlay\" style=\"position:fixed;z-index:1000;top:0;left:0;width:100vw;height:100vh;background:rgba(20,20,20,0.85);display:flex;align-items:center;justify-content:center;\">
          <div class=\"modal-content\" style=\"background:var(--bg-main,#18181b);padding:2rem 1.5rem;border-radius:1rem;max-width:90vw;min-width:300px;text-align:center;box-shadow:0 2px 16px #0008;border:1px solid var(--color-red-500,#e53935);\">
            <h2 style=\"font-size:1.2rem;font-weight:bold;margin-bottom:1rem;color:#fff;\">¿ a crear una nueva reserva?</h2>
            <div style=\"display:flex;gap:1rem;justify-content:center;\">
              <button id=\"modal-reservar-no\" class=\"btn-cancelar text-white font-semibold px-6 py-2 text-sm rounded-lg modal-btn\" style=\"min-width:110px;\">No</button>
              <button id=\"modal-reservar-si\" class=\"btn-confirmar text-white font-semibold px-6 py-2 text-sm rounded-lg modal-btn bg-green-600 hover:bg-green-700\" style=\"min-width:110px;\">Sí</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.style.display = "flex";
    }

    //Cerrar modal
    function closeModal() {
      if (modal) modal.remove();
    }
    // Botón No
    modal.querySelector("#modal-reservar-no").onclick = closeModal;
    // Botón Sí
    modal.querySelector("#modal-reservar-si").onclick = async function () {
      modal.querySelector("#modal-reservar-si").disabled = true;
        modal.querySelector("#modal-reservar-si").textContent = "Creando...";

        const toLocalISOString = (date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const hh = String(date.getHours()).padStart(2, "0");
            const min = String(date.getMinutes()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        };


      // Preparar el cuerpo de la solicitud según el formato exacto del endpoint
      const requestBody = {
        vehicleId: vehicleId,
        pickupBranchOfficeId: reservationData.branchInicio,
        dropOffBranchOfficeId: reservationData.branchDestino,
        startTime: toLocalISOString(parseDateTime(reservationData.fechaHoraInicio)),
        endTime: toLocalISOString(parseDateTime(reservationData.fechaHoraDevolucion)),

      };

      showSpinner();

      const result = await createReservation(requestBody);

      console.log("Reserva creada exitosamente:", result);
      loadPage("activity");
      closeModal();
    };
  } catch (error) {
    hideSpinner();
    console.error("Error al crear la reserva:", error);

    // Manejar errores específicos de autenticación
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      alert("Error de autenticación. Por favor, inicia sesión nuevamente.");
      loadPage("login");
      return;
    }

    // Mostrar mensaje de error específico
    const errorMessage =
      error.message || "Ocurrió un error inesperado al crear la reserva.";
    alert(`Error al crear la reserva: ${errorMessage}`);
  }
}
// Exponer en window para onclick inline
window.reservarVehiculo = reservarVehiculo;

export function setupMapIcons() {
  document.querySelectorAll("i[data-target-select]").forEach((icon) => {
    icon.addEventListener("click", async () => {
      const selectId = icon.getAttribute("data-target-select");
      const select = document.getElementById(selectId);
      const currentBranchId = Number(select?.value) || null;

      openBranchMapModal(currentBranchId, (selectedBranch) => {
        if (selectedBranch) {
          select.value = String(selectedBranch.branchOfficeId);
        }
      });
    });
  });
}

// limpiar datos de reserva antiguos con formato incorrecto
export function clearOldReservationData() {
  console.log('=== LIMPIEZA FORZADA DE LOCALSTORAGE ===');
  
  // Mostrar datos actuales antes de limpiar
  const currentData = localStorage.getItem('reservationData');
  const currentForm = localStorage.getItem('reservationForm');
  console.log('Datos actuales en localStorage:');
  console.log('reservationData:', currentData);
  console.log('reservationForm:', currentForm);
  
  // Limpiar TODOS los datos de reserva para empezar limpio
  localStorage.removeItem('reservationData');
  localStorage.removeItem('reservationForm');
  
  console.log('LocalStorage limpiado completamente');
  console.log('=== FIN LIMPIEZA ===');
}

// Debug: Archivo actualizado a las 23:30 del 3 de julio de 2025 para solucionar desfasaje horario
