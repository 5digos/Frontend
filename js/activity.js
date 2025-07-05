import { reservaTemplate } from "./components/reservaTemplate.js";
import { reservaTemplateProxima } from "./components/reservaTemplateProxima.js";
import { reservaTemplateHistorial } from "./components/reservaTemplateHistorial.js";
import {
  getUserReservations,
  returnReservation,
  pickupReservation,
  getReservationById,
  confirmReservation as apiConfirmReservation,
    cancelReservation as apiCancelReservation,
    getReservationSummaryForPayment,
    postCreatePaymentFromReservation,
    getPaymentByReservationId
} from "./api/reservation.js";
import { getVehicleById, getBranchOfficeById } from "./api/information.js";
import { hideSpinner, showSpinner } from "./components/spinners.js";

export async function initializeActivityPage() {
  try {
    showSpinner();
    await loadActiveReservation();
    await loadProximaReserva();
    await loadReservationHistory();
    hideSpinner();
  } catch (error) {
    console.error("Error inicializando ActivityPage:", error);
    hideSpinner();
  }
}

// helpers reutilizados
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-AR");
}
function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function toggleAccordion(id, prefix = "") {
  const getId = (name) => (prefix ? `${prefix}-${name}` : name);

  const content = document.getElementById(getId(`${id}-content`));
  const arrow = document.getElementById(getId(`${id}-arrow`));

  if (!content || !arrow) {
    console.warn(
      `No se encontraron elementos para toggleAccordion: ${getId(
        id
      )}-content o -arrow`
    );
    return;
  }

  content.classList.toggle("active");
  arrow.classList.toggle("rotated");
}

