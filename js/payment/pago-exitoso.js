
import { PAYMENT_URLS } from '../components/utilities.js';

let token = localStorage.getItem('token');

async function verifyPayment(paymentId) {
    const url = PAYMENT_URLS.SUCCESS_PAYMENT + `?payment_id=${paymentId}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const resultElement = document.getElementById('payment-result');

    if (res.ok) {
        const message = await res.text();
        resultElement.textContent = message;
    } else {
        const err = await res.text();
        resultElement.textContent = "Error al verificar el pago: " + err;
    }
}

function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

const mpPaymentId = getQueryParam("payment_id");
if (mpPaymentId) {
    verifyPayment(mpPaymentId);
} else {
    document.getElementById('payment-result').textContent = "No se encuentra el ID de pago en la URL...";
}
