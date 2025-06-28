import { getUserReservations, getReservationById, pickupReservation, returnReservation, getReservationSummaryForPayment } from '../api/reservation.js';
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

async function loadConfirmedReservation() {
  // Validar que estamos en la vista correcta
  if (!document.getElementById('vehicle-image')) return;
  try {
    // Get reservation ID from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('id') || localStorage.getItem('confirmedReservationId');
    
    if (!reservationId) {
      // If no specific reservation ID, get the most recent confirmed reservation
      const { items } = await getUserReservations({ status: 'Confirmed' });
      if (!items.length) throw new Error('No hay reservas confirmadas');
      // Sort by confirmation date or start time
      items.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      const latestConfirmed = items[0];
      await loadReservationDetails(latestConfirmed);
    } else {
      // Load specific reservation
      const resDetail = await getReservationById(reservationId);
      if (resDetail.notFound) throw new Error('Reserva no encontrada');
      await loadReservationDetails(resDetail);
    }
  } catch (error) {
    console.error('Error loading confirmed reservation:', error);
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
  // Store reservation globally for pickup functionality
  window.currentReservation = reservation;
  
  try {
    const [vehicleDetail, pickupOffice, dropoffOffice] = await Promise.all([
      getVehicleById(reservation.vehicleId),
      getBranchOfficeById(reservation.pickupBranchOfficeId),
      getBranchOfficeById(reservation.dropOffBranchOfficeId)
    ]);

    // Update vehicle info
    document.getElementById('vehicle-image').src = vehicleDetail.imageUrl || '../img/img-not-found.jpg';
    document.getElementById('vehicle-title').innerHTML = `<span class="font-semibold">${vehicleDetail.brand} ${vehicleDetail.model} ${vehicleDetail.year}</span>`;
    document.getElementById('vehicle-brand-model').textContent = `${vehicleDetail.brand} ${vehicleDetail.model}`;
    document.getElementById('vehicle-year').textContent = vehicleDetail.year;
    document.getElementById('vehicle-plate').textContent = vehicleDetail.licensePlate;
    document.getElementById('vehicle-price').textContent = `$${vehicleDetail.hourlyRate}/hora`;
    document.getElementById('vehicle-seats').textContent = vehicleDetail.seatingCapacity;
    document.getElementById('vehicle-transmission').textContent = vehicleDetail.transmissionType;
    document.getElementById('vehicle-category').textContent = vehicleDetail.category;

    // Documents
    const docsContainer = document.getElementById('documents-container');
    if (vehicleDetail.documents && vehicleDetail.documents.length > 0) {
      docsContainer.innerHTML = vehicleDetail.documents.map(doc => `
        <button id="download-${doc.type}" onclick="downloadDocument('${doc.url}', '${doc.type}')" 
                class="w-full flex items-center justify-between p-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm">
          <span class="text-gray-300">${doc.type}</span>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>
      `).join('');
    } else {
      docsContainer.innerHTML = '<p class="text-gray-500 text-sm">No hay documentos disponibles</p>';
    }

    // Update reservation info
    document.getElementById('pickup-office-name').textContent = pickupOffice.name;
    document.getElementById('dropoff-office-name').textContent = dropoffOffice.name;
    
    document.getElementById('res-date-start').textContent = formatDate(reservation.startTime);
    document.getElementById('res-time-start').textContent = formatTime(reservation.startTime);
    document.getElementById('res-date-end').textContent = formatDate(reservation.endTime);
    document.getElementById('res-time-end').textContent = formatTime(reservation.endTime);

    // Real times
    updateRealTimes(reservation);

    // Setup open vehicle button
    const openVehicleBtn = document.getElementById('open-vehicle-btn');
    if (openVehicleBtn) {
      // Check if vehicle is already returned
      if (reservation.actualReturnTime) {
        showVehicleReturnedState();
      }
      // Check if vehicle is already picked up
      else if (reservation.actualPickupTime) {
        showVehiclePickedUpState();
      } else {
        openVehicleBtn.addEventListener('click', handleOpenVehicle);
      }
    }

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
    document.getElementById('res-date-real-start').classList.remove('text-gray-500');
    document.getElementById('res-time-real-start').classList.remove('text-gray-500');
    document.getElementById('res-date-real-start').classList.add('text-white');
    document.getElementById('res-time-real-start').classList.add('text-gray-300');
  }
  
  // Real return time
  if (reservation.actualReturnTime) {
    document.getElementById('res-date-real-end').textContent = formatDate(reservation.actualReturnTime);
    document.getElementById('res-time-real-end').textContent = formatTime(reservation.actualReturnTime);
    document.getElementById('res-date-real-end').classList.remove('text-gray-500');
    document.getElementById('res-time-real-end').classList.remove('text-gray-500');
    document.getElementById('res-date-real-end').classList.add('text-white');
    document.getElementById('res-time-real-end').classList.add('text-gray-300');
  }
}

async function handleOpenVehicle() {
  const btn = document.getElementById('open-vehicle-btn');
  const originalContent = btn.innerHTML;
  
  try {
    // Show loading state
    btn.disabled = true;
    btn.innerHTML = `
      <div class="spinner mx-auto w-5 h-5 border-2 border-white border-t-transparent"></div>
      Abriendo vehículo...
    `;
    
    // Debug info
    const currentTime = new Date();
    const startTime = new Date(window.currentReservation.startTime);
    const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(currentTime.getTime() + 60 * 60 * 1000);
    
    console.log('Pickup validation debug:', {
      reservationId: window.currentReservation.reservationId,
      status: window.currentReservation.status,
      startTime: window.currentReservation.startTime,
      startTimeParsed: startTime.toISOString(),
      currentTime: currentTime.toISOString(),
      oneHourBeforeStart: oneHourBefore.toISOString(),
      oneHourAfterNow: oneHourAfter.toISOString(),
      actualPickupTime: window.currentReservation.actualPickupTime,
      isCurrentBeforeLimit: currentTime < oneHourBefore,
      isCurrentAfterLimit: currentTime > oneHourAfter,
      timezoneOffset: currentTime.getTimezoneOffset()
    });
    
    // Call pickup API (backend handles all the data)
    const updatedReservation = await pickupReservation(window.currentReservation.reservationId);
    
    // Update the reservation object with response from backend
    window.currentReservation = { ...window.currentReservation, ...updatedReservation };
    
    // Update the real times display
    updateRealTimes(window.currentReservation);
    
    // Show success state and change to return button
    showVehiclePickedUpState();
    
  } catch (error) {
    console.error('Error during vehicle pickup:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack
    });
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Error al abrir el vehículo: ' + error.message);
  }
}

