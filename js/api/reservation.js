const BASE_URL = 'https://localhost:7055/api/v1';
const PAYMENT_BASE_URL = 'https://localhost:7059/api';

// Obtener headers de autenticación con token
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

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

//Payment
export const PAYMENT_URLS = {
    GET_RESERVATION_SUMMARY: id => `${PAYMENT_BASE_URL}/Payment/reservation/${id}`
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
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener vehículos disponibles');
    return await res.json();
}

export async function createReservation(reservationData) {
    const res = await fetch(RESERVATION_URLS.CREATE_RESERVATION, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
    });
    
    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('Los microservicios necesitan compartir la misma configuración JWT. Verifica que ambos servicios (Auth:7052 y Reservations:7055) usen la misma clave secreta JWT.');
        }
        try {
            const error = await res.json();
            throw new Error(error.message || `Error ${res.status}: ${res.statusText}`);
        } catch (parseError) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
    }
    return await res.json();
}

export async function getUserReservations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('Status', filters.status);
    if (filters.from) params.append('From', filters.from);
    if (filters.to) params.append('To', filters.to);
    if (filters.offset != null) params.append('Offset', filters.offset);
    if (filters.size != null) params.append('Size', filters.size);
    const query = params.toString();
    const url = query
        ? `${RESERVATION_URLS.GET_USER_RESERVATIONS}?${query}`
        : RESERVATION_URLS.GET_USER_RESERVATIONS;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error al obtener reservas del usuario');
    const items = await res.json();
    const offset = res.headers.get('offset');
    const size = res.headers.get('size');
    const totalCount = res.headers.get('totalcount');
    return {
        items,
        offset: offset != null ? Number(offset) : null,
        size: size != null ? Number(size) : null,
        totalCount: totalCount != null ? Number(totalCount) : null
    };
}

export async function getReservationById(id) {
    const res = await fetch(RESERVATION_URLS.GET_RESERVATION_BY_ID(id), { headers: getAuthHeaders() });
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
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al actualizar la reserva');
    }
    return await res.json();
}

export async function confirmReservation(id, reservationData) {
    const res = await fetch(RESERVATION_URLS.CONFIRM_RESERVATION(id), { 
        method: 'POST', 
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al confirmar la reserva');
    }
    return await res.json();
}

export async function cancelReservation(id) {
    const res = await fetch(RESERVATION_URLS.CANCEL_RESERVATION(id), { method: 'POST', headers: getAuthHeaders() });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al cancelar la reserva');
    }
    return await res.json();
}

export async function pickupReservation(id) {
    const res = await fetch(RESERVATION_URLS.PICKUP_RESERVATION(id), { 
        method: 'POST', 
        headers: getAuthHeaders()
    });
    if (!res.ok) {
        if (res.status === 409) {
            try {
                const error = await res.json();
                throw new Error(error.message || 'La hora de retiro proporcionada no es válida.');
            } catch (parseError) {
                throw new Error('Conflicto: La hora de retiro proporcionada no es válida. Verifica que estés dentro del horario permitido para recoger el vehículo.');
            }
        }
        if (res.status === 403) {
            throw new Error('No tienes permisos para recoger esta reserva.');
        }
        if (res.status === 404) {
            throw new Error('Reserva no encontrada.');
        }
        try {
            const error = await res.json();
            throw new Error(error.message || 'Error al registrar la retirada del vehículo');
        } catch (parseError) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
    }
    return await res.json();
}

export async function returnReservation(id) {
    const res = await fetch(RESERVATION_URLS.RETURN_RESERVATION(id), { method: 'POST', headers: getAuthHeaders() });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al registrar la devolución del vehículo');
    }
    return await res.json();
}

export async function paymentReservation(id, paymentData) {
    const res = await fetch(RESERVATION_URLS.PAYMENT_RESERVATION(id), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
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
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al agregar la reseña');
    }
    return await res.json();
}

// Payment functions
export async function getReservationSummaryForPayment(id) {
    const res = await fetch(PAYMENT_URLS.GET_RESERVATION_SUMMARY(id), { 
        method: 'GET', 
        headers: getAuthHeaders() 
    });
    if (!res.ok) {
        if (res.status === 404) {
            throw new Error('Reserva no encontrada para el pago.');
        }
        if (res.status === 403) {
            throw new Error('No tienes permisos para ver los datos de pago de esta reserva.');
        }
        if (res.status === 401) {
            throw new Error('Error de autenticación: El microservicio de Payment no puede acceder al servicio de Reservations. Verifica que ambos servicios compartan la misma configuración JWT.');
        }
        if (res.status === 500) {
            throw new Error('Error interno del servidor de pagos. Verifica que el microservicio de Payment esté configurado correctamente y tenga acceso al servicio de Reservations.');
        }
        try {
            const error = await res.json();
            throw new Error(error.message || 'Error al obtener los datos de pago de la reserva');
        } catch (parseError) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
    }
    return await res.json();
}


