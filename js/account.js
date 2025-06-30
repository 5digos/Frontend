import { getUserById, updateUser, changePassword } from "./api/auth.js";
import { showAlert } from "./components/alerts.js";
import { loadLoginView } from "./main.js";

let changePasswordSection;
let changePasswordBtn;
let cancelPasswordBtn;
let logoutBtn;
let editBtn;
let editBtnsGroup;
let accountInfoSection;

let isChangingPassword = false;
let isEditingProfile = false;

export async function initializeAccountPage() {
  await loadUserData();

  const toggleBtn = document.getElementById("toggle-password-visibility-btn");
  const eyeIcon = toggleBtn.querySelector("i");

  toggleBtn.addEventListener("click", () => {
    const inputs = [
      document.getElementById("oldPassword"),
      document.getElementById("newPassword"),
      document.getElementById("confirmPassword"),
    ];

    const isHidden = inputs[0].type === "password";

    inputs.forEach((input) => {
      input.type = isHidden ? "text" : "password";
    });

    if (isHidden) {
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });

  document.getElementById("edit-btn").addEventListener("click", () => {
    enterEditMode();
  });

  document.getElementById("cancel-btn").addEventListener("click", () => {
    exitEditMode();
    loadUserData();
  });

  document
    .getElementById("change-password-btn")
    .addEventListener("click", () => {
      enterChangePasswordMode();
    });

  document
    .getElementById("cancel-password-btn")
    .addEventListener("click", () => {
      exitChangePasswordMode();
      clearPasswordInputs();
    });

  document.getElementById("save-btn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);

    const updatedUser = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      dni: document.getElementById("dni").value,
      imageUrl: "",
    };

    try {
      await updateUser(userId, updatedUser, token);
      showAlert("Usuario actualizado exitosamente.", "success");
      exitEditMode();
    } catch (err) {
      console.error(err.message || "Error actualizando usuario");
    }
  });

  changePasswordSection = document.getElementById("change-password");
  changePasswordBtn = document.getElementById("change-password-btn");
  cancelPasswordBtn = document.getElementById("cancel-password-btn");
  logoutBtn = document.getElementById("logout-btn");
  editBtn = document.getElementById("edit-btn");
  editBtnsGroup = document.getElementById("edit-btns");
  accountInfoSection = document.getElementById("account-info");

  document
    .getElementById("save-password-btn")
    .addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken(token);

      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      hidePasswordError();

      if (newPassword !== confirmPassword) {
        showPasswordError("Las contraseñas no coinciden.");
        return;
      }

      if (!validatePasswordStrength(newPassword)) {
        showPasswordError(
          "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
        );
        return;
      }

      try {
        await changePassword(oldPassword, newPassword, token);
        showAlert("Contraseña cambiada exitosamente.", "success");
        exitChangePasswordMode();
        clearPasswordInputs();
        hidePasswordError();
      } catch (err) {
        console.error("Error cambiando contraseña:", err.message);
        showPasswordError(err.message || "Error cambiando la contraseña.");
      }
    });
}

function getUserIdFromToken(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    return decodedPayload.sub || decodedPayload.UserId || decodedPayload.nameid;
  } catch (e) {
    console.warn("Error decodificando token:", e);
    return null;
  }
}

async function loadUserData() {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken(token);
  if (!token || !userId) return;

  try {
    const user = await getUserById(userId, token);
    document.getElementById("firstName").value = user.firstName;
    document.getElementById("lastName").value = user.lastName;
    document.getElementById("email").value = user.email;
    document.getElementById("dni").value = user.dni;

    toggleFormEditable(false);
  } catch (error) {
    console.error("Error cargando datos del usuario:", error.message);
  }
}

function toggleFormEditable(editable) {
  ["firstName", "lastName", "email", "dni"].forEach((id) => {
    document.getElementById(id).readOnly = !editable;
  });

  if (!isChangingPassword) {
    document.getElementById("edit-btn").style.display = editable
      ? "none"
      : "inline";
  } else {
    document.getElementById("edit-btn").style.display = "none";
  }

  document.getElementById("edit-btns").style.display = editable
    ? "flex"
    : "none";
}

function clearPasswordInputs() {
  document.getElementById("oldPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
}

export async function handleLogout() {
  const refreshToken = localStorage.getItem("refreshToken");
  const accessToken = localStorage.getItem("token");

  if (!refreshToken || !accessToken) {
    cleanupSession();
    return;
  }

  try {
    await logout(refreshToken, accessToken);
  } catch (error) {
    console.warn("Logout API error:", error.message);
  }
  cleanupSession();
}

function cleanupSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("lastPage");

  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.innerHTML = "";
  }

  loadLoginView();
}

function showPasswordError(message) {
  const errorEl = document.getElementById("password-error");
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}
function hidePasswordError() {
  const errorEl = document.getElementById("password-error");
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}
function validatePasswordStrength(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

function enterEditMode() {
  isEditingProfile = true;
  isChangingPassword = false;

  toggleFormEditable(true);

  editBtnsGroup.style.display = "flex";
  changePasswordBtn.style.display = "none";
  logoutBtn.style.display = "none";
  changePasswordSection.classList.add("hidden");
  editBtn.style.display = "none";
}

function exitEditMode() {
  isEditingProfile = false;
  toggleFormEditable(false);
  editBtnsGroup.style.display = "none";
  changePasswordBtn.style.display = "block";
  logoutBtn.style.display = "block";
  changePasswordSection.classList.add("hidden");
  editBtn.style.display = "inline";
}

function enterChangePasswordMode() {
  isChangingPassword = true;
  isEditingProfile = false;

  changePasswordSection.classList.remove("hidden");
  editBtn.style.display = "none";
  logoutBtn.style.display = "none";
  changePasswordBtn.style.display = "none";

  toggleFormEditable(false);
  editBtnsGroup.style.display = "none";
}

function exitChangePasswordMode() {
  isChangingPassword = false;

  changePasswordSection.classList.add("hidden");
  editBtn.style.display = "inline";
  changePasswordBtn.style.display = "block";
  logoutBtn.style.display = "block";
}
