import { BASE_URL } from '../api/index.js';

export function initPaymentSuccess() {
    // Extraer payment_id de todos los posibles lugares
    const params = new URLSearchParams(window.location.search);
    let paymentId = params.get("payment_id") || params.get("collection_id");
    if (!paymentId && params.get("external_reference")) {
        try {
            const ref = JSON.parse(decodeURIComponent(params.get("external_reference")));
            if (ref && ref.PaymentId) paymentId = ref.PaymentId;
        } catch {
            paymentId = params.get("external_reference");
        }
    }

    const countdownEl = document.getElementById("countdown");
    const loadingSpinner = document.getElementById("loading-spinner");
    const paymentDetails = document.getElementById("payment-details");
    const paymentInfo = document.getElementById("payment-info");
    const errorMessage = document.getElementById("error-message");

    async function verifyPayment() {
        try {
            const response = await fetch(`${BASE_URL}/payment/verify/${paymentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Error al verificar el pago");

            const data = await response.json();
            localStorage.setItem("lastPayment", JSON.stringify(data));

            loadingSpinner?.classList.add("hidden");
            paymentDetails?.classList.remove("hidden");

            // Mensaje según estado
            let statusMsg = "";
            let statusColor = "";
            if (data.status === "approved" || data.status === "success") {
                statusMsg = "✅ Pago confirmado exitosamente";
                statusColor = "text-green-400";
            } else if (data.status === "pending") {
                statusMsg = "⏳ Pago pendiente de confirmación";
                statusColor = "text-yellow-400";
            } else {
                statusMsg = "❌ Pago rechazado o fallido";
                statusColor = "text-red-400";
            }

            paymentInfo.innerHTML = `
                <div class="${statusColor} font-semibold mb-2">${statusMsg}</div>
                <div><strong>ID Pago:</strong> ${data.paymentId || paymentId}</div>
                <div><strong>ID Reserva:</strong> ${data.reservationId || '-'}</div>
                <div><strong>Total abonado:</strong> $${Number(data.amount || 0).toLocaleString()}</div>
                <div><strong>Recargo por demora:</strong> $${Number(data.lateFee || 0).toLocaleString()}</div>
                <div><strong>Estado:</strong> ${data.status || '-'}</div>
                <div><strong>Número de Transacción:</strong> ${data.transactionId || '-'}</div>
            `;

            startCountdown();

        } catch (err) {
            loadingSpinner?.classList.add("hidden");
            errorMessage?.classList.remove("hidden");
            const errorSpan = errorMessage?.querySelector("span:last-child");
            if (errorSpan) {
                errorSpan.textContent = "Error al verificar el pago. Por favor, contacta con soporte.";
            }
        }
    }

    function startCountdown() {
        let counter = 10;
        const timer = setInterval(() => {
            counter--;
            if (countdownEl) countdownEl.textContent = counter;
            if (counter <= 0) {
                clearInterval(timer);
                if (typeof window.loadPage === 'function') {
                    window.loadPage('activity');
                } else {
                    window.location.hash = 'activity';
                }
            }
        }, 1000);
    }

    // Botones
    const activityBtn = document.getElementById("go-to-activity");
    const homeBtn = document.getElementById("go-to-home");
    activityBtn?.addEventListener("click", () => {
        if (typeof window.loadPage === 'function') window.loadPage('activity');
        else window.location.hash = 'activity';
    });
    homeBtn?.addEventListener("click", () => {
        if (typeof window.loadPage === 'function') window.loadPage('home');
        else window.location.hash = 'home';
    });

    // Inicializar
    if (paymentId) {
        verifyPayment();
    } else {
        loadingSpinner?.classList.add("hidden");
        errorMessage?.classList.remove("hidden");
        const errorSpan = errorMessage?.querySelector("span:last-child");
        if (errorSpan) {
            errorSpan.textContent = "No se encontró un ID de pago válido.";
        }
    }
}
