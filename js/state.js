// sucursal seleccionada
let selectedBranchIdState = null;
export function setSelectedBranchId(id) {
  selectedBranchIdState = id;
}
export function getSelectedBranchId() {
  return selectedBranchIdState;
}

// campos obligatorios (ya formateados) del formulario de reserva (persistido en localStorage)
let reservationDataState = (() => {
  const json = localStorage.getItem('reservationData');
  return json ? JSON.parse(json) : {};
})();
export function setReservationData(data) {
  reservationDataState = data;
  localStorage.setItem('reservationData', JSON.stringify(data));
}
export function getReservationData() {
  return reservationDataState;
}

// todos los campos del formulario de reserva (persistido en localStorage)
let reservationFormState = (() => {
  const json = localStorage.getItem('reservationForm');
  return json ? JSON.parse(json) : {};
})();
export function setReservationForm(data) {
  reservationFormState = data;
  localStorage.setItem('reservationForm', JSON.stringify(data));
}
export function getReservationForm() {
  return reservationFormState;
}

// estado de autenticacion
let isAuthenticated = !!localStorage.getItem("token");
export function setAuthenticated(value) {
  isAuthenticated = value;
  if (value) localStorage.setItem('token', true);
  else localStorage.removeItem('token');
}
export function getAuthenticated() {
  return isAuthenticated;
}
