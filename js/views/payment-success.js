import { BASE_URL } from '../api/index.js';

export function initPaymentSuccess() {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    const countdownEl = document.getElementById("countdown");
    const loadingSpinner = document.getElementById("loading-spinner");
    const paymentDetails = document.getElementById("payment-details");
    const paymentInfo = document.getElementById("payment-info");
    const errorMessage = document.getElementById("error-message");

    async function verifyPayment() {
        try {
            const response = await fetch(`${BASE_URL}/payment/verify/${paymentId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error("Error al verificar el pago");
            }

            const data = await response.json();
            localStorage.setItem("lastPayment", JSON.stringify(data));

            // Ocultar spinner y mostrar detalles
            loadingSpinner?.classList.add("hidden");
            paymentDetails?.classList.remove("hidden");

            // Mostrar información del pago
            if (paymentInfo) {
                paymentInfo.innerHTML = `
                    <div class="text-green-400 font-semibold mb-2">✅ Pago confirmado exitosamente</div>
                    <div><strong>ID Pago:</strong> ${data.paymentId}</div>
                    <div><strong>ID Reserva:</strong> ${data.reservationId}</div>
                    <div><strong>Total abonado:</strong> $${Number(data.amount).toLocaleString()}</div>
                    <div><strong>Recargo por demora:</strong> $${Number(data.lateFee || 0).toLocaleString()}</div>
                    <div><strong>Número de Transacción:</strong> ${data.transactionId}</div>
                `;
            }

            // Iniciar cuenta regresiva
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
            if (countdownEl) {
                countdownEl.textContent = counter;
            }
            if (counter <= 0) {
                clearInterval(timer);
                // Usar la navegación SPA
                if (typeof window.loadPage === 'function') {
                    window.loadPage('activity');
                } else {
                    window.location.hash = 'activity';
                }
            }
        }, 1000);
    }

    // Event listeners para los botones
    const activityBtn = document.getElementById("go-to-activity");
    const homeBtn = document.getElementById("go-to-home");

    activityBtn?.addEventListener("click", () => {
        if (typeof window.loadPage === 'function') {
            window.loadPage('activity');
        } else {
            window.location.hash = 'activity';
        }
    });

    homeBtn?.addEventListener("click", () => {
        if (typeof window.loadPage === 'function') {
            window.loadPage('home');
        } else {
            window.location.hash = 'home';
        }
    });

    // Inicializar verificación del pago
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
