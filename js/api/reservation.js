const BASE_URL = 'https://localhost:7055/api/v1';


//Reservations
export const RESERVATION_URLS = {
    GET_AVAILABLE_VEHICLES: `${BASE_URL}/Reservations/available`,
    CREATE_RESERVATION: `${BASE_URL}/Reservations`,
    GET_USER_RESERVATIONS: `${BASE_URL}/Reservations`,
    GET_RESERVATION_BY_ID: id => `${BASE_URL}/Reservations/${id}`,
    UPDATE_RESERVATION: id => `${BASE_URL}/Reservations/${id}`,
    CONFIRM_RESERVATION: id => `${BASE_URL}/Reservations/${id}/confirm`,
    CANCEL_RESERVATION: id => `${BASE_URL}/Reservations/${id}/cancel`,
    PICKUP_RESERVATION: id => `${BASE_URL}/Reservations/${id}/pickup`,
    RETURN_RESERVATION: id => `${BASE_URL}/Reservations/${id}/return`,
    PAYMENT_RESERVATION: id => `${BASE_URL}/Reservations/${id}/payment`,
    ADD_REVIEW: id => `${BASE_URL}/Reservations/${id}/reviews`
};

// Funciones para consumir los endpoints de Reservation
export async function getAvailableVehicles(filters = {}) {
    const params = new URLSearchParams();
    if (filters.pickupBranchOfficeId != null) params.append('PickupBranchOfficeId', filters.pickupBranchOfficeId);
    if (filters.dropOffBranchOfficeId != null) params.append('DropOffBranchOfficeId', filters.dropOffBranchOfficeId);
    if (filters.startTime) params.append('StartTime', filters.startTime);
    if (filters.endTime) params.append('EndTime', filters.endTime);
    if (filters.offset != null) params.append('Offset', filters.offset);
    if (filters.size != null) params.append('Size', filters.size);
    if (filters.category) params.append('Category', filters.category);
    if (filters.seatingCapacity) params.append('SeatingCapacity', filters.seatingCapacity);
    if (filters.transmissionType) params.append('TransmissionType', filters.transmissionType);
    if (filters.maxPrice) params.append('MaxPrice', filters.maxPrice);
    if (filters.color) params.append('Color', filters.color);
    if (filters.brand) params.append('Brand', filters.brand);
    const url = `${RESERVATION_URLS.GET_AVAILABLE_VEHICLES}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener vehículos disponibles');
    return await res.json();
}

export async function createReservation(reservationData) {
    const res = await fetch(RESERVATION_URLS.CREATE_RESERVATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al crear la reserva');
    }
    return await res.json();
}

export async function getUserReservations() {
    const res = await fetch(RESERVATION_URLS.GET_USER_RESERVATIONS);
    if (!res.ok) throw new Error('Error al obtener reservas del usuario');
    return await res.json();
}

export async function getReservationById(id) {
    const res = await fetch(RESERVATION_URLS.GET_RESERVATION_BY_ID(id));
    if (res.status === 404) return { notFound: true };
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al obtener la reserva');
    }
    return await res.json();
}

export async function updateReservation(id, updateData) {
    const res = await fetch(RESERVATION_URLS.UPDATE_RESERVATION(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al actualizar la reserva');
    }
    return await res.json();
}

export async function confirmReservation(id) {
    const res = await fetch(RESERVATION_URLS.CONFIRM_RESERVATION(id), { method: 'POST' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al confirmar la reserva');
    }
    return await res.json();
}

export async function cancelReservation(id) {
    const res = await fetch(RESERVATION_URLS.CANCEL_RESERVATION(id), { method: 'POST' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al cancelar la reserva');
    }
    return await res.json();
}

export async function pickupReservation(id) {
    const res = await fetch(RESERVATION_URLS.PICKUP_RESERVATION(id), { method: 'POST' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al registrar la retirada del vehículo');
    }
    return await res.json();
}

export async function returnReservation(id) {
    const res = await fetch(RESERVATION_URLS.RETURN_RESERVATION(id), { method: 'POST' });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al registrar la devolución del vehículo');
    }
    return await res.json();
}

export async function paymentReservation(id, paymentData) {
    const res = await fetch(RESERVATION_URLS.PAYMENT_RESERVATION(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al procesar el pago de la reserva');
    }
    return await res.json();
}

export async function addReview(id, reviewData) {
    const res = await fetch(RESERVATION_URLS.ADD_REVIEW(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al agregar la reseña');
    }
    return await res.json();
}


