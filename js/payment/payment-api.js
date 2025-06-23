
import { PAYMENT_URLS } from '../components/utilities.js';

let token = localStorage.getItem('token');

export async function getReservationForPayment(reservationId) {
    const res = await fetch(PAYMENT_URLS.GET_RESERVATION_FOR_PAYMENT(reservationId), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('No se pudo obtener la reserva.');
    return await res.json();
}

export async function createPaymentFromReservation(reservationSummary) {
    
    const res = await fetch(PAYMENT_URLS.POST_FROM_RESERVATION, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(reservationSummary)
    });
    if (!res.ok) throw new Error('No se pudo crear el pago.');
    return await res.json(); // contiene checkoutUrl y paymentId
}