async function loadActiveReservation() {
  let containerActive = document.getElementById("active-content");
  if (!containerActive) {
    return;
  }
  
  containerActive.classList.add("active");
  const activeArrow = document.getElementById("active-arrow");
  if (activeArrow) activeArrow.classList.add("rotated");
  containerActive.innerHTML = "";
  containerActive.innerHTML = `<p class="p-4 text-gray-400 text-sm italic text-center">Cargando reserva activa...</p>`;

  const p = (id) => `#active-${id}`;

  try {
    const { items: allReservations } = await getUserReservations();
    if (!allReservations || allReservations.length === 0) {
      containerActive.innerHTML = `<p class='p-4 text-gray-400 text-sm italic text-center'>No tienes reservas activas.</p>`;
      return;
    }

    const statusPriority = { Confirmed: 1, InProgress: 2, Completed: 3 };
    const sorted = allReservations
      .filter((r) =>
        ["Confirmed", "InProgress", "Completed"].includes(r.status)
      )
      .sort((a, b) => statusPriority[b.status] - statusPriority[a.status]);

    const active = sorted[0];
    if (!active || active.status === "Pending") {
      containerActive.innerHTML = `<p class="p-4 text-gray-400 text-sm italic text-center">No hay reservas activas.</p>`;
      return;
    }

    containerActive.innerHTML = reservaTemplate("active");

    await new Promise((resolve) => setTimeout(resolve, 100));

    const [resDetail, vehicleDetail] = await Promise.all([
      getReservationById(active.reservationId),
      getVehicleById(active.vehicleId),
    ]);

    containerActive.querySelector(`${p("vehicle-image")}`).src = vehicleDetail.vehicle.imageUrl;

    containerActive.querySelector(`${p("vehicle-title")} span`).textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model} ${vehicleDetail.vehicle.year}`;
    containerActive.querySelector(p("vehicle-brand-model")).textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
    containerActive.querySelector(p("vehicle-year")).textContent =vehicleDetail.vehicle.year;
    containerActive.querySelector(p("vehicle-plate")).textContent =vehicleDetail.vehicle.licensePlate;
    containerActive.querySelector(p("vehicle-price")).textContent = `$${vehicleDetail.vehicle.price}`;
    containerActive.querySelector(p("vehicle-seats")).textContent =vehicleDetail.vehicle.seatingCapacity;
    containerActive.querySelector(p("vehicle-transmission")).textContent =vehicleDetail.vehicle.transmissionType.name;
    containerActive.querySelector(p("vehicle-category")).textContent =vehicleDetail.vehicle.category.name;

    const docsContainer = containerActive.querySelector(p("documents-container"));
    docsContainer.innerHTML = "";
    vehicleDetail.documents.forEach((doc) => {
      const div = document.createElement("div");
      div.className =
        "flex items-center justify-between p-2 document-item rounded-lg transition-colors";
      div.innerHTML = `
                <span class="text-sm text-gray-200">${doc.docType.toUpperCase()}</span>
                <button class="download-btn p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </button>`;
      docsContainer.appendChild(div);
      const btn = div.querySelector(".download-btn");
      btn.addEventListener("click", () => downloadDocument(doc.url, doc.docType));
    });

    containerActive.querySelector(p("pickup-office-name")).textContent = resDetail.pickupBranchOfficeName;
    containerActive.querySelector(p("dropoff-office-name")).textContent = resDetail.dropOffBranchOfficeName;

    const [pickupInfo, dropoffInfo] = await Promise.all([
      getBranchOfficeById(resDetail.pickupBranchOfficeId),
      getBranchOfficeById(resDetail.dropOffBranchOfficeId),
    ]);

    const pickupDetails = containerActive.querySelector(p("pickup-office-details"));
    pickupDetails.classList.remove("hidden");
    pickupDetails.querySelector(p("pickup-office-address")).textContent = `${pickupInfo.address}, ${pickupInfo.city}`;
    pickupDetails.querySelector(p("pickup-office-phone")).textContent = pickupInfo.phone;
    pickupDetails.querySelector(p("pickup-office-reference")).textContent = pickupInfo.locationReference;

    const dropoffDetails = containerActive.querySelector(p("dropoff-office-details"));
    dropoffDetails.classList.remove("hidden");
    dropoffDetails.querySelector(p("dropoff-office-address")).textContent = `${dropoffInfo.address}, ${dropoffInfo.city}`;
    dropoffDetails.querySelector(p("dropoff-office-phone")).textContent = dropoffInfo.phone;
    dropoffDetails.querySelector(p("dropoff-office-reference")).textContent = dropoffInfo.locationReference;

    containerActive.querySelector(p("res-date-start")).textContent = formatDate(resDetail.startTime);
    containerActive.querySelector(p("res-time-start")).textContent = formatTime(resDetail.startTime);
    containerActive.querySelector(p("res-date-end")).textContent = formatDate(resDetail.endTime);
    containerActive.querySelector(p("res-time-end")).textContent = formatTime(resDetail.endTime);

    containerActive.querySelector(p("res-date-real-start")).textContent = resDetail.actualPickupTime ? formatDate(resDetail.actualPickupTime) : "-";
    containerActive.querySelector(p("res-time-real-start")).textContent = resDetail.actualPickupTime ? formatTime(resDetail.actualPickupTime) : "-";
    containerActive.querySelector(p("res-date-real-end")).textContent = resDetail.actualReturnTime ? formatDate(resDetail.actualReturnTime) : "-";
    containerActive.querySelector(p("res-time-real-end")).textContent = resDetail.actualReturnTime ? formatTime(resDetail.actualReturnTime) : "-";

    const containerButtons = containerActive.querySelector(p("buttons"));
    containerButtons.innerHTML = "";

    if (active.status === "Confirmed") {
      showConfirmationMessage();

      containerButtons.innerHTML = `
                    <div class=" space-y-4">
                       <button id="open-vehicle-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2">
                          <span class="material-icons">nfc</span>
                          Abrir Vehículo (NFC)
                       </button>
                    </div>`;
      const openBtn = containerButtons.querySelector("#open-vehicle-btn");
      if (openBtn) {
        openBtn.addEventListener("click", async () => {
          try {
            openBtn.disabled = true;
            openBtn.innerHTML = `<div class="spinner w-5 h-5 border-2 border-white border-t-transparent"></div> Retirando...`;

            const updated = await pickupReservation(resDetail.reservationId);

            containerActive.querySelector(
              p("res-date-real-start")
            ).textContent = formatDate(updated.actualPickupTime);
            containerActive.querySelector(
              p("res-time-real-start")
            ).textContent = formatTime(updated.actualPickupTime);

            openBtn.innerHTML = `<span class="material-icons">lock_open</span> Vehículo retirado`;
            openBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
            openBtn.classList.add(
              "bg-gray-600",
              "cursor-not-allowed",
              "pointer-events-none"
            );
            showSpinner();
            setTimeout(() => {
              refreshReservaActiva();
            }, 1000);
          } catch (error) {
            console.error("Error retirando vehículo:", err);
            alert("Error al retirar el vehículo: " + err.message);
            openBtn.disabled = false;
            openBtn.innerHTML = `<span class="material-icons">nfc</span> Abrir Vehículo (NFC)`;
          }
        });
      }
      }

    if (active.status === "InProgress") {
      showRetiredVehicleMessage();

      containerButtons.innerHTML = `
                <div class=" space-y-4">
                   <button id="return-vehicle-btn" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 mt-4">
                      <span class="material-icons">keyboard_return</span>
                      Devolver vehículo
                   </button>
                </div>`;
      const returnBtn = containerButtons.querySelector("#return-vehicle-btn");
      if (returnBtn) {
        returnBtn.addEventListener("click", async () => {
          try {
            returnBtn.disabled = true;
            returnBtn.innerHTML = `<div class="spinner w-5 h-5 border-2 border-white border-t-transparent"></div> Devolviendo...`;

            const updated = await returnReservation(resDetail.reservationId);
            containerActive.querySelector(p("res-date-real-end")).textContent =
              formatDate(updated.actualReturnTime);
            containerActive.querySelector(p("res-time-real-end")).textContent =
              formatTime(updated.actualReturnTime);
            returnBtn.innerHTML = `<span class="material-icons">lock_open</span> Vehículo devuelto`;
            returnBtn.classList.remove("bg-orange-600", "hover:bg-orange-700");
            returnBtn.classList.add(
              "bg-gray-600",
              "cursor-not-allowed",
              "pointer-events-none"
            );

            showSpinner();
            setTimeout(() => {
              refreshReservaActiva();
              refreshHistorialReservas();
            }, 1000);
          } catch (err) {
            console.error("Error devolviendo vehículo:", err);
            alert("Error al devolver el vehículo: " + err.message);
            returnBtn.disabled = false;
            returnBtn.innerHTML = `<span class="material-icons">keyboard_return</span> Devolver Vehículo`;
          }
          //handleOpenVehicle(resDetail, openBtn);
        });
      }
      }

    if (active.status === "Completed") {
      showReturnedVehicleMessage();

      containerButtons.innerHTML = `
                <div class=" space-y-4">
                   <button id="go-to-payment-btn" class="w-full bg-green-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2">
                      <span class="material-icons">payment</span>
                      Ir a Pagar
                   </button>
                </div>`;
      const payBtn = containerButtons.querySelector("#go-to-payment-btn");
      if (payBtn) {
          payBtn.addEventListener("click", async () =>  {
              try
              {

                  payBtn.disabled = true;
                  payBtn.innerHTML = `<div class="spinner  w-5 h-5 border-2 border-white border-t-transparent"></div> Procediendo a pagar...`;
                  const paidInfo = await getReservationSummaryForPayment(resDetail.reservationId);
                  const createdPayment = await postCreatePaymentFromReservation(paidInfo);
                  const urlMp = createdPayment.checkoutUrl;
                  // Redirigir en la misma pestaña para que MercadoPago pueda volver correctamente
                  window.location.href = urlMp;

                  hideSpinner();
                  setTimeout(() => {
                  }, 1000);
          } catch (error) {
                  hideSpinner();
                console.error("Error al pagar la reserva:", error);
                payBtn.disabled = false;
                payBtn.innerHTML = `<span class="material-icons">payment</span> Ir a Pagar`;
          }
        });
      }
    }
  } catch (error) {
    console.error("Error cargando reserva activa:", error);
  }
}

