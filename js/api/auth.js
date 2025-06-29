const BASE_URL = "https://localhost:7052/api/v1";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/Auth/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Inicio de sesión fallido");
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
    throw new Error(error.message || "Registro fallido");
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
    throw new Error(error.message || "Verificación de email fallida");
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
    throw new Error(error.message || "Token de actualización fallido");
  }
  return await res.json();
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${BASE_URL}/Auth/PasswordResetRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.message || "No se pudo enviar el email de recuperación"
    );
  }

  return await res.json();
}

export async function confirmPasswordReset(email, resetCode, newPassword) {
  const res = await fetch(`${BASE_URL}/Auth/PasswordResetConfirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, resetCode, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "No se pudo restablecer la contraseña");
  }

  return await res.json();
}

export async function getUserById(userId, accessToken) {
  const res = await fetch(`${BASE_URL}/User/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "No se pudo obtener el usuario");
  }

  return await res.json();
}

export async function updateUser(userId, updatedData, accessToken) {
  const res = await fetch(`${BASE_URL}/User/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "No se pudo actualizar el usuario");
  }

  return await res.json();
}

export async function changePassword(
  currentPassword,
  newPassword,
  accessToken
) {
  const res = await fetch(`${BASE_URL}/Auth/ChangePassword`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  if (!res.ok) {
    let errorMessage = "No se pudo cambiar la contraseña";
    try {
      const error = await res.json();
      console.error("Respuesta con error 400:", error);

      if (error.message) {
        errorMessage = error.message;
      } else if (error.errors?.NewPassword?.length > 0) {
        errorMessage = error.errors.NewPassword[0];
      }
    } catch (e) {
      const fallback = await res.text();
      console.warn("Respuesta no JSON:", fallback);
      if (fallback) errorMessage = fallback;
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}
