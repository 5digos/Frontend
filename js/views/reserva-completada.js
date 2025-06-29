import { getUserReservations, getReservationById } from '../api/reservation.js';
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

async function loadCompletedReservation() {
  // Validar que estamos en la vista correcta
  if (!document.getElementById('vehicle-image')) return;
  try {
    // Get reservation ID from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('id') || localStorage.getItem('completedReservationId');
    
    if (!reservationId) {
      // If no specific reservation ID, get the most recent completed reservation
      const { items } = await getUserReservations({ status: 'Completed' });
      if (!items.length) throw new Error('No hay reservas completadas');
      // Sort by return time
      items.sort((a, b) => new Date(b.actualReturnTime) - new Date(a.actualReturnTime));
      const latestCompleted = items[0];
      await loadReservationDetails(latestCompleted);
    } else {
      // Load specific reservation
      const resDetail = await getReservationById(reservationId);
      if (resDetail.notFound) throw new Error('Reserva no encontrada');
      await loadReservationDetails(resDetail);
    }
  } catch (error) {
    console.error('Error loading completed reservation:', error);
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
  // Store reservation globally
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

    // Real times (both should be present for completed reservations)
    updateRealTimes(reservation);

    // Setup payment button
    setupPaymentButton(reservation);

    document.getElementById('page-loading').style.display = 'none';
  } catch (error) {
    console.error('Error loading reservation details:', error);
    throw error;
  }
}

function updateRealTimes(reservation) {
  // Real pickup time
  if (reservation.actualPickupTime) {
    document.getElementById('res-date-real-start').textContent = formatDate(reservation.actualPickupTime);
    document.getElementById('res-time-real-start').textContent = formatTime(reservation.actualPickupTime);
  }
  
  // Real return time
  if (reservation.actualReturnTime) {
    document.getElementById('res-date-real-end').textContent = formatDate(reservation.actualReturnTime);
    document.getElementById('res-time-real-end').textContent = formatTime(reservation.actualReturnTime);
  }
}

function setupPaymentButton(reservation) {
  const paymentBtn = document.getElementById('go-to-payment-btn');
  if (!paymentBtn) return;
  
  // Button exists but has no functionality - only visual styling
}

function calculateTotalAmount(reservation) {
  if (!reservation.actualPickupTime || !reservation.actualReturnTime) {
    return 0;
  }
  
  const pickupTime = new Date(reservation.actualPickupTime);
  const returnTime = new Date(reservation.actualReturnTime);
  const durationMs = returnTime - pickupTime;
  
  // Calculate hours (including partial hours)
  const hours = durationMs / (1000 * 60 * 60);
  const hourlyRate = reservation.hourlyRateSnapshot || 0;
  
  // Round up to nearest hour for billing
  const billableHours = Math.ceil(hours);
  return billableHours * hourlyRate;
}

function calculateTotalDuration(reservation) {
  if (reservation.actualPickupTime && reservation.actualReturnTime) {
    const pickupTime = new Date(reservation.actualPickupTime);
    const returnTime = new Date(reservation.actualReturnTime);
    const durationMs = returnTime - pickupTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const durationText = hours > 0 ? 
      `${hours}h ${minutes}m` : 
      `${minutes}m`;
    
    document.getElementById('total-duration').textContent = durationText;
  } else {
    document.getElementById('total-duration').textContent = 'No disponible';
  }
}

// Make functions global for HTML onclick handlers
window.toggleAccordion = toggleAccordion;
window.downloadDocument = downloadDocument;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadCompletedReservation);