function showVehiclePickedUpState() {
  const btn = document.getElementById('open-vehicle-btn');
  
  // Change button to pressed state
  btn.innerHTML = `
    <span class="material-icons">lock_open</span>
    Vehículo Abierto
  `;
  btn.disabled = true;
  btn.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'transform', 'hover:scale-105');
  btn.classList.add('bg-gray-600', 'cursor-not-allowed');
  
  // Add return vehicle button
  const buttonContainer = btn.parentElement;
  
  // Check if return button already exists
  if (!document.getElementById('return-vehicle-btn')) {
    const returnBtn = document.createElement('button');
    returnBtn.id = 'return-vehicle-btn';
    returnBtn.className = 'w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 mt-4';
    returnBtn.innerHTML = `
      <span class="material-icons">keyboard_return</span>
      Devolver Vehículo
    `;
    
    // Add click handler (placeholder for now)
    returnBtn.addEventListener('click', handleReturnVehicle);
    
    buttonContainer.appendChild(returnBtn);
  }
}

async function handleReturnVehicle() {
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
    
    // Update the reservation object with response from backend
    window.currentReservation = { ...window.currentReservation, ...updatedReservation };
    
    // Update the real times display
    updateRealTimes(window.currentReservation);
    
    // Show vehicle returned state
    showVehicleReturnedState();
    
  } catch (error) {
    console.error('Error during vehicle return:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack
    });
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Error al devolver el vehículo: ' + error.message);
  }
}

function showVehicleReturnedState() {
  // Hide the open vehicle button and return vehicle button
  const openVehicleBtn = document.getElementById('open-vehicle-btn');
  const returnVehicleBtn = document.getElementById('return-vehicle-btn');
  
  if (openVehicleBtn) {
    openVehicleBtn.style.display = 'none';
  }
  if (returnVehicleBtn) {
    returnVehicleBtn.style.display = 'none';
  }
  
  // Get the button container
  const buttonContainer = openVehicleBtn ? openVehicleBtn.parentElement : returnVehicleBtn.parentElement;
  
  // Check if payment button already exists
  if (!document.getElementById('payment-btn')) {
    const paymentBtn = document.createElement('button');
    paymentBtn.id = 'payment-btn';
    paymentBtn.className = 'w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2';
    paymentBtn.innerHTML = `
      <span class="material-icons">payment</span>
      Ir a pagar
    `;
    
    // Add click handler (placeholder for now as payment functionality is not required)
    paymentBtn.addEventListener('click', handleGoToPayment);
    
    buttonContainer.appendChild(paymentBtn);
  }
}

