//Urls Microservicios

const BASE_VEHICLE_URL = 'https://localhost:7053/api/v1';

const BASE_RESERVATION_URL = 'https://localhost:7055/api/v1';

const BASE_AUTH_URL = 'https://localhost:7052/api/v1';

const BASE_PAYMENT_URL = 'https://localhost:7059/api';


//Para realizar llamadas a las URL
//Vehicles

export const VEHICLE_URLS = {
    GET_BRANCH_OFFICES: `${BASE_VEHICLE_URL}/BranchOffice`,
    GET_BRANCH_OFFICE_BY_ID: id => `${BASE_VEHICLE_URL}/BranchOffice/${id}`,
    GET_BRANCH_OFFICE_ZONES: `${BASE_VEHICLE_URL}/BranchOfficeZone`,
    GET_TRANSMISSION_TYPES: `${BASE_VEHICLE_URL}/TransmissionType`,
    GET_VEHICLES: `${BASE_VEHICLE_URL}/Vehicle`,
    GET_VEHICLE_BY_ID: id => `${BASE_VEHICLE_URL}/Vehicle/${id}`,
    ADD_VEHICLE_REVIEW: id => `${BASE_VEHICLE_URL}/Vehicle/${id}/reviews`,
    GET_VEHICLE_REVIEWS: id => `${BASE_VEHICLE_URL}/Vehicle/${id}/reviews`,
    UPDATE_VEHICLE_BRANCH: (id, branchOfficeId) => `${BASE_VEHICLE_URL}/Vehicle/${id}/branchOffice?branchOfficeId=${branchOfficeId}`,
    GET_VEHICLE_CATEGORIES: `${BASE_VEHICLE_URL}/VehicleCategory`,
    GET_VEHICLE_STATUSES: `${BASE_VEHICLE_URL}/VehicleStatus`
};

//Reservations
export const RESERVATION_URLS = {
    GET_AVAILABLE_VEHICLES: `${BASE_RESERVATION_URL}/Reservations/available`,
    CREATE_RESERVATION: `${BASE_RESERVATION_URL}/Reservations`,
    GET_USER_RESERVATIONS: `${BASE_RESERVATION_URL}/Reservations`,
    GET_RESERVATION_BY_ID: id => `${BASE_RESERVATION_URL}/api/v1/Reservations/${id}`,
    UPDATE_RESERVATION: id => `${BASE_RESERVATION_URL}/Reservations/${id}`,
    CONFIRM_RESERVATION: id => `${BASE_RESERVATION_URL}/Reservations/${id}/confirm`,
    CANCEL_RESERVATION: id => `${BASE_RESERVATION_URL}/Reservations/${id}/cancel`,
    PICKUP_RESERVATION: id => `${BASE_RESERVATION_URL}/Reservations/${id}/pickup`,
    RETURN_RESERVATION: id => `${BASE_RESERVATION_URL}/Reservations/${id}/return`,
    PAYMENT_RESERVATION: id => `${BASE_RESERVATION_URL}/Reservations/${id}/payment`,
    ADD_REVIEW: id => `${BASE_RESERVATION_URL}/Reservations/${id}/reviews`
};

//Auth
export const AUTH_URLS = {
    LOGIN: `${BASE_AUTH_URL}/Auth/Login`,
    LOGOUT: `${BASE_AUTH_URL}/Auth/Logout`,
    REFRESH_TOKEN: `${BASE_AUTH_URL}/Auth/RefreshToken`,
    CHANGE_PASSWORD: `${BASE_AUTH_URL}/Auth/ChangePassword`,
    PASSWORD_RESET_REQUEST: `${BASE_AUTH_URL}/Auth/PasswordResetRequest`,
    PASSWORD_RESET_CONFIRM: `${BASE_AUTH_URL}/Auth/PasswordResetConfirm`,
    VERIFY_EMAIL: `${BASE_AUTH_URL}/Auth/VerifyEmail`,
    RESEND_VERIFICATION_EMAIL: `${BASE_AUTH_URL}/Auth/ResendVerificationEmail`,
    SEND_NOTIFICATION_EVENT: `${BASE_AUTH_URL}/notifications/events`,
    CREATE_USER: `${BASE_AUTH_URL}/User`,
    UPDATE_USER: id => `${BASE_AUTH_URL}/User/${id}`,
    REMOVE_USER_IMAGE: id => `${BASE_AUTH_URL}/User/RemoveImage/${id}`
};

//Payments
export const PAYMENT_URLS = {
    GET_RESERVATION_FOR_PAYMENT: id => `${BASE_PAYMENT_URL}/Payment/reservation/${id}`,
    POST_FROM_RESERVATION: `${BASE_PAYMENT_URL}/Payment/from-reservation`,
    VERIFY_PAYMENT: mercadoPagoPaymentId => `${BASE_PAYMENT_URL}/Payment/verify/${mercadoPagoPaymentId}`,
    SUCCESS_PAYMENT: `${BASE_PAYMENT_URL}/Payment/pago-exitoso`,
    GET_PAYMENT_BY_ID: id => `${BASE_PAYMENT_URL}/Payment/${id}`
};


export function parseJwt(token) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
}

