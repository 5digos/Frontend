

export function showPaymentModal(reservationId, onPay) {

    const modal = document.getElementById('payment-modal');
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible'); 

    const payBtn = modal.querySelector('#confirm-pay');
    payBtn.onclick = () => {
        onPay(reservationId);
        /*modal.style.display = 'none';*/
    };
}

export function hideModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-hidden'); 
}