async function loadProximaReserva() {
  let containerProxima = document.getElementById("proxima-content");
  if (!containerProxima) {
    const proximaButton = document.querySelector('button[onclick="toggleAccordion(\'proxima\')"]');
    if (proximaButton && proximaButton.parentElement) {
      containerProxima = document.createElement('div');
      containerProxima.id = 'proxima-content';
      containerProxima.className = 'accordion-content';
      proximaButton.parentElement.appendChild(containerProxima);
    } else {
      return;
    }
  }
  
  containerProxima.classList.add("active");
  const arrow = document.getElementById("proxima-arrow");
  if (arrow) arrow.classList.add("rotated");
  containerProxima.innerHTML = "";
  containerProxima.innerHTML = `<p class="p-4 text-gray-400 text-sm italic text-center">Cargando próxima reserva...</p>`;

  try {
    const { items: pendings } = await getUserReservations({
      status: "Pending",
    });
    if (!pendings || pendings.length === 0) {
      containerProxima.innerHTML = `<p class="p-4 text-gray-400 text-sm italic text-center">No hay próxima reserva. Cree una.</p>`;
      return;
    }
    const pendingSorted = pendings.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );
    const next = pendingSorted[0];

    containerProxima.innerHTML = reservaTemplateProxima("proxima");

    const [resDetail, vehicleDetail] = await Promise.all([
      getReservationById(next.reservationId),
      getVehicleById(next.vehicleId),
    ]);

    const p = (id) => `proxima-${id}`;

    // Vehículo
    const imgEl = containerProxima.querySelector(`#${p("vehicle-image")}`);
    const titleEl = containerProxima.querySelector(
      `#${p("vehicle-title")} span`
    );
    imgEl.src = vehicleDetail.vehicle.imageUrl;
    imgEl.alt = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
    titleEl.textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model} ${vehicleDetail.vehicle.year}`;

    containerProxima.querySelector(
      `#${p("vehicle-brand-model")}`
    ).textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
    containerProxima.querySelector(`#${p("vehicle-year")}`).textContent =
      vehicleDetail.vehicle.year;
    containerProxima.querySelector(`#${p("vehicle-plate")}`).textContent =
      vehicleDetail.vehicle.licensePlate;
    containerProxima.querySelector(
      `#${p("vehicle-price")}`
    ).textContent = `$${Number(vehicleDetail.vehicle.price).toLocaleString()}`;
    containerProxima.querySelector(`#${p("vehicle-seats")}`).textContent =
      vehicleDetail.vehicle.seatingCapacity;
    containerProxima.querySelector(
      `#${p("vehicle-transmission")}`
    ).textContent = vehicleDetail.vehicle.transmissionType.name;
    containerProxima.querySelector(`#${p("vehicle-category")}`).textContent =
      vehicleDetail.vehicle.category.name;

    // Documentos
    const docsContainer = containerProxima.querySelector(
      `#${p("documents-container")}`
    );
    docsContainer.innerHTML = ""; // limpio primero
    vehicleDetail.documents.forEach((doc) => {
      const div = document.createElement("div");
      div.className =
        "flex items-center justify-between p-2 document-item rounded-lg transition-colors";
      div.innerHTML = `
                <span class="text-sm text-gray-200">${doc.docType.toUpperCase()}</span>
                <button id="download-${
                  doc.docType
                }" class="download-btn p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </button>`;
      docsContainer.appendChild(div);
      document
        .getElementById(`download-${doc.docType}`)
        .addEventListener("click", () =>
          downloadDocument(doc.url, doc.docType)
        );
    });

    // Datos de reserva
    containerProxima.querySelector(`#${p("pickup-office-name")}`).textContent =
      resDetail.pickupBranchOfficeName;
    containerProxima.querySelector(`#${p("dropoff-office-name")}`).textContent =
      resDetail.dropOffBranchOfficeName;

    const [pickupInfo, dropoffInfo] = await Promise.all([
      getBranchOfficeById(resDetail.pickupBranchOfficeId),
      getBranchOfficeById(resDetail.dropOffBranchOfficeId),
    ]);

    // Detalles sucursal retiro
    containerProxima
      .querySelector(`#${p("pickup-office-details")}`)
      .classList.remove("hidden");
    containerProxima.querySelector(
      `#${p("pickup-office-address")}`
    ).textContent = `${pickupInfo.address}, ${pickupInfo.city}`;
    containerProxima.querySelector(`#${p("pickup-office-phone")}`).textContent =
      pickupInfo.phone;
    containerProxima.querySelector(
      `#${p("pickup-office-reference")}`
    ).textContent = pickupInfo.locationReference;

    // Detalles sucursal devolución
    containerProxima
      .querySelector(`#${p("dropoff-office-details")}`)
      .classList.remove("hidden");
    containerProxima.querySelector(
      `#${p("dropoff-office-address")}`
    ).textContent = `${dropoffInfo.address}, ${dropoffInfo.city}`;
    containerProxima.querySelector(
      `#${p("dropoff-office-phone")}`
    ).textContent = dropoffInfo.phone;
    containerProxima.querySelector(
      `#${p("dropoff-office-reference")}`
    ).textContent = dropoffInfo.locationReference;

    // Horarios programados
    containerProxima.querySelector(`#${p("res-date-start")}`).textContent =
      formatDate(resDetail.startTime);
    containerProxima.querySelector(`#${p("res-time-start")}`).textContent =
      formatTime(resDetail.startTime);
    containerProxima.querySelector(`#${p("res-date-end")}`).textContent =
      formatDate(resDetail.endTime);
    containerProxima.querySelector(`#${p("res-time-end")}`).textContent =
      formatTime(resDetail.endTime);

    // Horarios reales
    containerProxima.querySelector(`#${p("res-date-real-start")}`).textContent =
      resDetail.actualPickupTime ? formatDate(resDetail.actualPickupTime) : "-";
    containerProxima.querySelector(`#${p("res-time-real-start")}`).textContent =
      resDetail.actualPickupTime ? formatTime(resDetail.actualPickupTime) : "-";
    containerProxima.querySelector(`#${p("res-date-real-end")}`).textContent =
      resDetail.actualReturnTime ? formatDate(resDetail.actualReturnTime) : "-";
    containerProxima.querySelector(`#${p("res-time-real-end")}`).textContent =
      resDetail.actualReturnTime ? formatTime(resDetail.actualReturnTime) : "-";

    // Botones
    const containerButtons = containerProxima.querySelector(`#${p("buttons")}`);
    containerButtons.innerHTML = "";

    if (next.status === "Pending") {
      containerButtons.innerHTML = `
            <button id="confirm-btn" class="w-full btn-confirmar text-white font-semibold py-3 rounded-lg">Confirmar Reserva</button>
            <div class="flex justify-center">
                <button id="cancel-btn" class="btn-cancelar text-white font-semibold px-6 py-2 text-sm rounded-lg">Cancelar Reserva</button>
            </div>`;
    }

    const confirmBtn = containerProxima.querySelector("#confirm-btn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        // Mostrar modal de confirmación

        let modal = document.getElementById("modal-confirmar-reserva");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "modal-confirmar-reserva";
          modal.innerHTML = `
                      <div class="modal-overlay" style="position:fixed;z-index:1000;top:0;left:0;width:100vw;height:100vh;background:rgba(20,20,20,0.85);display:flex;align-items:center;justify-content:center;">
                        <div class="modal-content" style="background:var(--bg-main,#18181b);padding:2rem 1.5rem;border-radius:1rem;max-width:90vw;min-width:300px;text-align:center;box-shadow:0 2px 16px #0008;border:1px solid var(--color-red-500,#e53935);">
                         <button id="modal-close-x" style="position:absolute;top:0.75rem;right:0.75rem;background:transparent;border:none;font-size:1.2rem;color:#ccc;cursor:pointer;transition:color 0.2s, transform 0.2s;">✕</button>
                          <h2 style="font-size:1.2rem;font-weight:bold;margin-bottom:1rem;color:var(--color-red-500,#e53935);">¿Proceder a confirmar la reserva?</h2>
                          <div style="display:flex;gap:1rem;justify-content:center;">
                            <button id="modal-reservar-si" class="btn-confirmar text-white font-semibold px-6 py-2 text-sm rounded-lg">Sí</button>
                            <button id="modal-reservar-no" class="btn-cancelar text-white font-semibold px-6 py-2 text-sm rounded-lg">No</button>
                          </div>
                        </div>
                      </div>
                      `;

          document.body.appendChild(modal);
        } else {
          modal.style.display = "flex";
        }
        modal.querySelector("#modal-close-x").onclick = closeModal;
        // Botón No
        modal.querySelector("#modal-reservar-no").onclick = closeModal;
        // Botón Sí
        modal
          .querySelector("#modal-reservar-si")
          .addEventListener("click", async function () {
            modal.querySelector("#modal-reservar-si").disabled = true;
            modal.querySelector("#modal-reservar-si").textContent =
              "Confirmando...";
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Confirmando...";
            try {
              const confirmationData = {
                reservationId: resDetail.reservationId,
                userId: resDetail.userId,
                vehicleId: resDetail.vehicleId,
                pickupBranchOfficeId: resDetail.pickupBranchOfficeId,
                pickupBranchOfficeName: resDetail.pickupBranchOfficeName,
                dropOffBranchOfficeId: resDetail.dropOffBranchOfficeId,
                dropOffBranchOfficeName: resDetail.dropOffBranchOfficeName,
                startTime: resDetail.startTime,
                endTime: resDetail.endTime,
                actualPickupTime: resDetail.actualPickupTime,
                actualReturnTime: resDetail.actualReturnTime,
                hourlyRateSnapshot: resDetail.hourlyRateSnapshot,
                status: "Confirmed",
              };
              await apiConfirmReservation(
                resDetail.reservationId,
                confirmationData
              );
              localStorage.setItem(
                "confirmedReservationId",
                resDetail.reservationId
              );
              hideButtons();
              //showConfirmationMessage();
              showSpinner();
              setTimeout(async () => {
                //await refreshAccordions();
                refreshProximaReserva();
                refreshReservaActiva();
                closeModal();
              }, 1000);
            } catch (error) {
              console.error("Error confirming reservation:", error);
              confirmBtn.disabled = false;
              confirmBtn.textContent = "Confirmar Reserva";
            }
          });
      });
    }
    const cancelBtn = containerProxima.querySelector("#cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", async () => {
        // Mostrar modal de cancelacion
        let modal = document.getElementById("modal-confirmar-reserva");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "modal-confirmar-reserva";
          modal.innerHTML = `
                    <div class="modal-overlay" style="position:fixed;z-index:1000;top:0;left:0;width:100vw;height:100vh;background:rgba(20,20,20,0.85);display:flex;align-items:center;justify-content:center;">
                    <div class="modal-content" style="background:var(--bg-main,#18181b);padding:2rem 1.5rem;border-radius:1rem;max-width:90vw;min-width:300px;text-align:center;box-shadow:0 2px 16px #0008;border:1px solid var(--color-red-500,#e53935);">
                         <button id="modal-close-x" style="position:absolute;top:0.75rem;right:0.75rem;background:transparent;border:none;font-size:1.2rem;color:#ccc;cursor:pointer;transition:color 0.2s, transform 0.2s;">✕</button>
                         <h2 style="font-size:1.2rem;font-weight:bold;margin-bottom:1rem;color:var(--color-red-500,#e53935);">¿Proceder a cancelar la reserva?</h2>
                         <div style="display:flex;gap:1rem;justify-content:center;">
                            <button id="modal-reservar-si" class="btn-confirmar text-white font-semibold px-6 py-2 text-sm rounded-lg">Sí</button>
                            <button id="modal-reservar-no" class="btn-cancelar text-white font-semibold px-6 py-2 text-sm rounded-lg">No</button>
                       </div>
                    </div>
                    </div>
                    `;
          document.body.appendChild(modal);
        } else {
          modal.style.display = "flex";
        }
        modal.querySelector("#modal-close-x").onclick = closeModal;
        // Botón No
        modal.querySelector("#modal-reservar-no").onclick = closeModal;
        // Botón Sí
        modal.querySelector("#modal-reservar-si").onclick = async function () {
          modal.querySelector("#modal-reservar-si").disabled = true;
          modal.querySelector("#modal-reservar-si").textContent =
            "Cancelando...";
          cancelBtn.disabled = true;
          cancelBtn.textContent = "Cancelando...";
          try {
            await apiCancelReservation(resDetail.reservationId);
            hideButtons();
            showSpinner();
            setTimeout(async () => {
              //await refreshAccordions();
              refreshProximaReserva();
              closeModal();
            }, 1000);
          } catch (error) {
            console.error("Error cancelando reserva:", error);
            cancelBtn.disabled = false;
            cancelBtn.textContent = "Cancelar Reserva";
          }
        };
      });
    }
  } catch (err) {
    console.error(err);
    //containerProxima.innerHTML = `<p class="text-red-400 p-4">Error al cargar la reserva: ${err.message}</p>`;
  }
}

