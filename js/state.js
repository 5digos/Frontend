// sucursal seleccionada
let selectedBranchIdState = null;
export function setSelectedBranchId(id) {
  selectedBranchIdState = id;
}
export function getSelectedBranchId() {
  return selectedBranchIdState;
}

// campos obligatorios (ya formateados) del formulario de reserva
let reservationDataState = {};
export function setReservationData(data) {
  reservationDataState = data;
}
export function getReservationData() {
  return reservationDataState;
}

// todos los campos del formulario de reserva
let reservationFormState = {};
export function setReservationForm(data) {
  reservationFormState = data;
}
export function getReservationForm() {
  return reservationFormState;
}