async function handleGoToPayment() {
  const btn = document.getElementById('payment-btn');
  const originalContent = btn.innerHTML;
  
  try {
    // Show loading state
    btn.disabled = true;
    btn.innerHTML = `
      <div class="spinner mx-auto w-5 h-5 border-2 border-white border-t-transparent"></div>
      Cargando datos de pago...
    `;
    
    // Call payment API to get reservation summary with calculated price
    const paymentData = await getReservationSummaryForPayment(window.currentReservation.reservationId);
    
    // Show payment details
    showPaymentDetails(paymentData);
    
  } catch (error) {
    console.error('Error getting payment data:', error);
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Error al obtener los datos de pago: ' + error.message);
  }
}

function showPaymentDetails(paymentData) {
  // Hide the payment button
  const paymentBtn = document.getElementById('payment-btn');
  if (paymentBtn) {
    paymentBtn.style.display = 'none';
  }
  
  // Get the button container
  const buttonContainer = paymentBtn.parentElement;
  
  // Calculate hours and pricing details
  const startTime = new Date(paymentData.startTime);
  const endTime = new Date(paymentData.endTime);
  const actualEndTime = paymentData.actualReturnTime ? new Date(paymentData.actualReturnTime) : endTime;
  
  const plannedHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60)); // hours
  const actualHours = Math.ceil((actualEndTime - startTime) / (1000 * 60 * 60)); // hours
  
  const hourlyRate = paymentData.hourlyRateSnapshot;
  const baseAmount = plannedHours * hourlyRate;
  const totalAmount = actualHours * hourlyRate;
  const lateFee = totalAmount > baseAmount ? totalAmount - baseAmount : 0;
  
  // Create payment details container
  const paymentDetailsContainer = document.createElement('div');
  paymentDetailsContainer.id = 'payment-details-container';
  paymentDetailsContainer.className = 'bg-gray-800 border border-gray-600 rounded-lg p-4 mt-4';
  paymentDetailsContainer.innerHTML = `
    <div class="flex items-center gap-2 mb-4">
      <span class="material-icons text-green-400">receipt</span>
      <h3 class="text-lg font-semibold text-white">Resumen de Pago</h3>
    </div>
    
    <div class="space-y-3">
      <!-- Tiempo -->
      <div class="flex justify-between py-2 border-b border-gray-700">
        <span class="text-gray-300">Tiempo planificado:</span>
        <span class="text-white">${plannedHours} ${plannedHours === 1 ? 'hora' : 'horas'}</span>
      </div>
      <div class="flex justify-between py-2 border-b border-gray-700">
        <span class="text-gray-300">Tiempo real:</span>
        <span class="text-white">${actualHours} ${actualHours === 1 ? 'hora' : 'horas'}</span>
      </div>
      
      <!-- Precios -->
      <div class="flex justify-between py-2 border-b border-gray-700">
        <span class="text-gray-300">Tarifa por hora:</span>
        <span class="text-white">$${hourlyRate.toFixed(2)}</span>
      </div>
      <div class="flex justify-between py-2 border-b border-gray-700">
        <span class="text-gray-300">Costo base:</span>
        <span class="text-white">$${baseAmount.toFixed(2)}</span>
      </div>
      ${lateFee > 0 ? `
        <div class="flex justify-between py-2 border-b border-gray-700">
          <span class="text-orange-400">Recargo por tiempo extra:</span>
          <span class="text-orange-400">+$${lateFee.toFixed(2)}</span>
        </div>
      ` : ''}
      
      <!-- Total -->
      <div class="flex justify-between py-3 border-t border-gray-600 text-lg font-semibold">
        <span class="text-white">Total a pagar:</span>
        <span class="text-green-400">$${totalAmount.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  // Add the payment details container
  buttonContainer.appendChild(paymentDetailsContainer);
  
  // Add "Pagar ahora" button
  if (!document.getElementById('pay-now-btn')) {
    const payNowBtn = document.createElement('button');
    payNowBtn.id = 'pay-now-btn';
    payNowBtn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 mt-4';
    payNowBtn.innerHTML = `
      <span class="material-icons">credit_card</span>
      Pagar ahora ($${totalAmount.toFixed(2)})
    `;
    
    // Add click handler (placeholder for now as payment processing is not required)
    payNowBtn.addEventListener('click', handlePayNow);
    
    buttonContainer.appendChild(payNowBtn);
  }
}

function handlePayNow() {
  // Placeholder function - actual payment processing not required for now
  const btn = document.getElementById('pay-now-btn');
  const originalContent = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = `
    <div class="spinner mx-auto w-5 h-5 border-2 border-white border-t-transparent"></div>
    Procesando pago...
  `;
  
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Funcionalidad de procesamiento de pago en desarrollo. Los datos de pago han sido cargados exitosamente.');
  }, 2000);
}

// Make functions global for HTML onclick handlers
window.toggleAccordion = toggleAccordion;
window.downloadDocument = downloadDocument;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadConfirmedReservation);