async function loadReservationHistory() {
  let containerHistorial = document.getElementById("historial-content");
  if (!containerHistorial) {
    return;
  }
  
  containerHistorial.classList.add("active");
  const arrow = document.getElementById("historial-arrow");
  if (arrow) arrow.classList.add("rotated");
  containerHistorial.innerHTML = "";
  containerHistorial.innerHTML = `<p class="p-4 text-gray-400 text-sm italic text-center">Cargando historial de reservas...</p>`;

  try {
    const { items: paidReservations } = await getUserReservations({
      status: "Paid",
    }); //voy a setearlo a Pending para probar

    if (!paidReservations || paidReservations.length === 0) {
      containerHistorial.innerHTML = `<p class="p-4 text-gray-400 text-sm italic text-center">No hay reservas previas pagadas.</p>`;
      return;
    }
    containerHistorial.innerHTML = "";
    // Filtrar solo las que tienen actualReturnTime definido y ordenar por fecha de devolución real (más reciente primero)
    //const sorted = paidReservations
    //.filter(r => r.actualReturnTime)
    //.sort((a, b) => new Date(b.actualReturnTime) - new Date(a.actualReturnTime));

    for (let i = 0; i < paidReservations.length; i++) {
      const res = paidReservations[i];

      const [resDetail, vehicleDetail] = await Promise.all([
        getReservationById(res.reservationId),
        getVehicleById(res.vehicleId),
      ]);

      const prefix = `historial-${res.reservationId}`;

      // DEBUG EXPRESS: evitar duplicación de cards
      if (document.getElementById(`${prefix}-wrapper`)) {
        console.warn(
          `Ya existe una card para ${res.reservationId}, se evita duplicación`
        );
        continue;
      }
      const wrapper = document.createElement("div");
      wrapper.id = `${prefix}-wrapper`;

      wrapper.classList.add(
        "mb-8",
        "rounded-lg",
        "overflow-hidden",
        "border",
        "border-gray-700"
      );
      wrapper.innerHTML = reservaTemplateHistorial(prefix);
      containerHistorial.appendChild(wrapper);

      const p = (id) => `${prefix}-${id}`;

      // Datos del vehículo
      wrapper.querySelector(`#${p("vehicle-image")}`).src =
        vehicleDetail.vehicle.imageUrl;
      wrapper.querySelector(
        `#${p("vehicle-image")}`
      ).alt = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
      wrapper.querySelector(
        `#${p("vehicle-title")} span`
      ).textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model} ${vehicleDetail.vehicle.year}`;
      wrapper.querySelector(
        `#${p("vehicle-brand-model")}`
      ).textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
      wrapper.querySelector(`#${p("vehicle-year")}`).textContent =
        vehicleDetail.vehicle.year;
      wrapper.querySelector(`#${p("vehicle-plate")}`).textContent =
        vehicleDetail.vehicle.licensePlate;
      wrapper.querySelector(`#${p("vehicle-price")}`).textContent = `$${Number(
        vehicleDetail.vehicle.price
      ).toLocaleString()}`;
      wrapper.querySelector(`#${p("vehicle-seats")}`).textContent =
        vehicleDetail.vehicle.seatingCapacity;
      wrapper.querySelector(`#${p("vehicle-transmission")}`).textContent =
        vehicleDetail.vehicle.transmissionType.name;
      wrapper.querySelector(`#${p("vehicle-category")}`).textContent =
        vehicleDetail.vehicle.category.name;

      // Documentos
      const docsContainer = wrapper.querySelector(
        `#${p("documents-container")}`
      );
      docsContainer.innerHTML = ""; // limpio primero
      vehicleDetail.documents.forEach((doc) => {
        const div = document.createElement("div");
        div.className =
          "flex items-center justify-between p-2 document-item rounded-lg transition-colors";
        div.innerHTML = `
            <span class="text-sm text-gray-200">${doc.docType.toUpperCase()}</span>
            <button id="download-${
              doc.docType
            }" class="download-btn p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            </button>`;
        docsContainer.appendChild(div);
        document
          .getElementById(`download-${doc.docType}`)
          .addEventListener("click", () =>
            downloadDocument(doc.url, doc.docType)
          );
      });
      // Datos de reserva
      wrapper.querySelector(`#${p("pickup-office-name")}`).textContent =
        resDetail.pickupBranchOfficeName;
      wrapper.querySelector(`#${p("dropoff-office-name")}`).textContent =
        resDetail.dropOffBranchOfficeName;

      const [pickupInfo, dropoffInfo] = await Promise.all([
        getBranchOfficeById(resDetail.pickupBranchOfficeId),
        getBranchOfficeById(resDetail.dropOffBranchOfficeId),
      ]);

      // Pickup
      wrapper
        .querySelector(`#${p("pickup-office-details")}`)
        .classList.remove("hidden");
      wrapper.querySelector(
        `#${p("pickup-office-address")}`
      ).textContent = `${pickupInfo.address}, ${pickupInfo.city}`;
      wrapper.querySelector(`#${p("pickup-office-phone")}`).textContent =
        pickupInfo.phone;
      wrapper.querySelector(`#${p("pickup-office-reference")}`).textContent =
        pickupInfo.locationReference;

      // Dropoff
      wrapper
        .querySelector(`#${p("dropoff-office-details")}`)
        .classList.remove("hidden");
      wrapper.querySelector(
        `#${p("dropoff-office-address")}`
      ).textContent = `${dropoffInfo.address}, ${dropoffInfo.city}`;
      wrapper.querySelector(`#${p("dropoff-office-phone")}`).textContent =
        dropoffInfo.phone;
      wrapper.querySelector(`#${p("dropoff-office-reference")}`).textContent =
        dropoffInfo.locationReference;

      // Fechas programadas
      wrapper.querySelector(`#${p("res-date-start")}`).textContent = formatDate(
        resDetail.startTime
      );
      wrapper.querySelector(`#${p("res-time-start")}`).textContent = formatTime(
        resDetail.startTime
      );
      wrapper.querySelector(`#${p("res-date-end")}`).textContent = formatDate(
        resDetail.endTime
      );
      wrapper.querySelector(`#${p("res-time-end")}`).textContent = formatTime(
        resDetail.endTime
      );

      // Fechas reales
      wrapper.querySelector(`#${p("res-date-real-start")}`).textContent =
        resDetail.actualPickupTime
          ? formatDate(resDetail.actualPickupTime)
          : "-";
      wrapper.querySelector(`#${p("res-time-real-start")}`).textContent =
        resDetail.actualPickupTime
          ? formatTime(resDetail.actualPickupTime)
          : "-";
      wrapper.querySelector(`#${p("res-date-real-end")}`).textContent =
        resDetail.actualReturnTime
          ? formatDate(resDetail.actualReturnTime)
          : "-";
      wrapper.querySelector(`#${p("res-time-real-end")}`).textContent =
        resDetail.actualReturnTime
          ? formatTime(resDetail.actualReturnTime)
          : "-";

      
      //wrapper.querySelector(
      //  `#${p("paid-content")}`
        //).innerHTML = `<p class="p-4 text-red-400 text-sm italic text-center">Todavía no hay información de pago.</p>`;

        const paymentInfo = await getPaymentByReservationId(resDetail.reservationId);

        if (paymentInfo) {
            const paidContainer = wrapper.querySelector(`#${p("paid-content")}`);
            paidContainer.innerHTML = `
    <div class="p-4 bg-accordion text-white border border-gray-400 rounded-lg shadow-lg mb-4">
      <!-- <h2 class="text-lg font-bold mb-2 text-green-400">Detalles del Pago</h2> -->
      <p><strong>ID del Pago:</strong> ${paymentInfo.paymentId}</p>
      <p><strong>Fecha:</strong> ${formatDate(paymentInfo.date)} a las ${formatTime(paymentInfo.date)}</p>
      <p><strong>Monto total:</strong> $${Number(paymentInfo.amount).toLocaleString()}</p>
      <p><strong>Método de Pago:</strong> ${paymentInfo.paymentMethodName}</p>
    </div>
  `;
        } else {
            // Esto es opcional, podrías no mostrar nada si no hay pago
            wrapper.querySelector(`#${p("paid-content")}`).innerHTML = `
    <p class="p-4 text-gray-400 text-sm italic text-center">No se encontró información de pago asociada.</p>
  `;
        }

    }
  } catch (error) {
    console.error("Error al cargar historial de reservas:", error);
    containerHistorial.innerHTML = `<p class="p-4 text-red-400 text-sm italic text-center">Hubo un error al cargar el historial.</p>`;
  }
}

