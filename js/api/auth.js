const BASE_URL = "https://localhost:7052/api/v1";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/Auth/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }
  const data = await res.json();
  return data;
}

export async function logout(refreshToken, accessToken) {
  const response = await fetch("https://localhost:7052/api/v1/Auth/Logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("Error al cerrar sesión: " + text);
  }

  return await response.json();
}

export async function register(firstName, lastName, email, dni, password) {
  const res = await fetch(`${BASE_URL}/User`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, dni, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Register failed");
  }
  return await res.json();
}

export async function verifyEmail(email, verificationCode) {
  const res = await fetch(`${BASE_URL}/Auth/VerifyEmail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, verificationCode }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Verification failed");
  }

  return await res.json();
}

export async function resendVerificationEmail(email) {
  const response = await fetch(`${BASE_URL}/Auth/ResendVerificationEmail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al reenviar el email");
  }

  return await response.json();
}

export async function refreshToken(expiredAccessToken, refreshToken) {
  const res = await fetch(`${BASE_URL}/Auth/RefreshToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiredAccessToken, refreshToken }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Token refresh failed");
  }
  return await res.json();
}
