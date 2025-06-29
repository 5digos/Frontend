import { getUserReservations, getReservationById, returnReservation } from '../api/reservation.js';
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

async function loadInProgressReservation() {
  // Validar que estamos en la vista correcta
  if (!document.getElementById('vehicle-image')) return;
  try {
    // Get reservation ID from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('id') || localStorage.getItem('inProgressReservationId');
    
    if (!reservationId) {
      // If no specific reservation ID, get the most recent in-progress reservation
      const { items } = await getUserReservations({ status: 'InProgress' });
      if (!items.length) throw new Error('No hay reservas en progreso');
      // Sort by pickup time
      items.sort((a, b) => new Date(b.actualPickupTime) - new Date(a.actualPickupTime));
      const latestInProgress = items[0];
      await loadReservationDetails(latestInProgress);
    } else {
      // Load specific reservation
      const resDetail = await getReservationById(reservationId);
      if (resDetail.notFound) throw new Error('Reserva no encontrada');
      await loadReservationDetails(resDetail);
    }
  } catch (error) {
    console.error('Error loading in-progress reservation:', error);
    document.getElementById('page-loading').style.display = 'none';
    document.querySelector('.max-w-md').innerHTML = `
      <div class="p-4 text-center">
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <span class="material-icons text-red-400 text-3xl mb-2 block">error</span>
          <h2 class="text-red-400 font-semibold text-lg mb-1">Error</h2>
          <p class="text-gray-300 text-sm">${error.message}</p>
          <button onclick="window.history.back()" class="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
            Volver
          </button>
        </div>
      </div>
    `;
  }
}

async function loadReservationDetails(reservation) {
  // Store reservation globally for return functionality
  window.currentReservation = reservation;
  
  try {
    const [vehicleDetail, pickupOffice, dropoffOffice] = await Promise.all([
      getVehicleById(reservation.vehicleId),
      getBranchOfficeById(reservation.pickupBranchOfficeId),
      getBranchOfficeById(reservation.dropOffBranchOfficeId)
    ]);

    console.log('Vehicle detail loaded:', vehicleDetail);
    console.log('Pickup office loaded:', pickupOffice);
    console.log('Dropoff office loaded:', dropoffOffice);

    // Update vehicle info - using the same structure as proxima-reserva.js
    const imgEl = document.getElementById('vehicle-image');
    const titleContainer = document.getElementById('vehicle-title');
    
    if (imgEl) {
      imgEl.src = vehicleDetail.vehicle?.imageUrl || '../img/img-not-found.jpg';
      imgEl.alt = `${vehicleDetail.vehicle?.brand || ''} ${vehicleDetail.vehicle?.model || ''}`;
    }
    
    if (titleContainer) {
      titleContainer.innerHTML = `<span class="font-semibold">${vehicleDetail.vehicle?.brand || ''} ${vehicleDetail.vehicle?.model || ''} ${vehicleDetail.vehicle?.year || ''}</span>`;
    }
    
    document.getElementById('vehicle-brand-model').textContent = `${vehicleDetail.vehicle?.brand || 'N/A'} ${vehicleDetail.vehicle?.model || 'N/A'}`;
    document.getElementById('vehicle-year').textContent = vehicleDetail.vehicle?.year || 'N/A';
    document.getElementById('vehicle-plate').textContent = vehicleDetail.vehicle?.licensePlate || 'N/A';
    document.getElementById('vehicle-price').textContent = `$${Number(reservation.hourlyRateSnapshot || vehicleDetail.vehicle?.price || 0).toLocaleString()}`;
    document.getElementById('vehicle-seats').textContent = vehicleDetail.vehicle?.seatingCapacity || 'N/A';
    document.getElementById('vehicle-transmission').textContent = vehicleDetail.vehicle?.transmissionType?.name || vehicleDetail.vehicle?.transmissionType || 'N/A';
    document.getElementById('vehicle-category').textContent = vehicleDetail.vehicle?.category?.name || vehicleDetail.vehicle?.category || 'N/A';

    // Documents - using the same structure as proxima-reserva.js
    const docsContainer = document.getElementById('documents-container');
    docsContainer.innerHTML = ''; // Clear existing content
    
    if (vehicleDetail.documents && vehicleDetail.documents.length > 0) {
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
    } else {
      docsContainer.innerHTML = '<p class="text-gray-500 text-sm">No hay documentos disponibles</p>';
    }

    // Update reservation info - using the same structure as proxima-reserva.js
    document.getElementById('pickup-office-name').textContent = reservation.pickupBranchOfficeName || 'N/A';
    document.getElementById('dropoff-office-name').textContent = reservation.dropOffBranchOfficeName || 'N/A';
    
    // populate branch details
    if (pickupOffice) {
      const pickupDetails = document.getElementById('pickup-office-details');
      if (pickupDetails) pickupDetails.classList.remove('hidden');
      document.getElementById('pickup-office-address').textContent = `${pickupOffice.address || ''}, ${pickupOffice.city || ''}`;
      document.getElementById('pickup-office-phone').textContent = pickupOffice.phone || 'N/A';
      document.getElementById('pickup-office-reference').textContent = pickupOffice.locationReference || 'N/A';
    }
    
    if (dropoffOffice) {
      const dropoffDetails = document.getElementById('dropoff-office-details');
      if (dropoffDetails) dropoffDetails.classList.remove('hidden');
      document.getElementById('dropoff-office-address').textContent = `${dropoffOffice.address || ''}, ${dropoffOffice.city || ''}`;
      document.getElementById('dropoff-office-phone').textContent = dropoffOffice.phone || 'N/A';
      document.getElementById('dropoff-office-reference').textContent = dropoffOffice.locationReference || 'N/A';
    }
    
    document.getElementById('res-date-start').textContent = formatDate(reservation.startTime);
    document.getElementById('res-time-start').textContent = formatTime(reservation.startTime);
    document.getElementById('res-date-end').textContent = formatDate(reservation.endTime);
    document.getElementById('res-time-end').textContent = formatTime(reservation.endTime);

    // Real times
    updateRealTimes(reservation);

    // Setup return vehicle button
    const returnVehicleBtn = document.getElementById('return-vehicle-btn');
    if (returnVehicleBtn) {
      returnVehicleBtn.addEventListener('click', handleReturnVehicle);
    }

    document.getElementById('page-loading').style.display = 'none';
  } catch (error) {
    console.error('Error loading reservation details:', error);
    throw error;
  }
}