window.toggleAccordion = toggleAccordion;

function downloadDocument(url, docType) {
  const container = document.getElementById("documents-container");
  const btn = document.getElementById(`download-${docType}`);
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner border-white"></div>`;
  setTimeout(() => {
    window.open(url, "_blank");
    btn.innerHTML = `<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>`;
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = orig;
    }, 1000);
  }, 500);
}

// Utilidad para esperar elementos que pueden no estar aún en el DOM
export function waitForElement(id, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.getElementById(id);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.getElementById(id);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento con id "${id}" no apareció en el DOM`));
    }, timeout);
  });
}

// Muestra el mensaje de confirmación en el contenedor correcto dentro de proxima-content
function showConfirmationMessage() {
  const container = document.getElementById("active-confirmationMessage");
  if (!container) {
    console.error("No se encontró el contenedor de confirmationMessage");
    return;
  }
  container.innerHTML = "";
  container.innerHTML = `
        <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <span class="material-icons text-green-400 text-3xl mb-2 block">check_circle</span>
            <h2 class="text-green-400 font-semibold text-lg mb-1">¡Reserva Confirmada!</h2>
            <p class="text-gray-300 text-sm">Tu reserva ha sido confirmada exitosamente. Ya puedes retirar tu vehículo.</p>
        </div>`;
}
function showRetiredVehicleMessage() {
  const container = document.getElementById("active-confirmationMessage");
  if (!container) {
    console.error("No se encontró el contenedor de confirmationMessage");
    return;
  }
  container.innerHTML = "";
  container.innerHTML = `
       <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
        <span class="material-icons text-blue-400 text-3xl mb-2 block">nfc</span>
        <h2 class="text-blue-400 font-semibold text-lg mb-1">¡Vehículo Abierto!</h2>
        <p class="text-gray-300 text-sm">Has retirado el vehículo exitosamente. Disfruta tu viaje.</p>
      </div>`;
}
function showReturnedVehicleMessage() {
  const container = document.getElementById("active-confirmationMessage");
  if (!container) {
    console.error("No se encontró el contenedor de confirmationMessage");
    return;
  }
  container.innerHTML = "";
  container.innerHTML = `
        <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
        <span class="material-icons text-green-400 text-3xl mb-2 block">done_all</span>
        <h2 class="text-green-400 font-semibold text-lg mb-1">¡Reserva Completada!</h2>
        <p class="text-gray-300 text-sm">Has devuelto el vehículo exitosamente. Gracias por usar nuestro servicio.</p>
      </div>`;
}
function hideButtons() {
  const confirmBtn = document.getElementById("confirm-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  if (confirmBtn) confirmBtn.classList.add("hidden");
  if (cancelBtn) cancelBtn.classList.add("hidden");
}

async function refreshAccordions() {
  const proximaContent = document.getElementById("proxima-content");
  const activeContent = document.getElementById("active-content");
  const historialContent = document.getElementById("historial-content");

  if (!proximaContent || !activeContent || !historialContent) return;

  try {
    // Volvemos a cargar ambas secciones
    await loadActiveReservation();
    await loadProximaReserva();
    await loadReservationHistory();
    // Expandir el acordeón de reserva activa
    const activeArrow = document.getElementById("active-arrow");
    activeContent.classList.add("active");
    if (activeArrow) activeArrow.classList.add("rotated");
  } catch (error) {
    console.error("Error actualizando acordeones:", error);
    //proximaContent.innerHTML = `<p class="text-red-400 p-4">Error al actualizar.</p>`;
  } finally {
    hideSpinner();
  }
}

async function refreshProximaReserva() {
  const proximaContent = document.getElementById("proxima-content");
  const proximaArrow = document.getElementById("proxima-arrow");
  if (!proximaContent) return;
  showSpinner();
  try {
    await loadProximaReserva();
    proximaContent.classList.add("active");
    if (proximaArrow) proximaArrow.classList.add("rotated");
  } catch (error) {
    console.error("Error al actualizar la próxima reserva:", error);
  } finally {
    hideSpinner();
  }
}

async function refreshReservaActiva() {
  const activeContent = document.getElementById("active-content");
  const activeArrow = document.getElementById("active-arrow");
  if (!activeContent) return;
  showSpinner();
  try {
    await loadActiveReservation();
    // Expandir el acordeón automáticamente
    activeContent.classList.add("active");
    if (activeArrow) activeArrow.classList.add("rotated");
  } catch (error) {
    console.error("Error al actualizar la reserva activa:", error);
  } finally {
    hideSpinner();
  }
}

async function refreshHistorialReservas() {
  const historialContent = document.getElementById("historial-content");
  if (!historialContent) return;
  showSpinner();
  try {
    await loadReservationHistory();
  } catch (error) {
    console.error("Error al actualizar el historial de reservas:", error);
  } finally {
    hideSpinner();
  }
}

async function handleOpenVehicle(reservation) {
  const container = document.getElementById("active-buttons");
  if (!container || document.getElementById("open-vehicle-btn")) return;

  const btn = document.createElement("button");
  btn.id = "open-vehicle-btn";
  btn.className =
    "w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 mt-4";
  btn.innerHTML = `<span class="material-icons">keyboard_return</span> Devolver Vehículo`;

  const containerMessage = document.getElementById(
    "active-confirmationMessage"
  );
  if (containerMessage)
    containerMessage.innerHTML = `<!-- Mensaje de progreso -->
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
        <span class="material-icons text-blue-400 text-3xl mb-2 block">nfc</span>
        <h2 class="text-blue-400 font-semibold text-lg mb-1">¡Vehículo Abierto!</h2>
        <p class="text-gray-300 text-sm">Has retirado el vehículo exitosamente. Disfruta tu viaje.</p>
      </div>`;

  try {
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner mx-auto w-5 h-5 border-2 border-white border-t-transparent"></div> Abriendo vehículo...`;

    //const now = new Date();
    //const start = new Date(reservation.startTime);
    //const oneHourBefore = new Date(start.getTime() - 60 * 60 * 1000);
    //const oneHourAfter = new Date(start.getTime() + 60 * 60 * 1000);

    //if (now < oneHourBefore || now > oneHourAfter) {
    //    alert(`No se puede abrir el vehículo fuera de la ventana de retiro.\nPermitido desde: ${oneHourBefore.toLocaleTimeString()}\nHasta: ${oneHourAfter.toLocaleTimeString()}`);
    //    btn.disabled = false;
    //    btn.innerHTML = originalContent;
    //    return;
    //}

    const updated = await pickupReservation(reservation.reservationId);

    // Podés guardar la reserva actual globalmente si vas a usarla luego
    window.currentReservation = { ...reservation, ...updated };

    // Actualizá los horarios reales
    document.getElementById("active-res-date-real-start").textContent =
      formatDate(updated.actualPickupTime);
    document.getElementById("active-res-time-real-start").textContent =
      formatTime(updated.actualPickupTime);

    // Desactivá el botón y cambiá su estado
    btn.innerHTML = `<span class="material-icons">lock_open</span> Vehículo abierto`;
    btn.classList.remove("bg-blue-600", "hover:bg-blue-700");
    btn.classList.add(
      "bg-gray-600",
      "cursor-not-allowed",
      "pointer-events-none"
    );
    //btn.classList.add('hidden');

    // Agregá botón de devolución si querés seguir con el flujo
    addReturnVehicleButton(updated);
  } catch (error) {
    console.error("Error al abrir el vehículo:", error);
    alert("Error al abrir el vehículo: " + error.message);
    btn.disabled = false;
    btn.innerHTML = originalContent;
  }
}
function addReturnVehicleButton(reservation) {
  const container = document.getElementById("active-buttons");
  if (!container || document.getElementById("return-vehicle-btn")) return;

  const btn = document.createElement("button");
  btn.id = "return-vehicle-btn";
  btn.className =
    "w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 mt-4";
  btn.innerHTML = `<span class="material-icons">keyboard_return</span> Devolver Vehículo`;

  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner w-5 h-5 border-2 border-white border-t-transparent"></div> Devolviendo...`;

      const updated = await returnReservation(reservation.reservationId);
      document.getElementById("active--res-date-real-end").textContent =
        formatDate(updated.actualReturnTime);
      document.getElementById("active--res-time-real-end").textContent =
        formatTime(updated.actualReturnTime);
      btn.style.display = "none";

      alert("Vehículo devuelto con éxito.");
    } catch (err) {
      console.error("Error devolviendo vehículo:", err);
      alert("Error al devolver el vehículo: " + err.message);
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons">keyboard_return</span> Devolver Vehículo`;
    }
  });

  container.appendChild(btn);
}
function waitForElementInContainer(container, selector, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const el = container.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = container.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(`Elemento "${selector}" no apareció dentro del contenedor`)
      );
    }, timeout);
  });
}
function closeModal() {
  let modal = document.getElementById("modal-confirmar-reserva");
  if (modal) modal.remove();
}
