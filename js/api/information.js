const BASE_URL = "https://localhost:7053/api/v1";

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getBranches() {
  const res = await fetch(`${BASE_URL}/BranchOffice`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al obtener sucursales");
  return await res.json();
}

export async function getBranchOfficeById(id) {
  const response = await fetch(`${BASE_URL}/BranchOffice/${id}`, { headers: getAuthHeaders() });

  if (response.status === 404) {
    return { notFound: true };
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al obtener los datos de la sucursal");
  }

  return await response.json();
}

export async function getBranchZones() {
  const res = await fetch(`${BASE_URL}/BranchOfficeZone`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al obtener zonas de sucursales");
  return await res.json();
}

export async function getVehicles() {
  const res = await fetch(`${BASE_URL}/Vehicle`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al obtener vehiculos");
  return await res.json();
}

export async function getVehicleById(id) {
  const response = await fetch(`${BASE_URL}/Vehicle/${id}`, { headers: getAuthHeaders() });

  if (response.status === 404) {
    return { notFound: true };
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al obtener los datos del vehiculo");
  }

  return await response.json();
}

export async function getVehicleCategories() {
  const res = await fetch(`${BASE_URL}/VehicleCategory`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al obtener categorias de vehiculos");
  return await res.json();
}

export async function getTransmissionTypes() {
  const res = await fetch(`${BASE_URL}/TransmissionType`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Error al obtener tipos de transmision");
  return await res.json();
}