function updateRealTimes(reservation) {
  // Real pickup time (should always be present for in-progress reservations)
  if (reservation.actualPickupTime) {
    document.getElementById('res-date-real-start').textContent = formatDate(reservation.actualPickupTime);
    document.getElementById('res-time-real-start').textContent = formatTime(reservation.actualPickupTime);
  }
  
  // Real return time (should be empty for in-progress reservations)
  if (reservation.actualReturnTime) {
    document.getElementById('res-date-real-end').textContent = formatDate(reservation.actualReturnTime);
    document.getElementById('res-time-real-end').textContent = formatTime(reservation.actualReturnTime);
    document.getElementById('res-date-real-end').classList.remove('text-gray-500');
    document.getElementById('res-time-real-end').classList.remove('text-gray-500');
    document.getElementById('res-date-real-end').classList.add('text-white');
    document.getElementById('res-time-real-end').classList.add('text-gray-300');
  }
}

async function handleReturnVehicle() {
  if (!window.currentReservation) {
    alert('Error: No se encontró información de la reserva');
    return;
  }

  // Show confirmation dialog
  const confirmed = confirm('¿Estás seguro de que deseas devolver el vehículo? Esta acción no se puede deshacer.');
  if (!confirmed) {
    return;
  }

  const btn = document.getElementById('return-vehicle-btn');
  const originalContent = btn.innerHTML;
  
  try {
    // Show loading state
    btn.disabled = true;
    btn.innerHTML = `
      <div class="spinner mx-auto w-5 h-5 border-2 border-white border-t-transparent"></div>
      Devolviendo vehículo...
    `;
    
    // Call return API
    const updatedReservation = await returnReservation(window.currentReservation.reservationId);
    
    // Store the reservation ID for the completed page
    localStorage.setItem('completedReservationId', window.currentReservation.reservationId);
    
    // Redirect to completed page
    window.location.href = 'reserva-completada.html';
    
  } catch (error) {
    console.error('Error during vehicle return:', error);
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Error al devolver el vehículo: ' + error.message);
  }
}

// Make functions global for HTML onclick handlers
window.toggleAccordion = toggleAccordion;
window.downloadDocument = downloadDocument;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadInProgressReservation);
