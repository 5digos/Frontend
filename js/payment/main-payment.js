
import { hideModal, showPaymentModal } from './payment-modal.js';
import { getReservationForPayment, createPaymentFromReservation } from './payment-api.js';

document.getElementById('pay-btn').addEventListener('click', () => {

    const reservationId = '...'; // tengo que obtenerlo dinámicamente
    showPaymentModal(reservationId, async (id) => {

        try {
            const reservation = await getReservationForPayment(id); //Obtengo una reserva por su ID para efectuar el pago 
            const response = await createPaymentFromReservation(reservation); // Crea un pago a partir de una reserva
            window.location.href = response.checkoutUrl; // usa el checkoutUrl para redirigir a MP

        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
});

document.getElementById('cancel-pay').addEventListener('click', () => { hideModal(); });     

const modal = document.getElementById('payment-modal');
modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});
