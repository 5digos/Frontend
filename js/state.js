// Agregar timestamp de debugging para rastrear versión del archivo
console.log('state.js cargado a las:', new Date().toLocaleTimeString(), 'con limpieza forzada de localStorage');

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
  console.log('=== INICIALIZANDO RESERVATION DATA STATE ===');
  
  // Limpiar completamente para empezar desde cero
  localStorage.removeItem('reservationData');
  localStorage.removeItem('reservationForm');
  console.log('localStorage limpiado completamente');
  
  return {};
})();
export function setReservationData(data) {
  console.log('=== SET RESERVATION DATA LLAMADO ===');
  console.log('Datos recibidos:', data);
  console.log('Tipos de datos recibidos:');
  console.log('- fechaHoraInicio:', typeof data.fechaHoraInicio, data.fechaHoraInicio);
  console.log('- fechaHoraDevolucion:', typeof data.fechaHoraDevolucion, data.fechaHoraDevolucion);
  
  // Validar que fechaHoraInicio y fechaHoraDevolucion sean strings
  if (data.fechaHoraInicio && typeof data.fechaHoraInicio !== 'string') {
    console.error('fechaHoraInicio debe ser string, recibido:', typeof data.fechaHoraInicio, data.fechaHoraInicio);
    return;
  }
  if (data.fechaHoraDevolucion && typeof data.fechaHoraDevolucion !== 'string') {
    console.error('fechaHoraDevolucion debe ser string, recibido:', typeof data.fechaHoraDevolucion, data.fechaHoraDevolucion);
    return;
  }
  
  console.log('Guardando reservationData:', data);
  reservationDataState = data;
  
  const jsonString = JSON.stringify(data);
  console.log('JSON que se guardará:', jsonString);
  
  localStorage.setItem('reservationData', jsonString);
  
  const savedData = localStorage.getItem('reservationData');
  console.log('Datos guardados en localStorage:', savedData);
  
  // Verificar que lo guardado sea lo mismo que lo que enviamos
  const parsedSaved = JSON.parse(savedData);
  console.log('Datos parseados desde localStorage:', parsedSaved);
  console.log('=== FIN SET RESERVATION DATA ===');
}
export function getReservationData() {
  return reservationDataState;
}

// todos los campos del formulario de reserva (persistido en localStorage)
let reservationFormState = (() => {
  console.log('=== INICIALIZANDO RESERVATION FORM STATE ===');
  // También limpiar el form state para empezar completamente limpio
  return {};
})();
export function setReservationForm(data) {
  console.log('=== SET RESERVATION FORM LLAMADO ===');
  console.log('Form data recibida:', data);
  
  reservationFormState = data;
  const jsonString = JSON.stringify(data);
  localStorage.setItem('reservationForm', jsonString);
  
  console.log('Form data guardada en localStorage:', localStorage.getItem('reservationForm'));
  console.log('=== FIN SET RESERVATION FORM ===');
}
export function getReservationForm() {
  return reservationFormState;
}

// estado de autenticacion
let isAuthenticated = !!localStorage.getItem("token");
export function setAuthenticated(value) {
  isAuthenticated = value;
  if (!value) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}
export function getAuthenticated() {
  return isAuthenticated;
}
