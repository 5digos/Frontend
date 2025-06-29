import { getUserReservations, getReservationById, confirmReservation as apiConfirmReservation, cancelReservation as apiCancelReservation } from '../api/reservation.js';
import { getVehicleById, getBranchOfficeById } from '../api/information.js';

// Helpers
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR');
}
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function toggleAccordion(section) {
  const content = document.getElementById(`${section}-content`);
  const arrow = document.getElementById(`${section}-arrow`);
  content.classList.toggle('active');
  arrow.classList.toggle('rotated');
}

function downloadDocument(url, docType) {
  const container = document.getElementById('documents-container');
  const btn = document.getElementById(`download-${docType}`);
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner border-white"></div>`;
  setTimeout(() => {
    window.open(url, '_blank');
    btn.innerHTML = `<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>`;
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = orig;
    }, 1000);
  }, 500);
}

async function loadNextReservation() {
  // Validar que estamos en la vista correcta
  if (!document.getElementById('vehicle-image')) return;
  try {
    // fetch pending
    const { items } = await getUserReservations({ status: 'Pending' });
    if (!items.length) throw new Error('No hay reservas pendientes');
    // sort by startTime
    items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const next = items[0];
    // fetch details
    const [resDetail, vehicleDetail] = await Promise.all([
      getReservationById(next.reservationId),
      getVehicleById(next.vehicleId)
    ]);
    // populate vehicle
    // Imagen y título
    const imgEl = document.getElementById('vehicle-image');
    const titleContainer = document.getElementById('vehicle-title');
    const titleEl = titleContainer?.querySelector('span');
    if (imgEl) {
      imgEl.src = vehicleDetail.vehicle.imageUrl;
      imgEl.alt = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
    }
    if (titleEl) {
      titleEl.textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model} ${vehicleDetail.vehicle.year}`;
    }
    document.getElementById('vehicle-brand-model').textContent = `${vehicleDetail.vehicle.brand} ${vehicleDetail.vehicle.model}`;
    document.getElementById('vehicle-year').textContent = vehicleDetail.vehicle.year;
    document.getElementById('vehicle-plate').textContent = vehicleDetail.vehicle.licensePlate;
    document.getElementById('vehicle-price').textContent = `$${Number(vehicleDetail.vehicle.price).toLocaleString()}`;
    document.getElementById('vehicle-seats').textContent = vehicleDetail.vehicle.seatingCapacity;
    document.getElementById('vehicle-transmission').textContent = vehicleDetail.vehicle.transmissionType.name;
    document.getElementById('vehicle-category').textContent = vehicleDetail.vehicle.category.name;
    // documents
    const docsContainer = document.getElementById('documents-container');
    vehicleDetail.documents.forEach(doc => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-2 document-item rounded-lg transition-colors';
      div.innerHTML = `
        <span class="text-sm text-gray-200">${doc.docType.toUpperCase()}</span>
        <button id="download-${doc.docType}" class="download-btn p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>
      `;
      docsContainer.appendChild(div);
      document.getElementById(`download-${doc.docType}`).addEventListener('click', () => downloadDocument(doc.url, doc.docType));
    });
    // reservation details
    document.getElementById('pickup-office-name').textContent = resDetail.pickupBranchOfficeName;
    document.getElementById('dropoff-office-name').textContent = resDetail.dropOffBranchOfficeName;
    // fetch branch office full details
    const [pickupInfo, dropoffInfo] = await Promise.all([
      getBranchOfficeById(resDetail.pickupBranchOfficeId),
      getBranchOfficeById(resDetail.dropOffBranchOfficeId)
    ]);
    // populate branch details
    const pickupDetails = document.getElementById('pickup-office-details');
    if (pickupDetails) pickupDetails.classList.remove('hidden');
    document.getElementById('pickup-office-address').textContent = `${pickupInfo.address}, ${pickupInfo.city}`;
    document.getElementById('pickup-office-phone').textContent = pickupInfo.phone;
    document.getElementById('pickup-office-reference').textContent = pickupInfo.locationReference;
    const dropoffDetails = document.getElementById('dropoff-office-details');
    if (dropoffDetails) dropoffDetails.classList.remove('hidden');
    document.getElementById('dropoff-office-address').textContent = `${dropoffInfo.address}, ${dropoffInfo.city}`;
    document.getElementById('dropoff-office-phone').textContent = dropoffInfo.phone;
    document.getElementById('dropoff-office-reference').textContent = dropoffInfo.locationReference;
    document.getElementById('res-date-start').textContent = formatDate(resDetail.startTime);
    document.getElementById('res-time-start').textContent = formatTime(resDetail.startTime);
    document.getElementById('res-date-end').textContent = formatDate(resDetail.endTime);
    document.getElementById('res-time-end').textContent = formatTime(resDetail.endTime);
    // actual times
    document.getElementById('res-date-real-start').textContent = resDetail.actualPickupTime
      ? formatDate(resDetail.actualPickupTime)
      : '-';
    document.getElementById('res-time-real-start').textContent = resDetail.actualPickupTime
      ? formatTime(resDetail.actualPickupTime)
      : '-';
    document.getElementById('res-date-real-end').textContent = resDetail.actualReturnTime
      ? formatDate(resDetail.actualReturnTime)
      : '-';
    document.getElementById('res-time-real-end').textContent = resDetail.actualReturnTime
      ? formatTime(resDetail.actualReturnTime)
      : '-';
    // buttons
    document.getElementById('confirm-btn').addEventListener('click', async () => {
      const btn = document.getElementById('confirm-btn');
      btn.disabled = true;
      btn.textContent = 'Confirmando...';
      
      try {
        // Prepare the confirmation data
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
          status: "Confirmed"
        };
        
        await apiConfirmReservation(resDetail.reservationId, confirmationData);
        
        // Store the reservation ID for the confirmation page
        localStorage.setItem('confirmedReservationId', resDetail.reservationId);
        
        // Redirect to confirmation page
        window.location.href = '../src/reserva-confirmada.html';
      } catch (error) {
        console.error('Error confirming reservation:', error);
        btn.disabled = false;
        btn.textContent = 'Confirmar Reserva';
        alert('Error al confirmar la reserva: ' + error.message);
      }
    });
    document.getElementById('cancel-btn').addEventListener('click', async () => {
      if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
      const btn = document.getElementById('cancel-btn');
      btn.disabled = true;
      btn.textContent = 'Cancelando...';
      await apiCancelReservation(resDetail.reservationId);
      btn.textContent = 'Cancelada';
    });
  } catch (e) {
    console.error(e);
    // Mensaje de error en contenedor de título
    const titleContainerErr = document.getElementById('vehicle-title');
    const titleErr = titleContainerErr && titleContainerErr.querySelector('span');
    if (titleErr) titleErr.textContent = 'No hay próxima reserva';
  } finally {
    // Ocultar loading si existe
    const loader = document.getElementById('page-loading');
    if (loader) loader.classList.add('hidden');
  }
}

window.addEventListener('load', () => loadNextReservation());
// Expose functions globally for inline onclick handlers
window.toggleAccordion = toggleAccordion;
