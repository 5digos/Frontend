import {
  login,
  register,
  logout,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  confirmPasswordReset,
} from "./api/auth.js";
import { getAuthenticated } from "./state.js";
import { loadLoginView, initializeApp } from "./main.js";
import { showSpinner, hideSpinner } from "./components/spinners.js";
import { showAlert } from "./components/alerts.js";

let formContainer;
let loginTab;
let registerTab;
let tabs;

// cargar tabs
export function setupAuthTabs() {
  formContainer = document.getElementById("auth-form");
  loginTab = document.getElementById("login-tab");
  registerTab = document.getElementById("register-tab");
  tabs = document.querySelectorAll(".tab-button");

  loginTab.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("login");
  });

  registerTab.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("register");
  });

  switchTab("login");
}

// cambiar de tab login/register
function switchTab(tab) {
  tabs.forEach((tabEl) => {
    tabEl.classList.remove(...tabActiveClasses);
    tabEl.classList.add(...tabInactiveClasses);
  });

  const activeTabEl = tab === "login" ? loginTab : registerTab;
  activeTabEl.classList.remove(...tabInactiveClasses);
  activeTabEl.classList.add(...tabActiveClasses);

  if (tab === "login") {
    renderLoginForm();
  } else {
    renderRegisterForm();
  }
}

// login
function renderLoginForm() {
  setAuthTabMode("login-register");
  formContainer.innerHTML = `
    <input
      type="email"
      id="login-email"
      placeholder="Email"
      class="${inputFieldClass}"
      autocomplete="off"
      required
    />
    <div class="password-input-wrapper relative">
      <input
        type="password"
        id="login-password"
        placeholder="Contraseña"
        class="${inputFieldClass} pr-10"
        required
      />
      <button
        type="button"
        class="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
        aria-label="Mostrar contraseña"
      >
        <i class="fa-solid fa-eye text-stone-300"></i>
      </button>
    </div>
    <p id="login-error" class="text-red-500 text-sm hidden">Email y/o contraseña incorrectos</p>
    <button
      type="submit"
      class="${submitButtonClass}"
    >
      Iniciar Sesión
    </button>
    <p class="text-sm text-center mt-2">
      ¿Problemas para iniciar sesión?
      <a href="#" id="go-to-reset" class="text-red-500 hover:underline">Restablecer contraseña</a>
    </p>
  `;

  formContainer.onsubmit = async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    await handleLogin(email, password);
  };

  document.getElementById("go-to-reset").addEventListener("click", (e) => {
    e.preventDefault();
    renderResetPasswordStep1();
  });

  setupPasswordToggles();
}
// manejar login
async function handleLogin(email, password) {
  try {
    showSpinner();
    const data = await login(email, password);
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    getAuthenticated(true);
    await initializeApp();
  } catch (error) {
    showError(error.message);
  } finally {
    hideSpinner();
  }
}

// recuperar contraseña step1
function renderResetPasswordStep1() {
  setAuthTabMode("reset");
  formContainer.innerHTML = `
  <p class="text-center text-stone-300 mb-4">Introduce tu correo electronico, te enviaremos un codigo para poder cambiar tu contraseña.</p>
    <input
      type="email"
      id="reset-email"
      placeholder="Email"
      class="${inputFieldClass}"
      autocomplete="off"
      required
    />
    <p id="reset-step1-error" class="text-red-500 text-sm hidden mt-1"></p>
    <button type="submit" class="${submitButtonClass}">Enviar código</button>
    <p class="text-sm text-center mt-1">
      <a href="#" id="back-to-login" class="text-white hover:underline">Volver al <span class="text-black dark:text-white font-semibold">login</span></a>
    </p>
  `;

  formContainer.onsubmit = async (event) => {
    event.preventDefault();
    const email = document.getElementById("reset-email").value.trim();
    const errorEl = document.getElementById("reset-step1-error");

    try {
      showSpinner();
      await requestPasswordReset(email);
      showAlert("Se envio un código a tu correo electrónico", "success");
      renderResetPasswordStep2(email);
    } catch (error) {
      errorEl.textContent =
        error.message || "Hubo un error al enviar el código";
      errorEl.classList.remove("hidden");
      showAlert(error.message, "error");
    } finally {
      hideSpinner();
    }
  };

  document.getElementById("back-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    renderLoginForm();
  });
}

// recuperar contraseña step2
function renderResetPasswordStep2(email) {
  formContainer.innerHTML = `
    <p id="reset-instructions" class="text-center mb-4">
      Se envió un código a <strong>${email}</strong>. Ingresalo junto con tu nueva contraseña.
    </p>

    <input
      type="text"
      id="reset-code"
      placeholder="Código de verificación"
      class="${inputFieldClass}"
      autocomplete="off"
      required
    />

    <div class="password-input-wrapper relative">
      <input
        type="password"
        id="reset-new-password"
        placeholder="Nueva contraseña"
        class="${inputFieldClass} pr-10"
        required
      />
      <button
        type="button"
        class="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
        aria-label="Mostrar contraseña"
      >
        <i class="fa-solid fa-eye text-stone-300"></i>
      </button>
    </div>

    <div class="password-input-wrapper relative mt-2">
      <input
        type="password"
        id="reset-confirm-password"
        placeholder="Confirmar contraseña"
        class="${inputFieldClass} pr-10"
        required
      />
      <button
        type="button"
        class="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
        aria-label="Mostrar contraseña"
      >
        <i class="fa-solid fa-eye text-stone-300"></i>
      </button>
    </div>

    <p id="code-error" class="text-red-500 text-sm hidden mt-1"></p>
    <p id="match-error" class="text-red-500 text-sm hidden mt-1"></p>
    <p id="strength-error" class="text-red-500 text-sm hidden mt-1"></p>

    <button type="submit" class="${submitButtonClass}">Restablecer contraseña</button>

    <p class="text-sm text-center mt-2">
      ¿No te llegó el código?
      <a href="#" id="resend-reset-code" class="text-red-500 hover:underline">Reenviar</a>
    </p>

    <p class="text-sm text-center mt-1">
      <a href="#" id="back-to-login" class="text-white hover:underline">Volver al <span class="text-black dark:text-white font-semibold">login</span></a>
    </p>
  `;

  formContainer.onsubmit = async (event) => {
    event.preventDefault();

    const code = document.getElementById("reset-code").value.trim();
    const password = document.getElementById("reset-new-password").value;
    const confirm = document.getElementById("reset-confirm-password").value;

    const codeError = document.getElementById("code-error");
    const matchError = document.getElementById("match-error");
    const strengthError = document.getElementById("strength-error");

    codeError.classList.add("hidden");
    matchError.classList.add("hidden");
    strengthError.classList.add("hidden");

    if (password !== confirm) {
      matchError.textContent = "Las contraseñas no coinciden";
      matchError.classList.remove("hidden");
      return;
    }

    if (!validatePasswordStrength(password)) {
      strengthError.textContent =
        "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y un caracter especial";
      strengthError.classList.remove("hidden");
      return;
    }

    try {
      showSpinner();
      await confirmPasswordReset(email, code, password);
      showAlert("Se restablecio la contraseña correctamente", "success");

      renderLoginForm();

      const messageEl = document.createElement("p");
      messageEl.textContent =
        "Contraseña restablecida correctamente. Por favor, inicia sesión nuevamente.";
      messageEl.className = "text-stone-200 text-center mb-3";

      formContainer.prepend(messageEl);
    } catch (error) {
      codeError.textContent = error.message || "Código incorrecto";
      showAlert(error.message || "Código incorrecto", "error");
      codeError.classList.remove("hidden");
    } finally {
      hideSpinner();
    }
  };

  document.getElementById("back-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    renderLoginForm();
  });

  document
    .getElementById("resend-reset-code")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const instructionsEl = document.getElementById("reset-instructions");

      try {
        showSpinner();
        await requestPasswordReset(email);
        showAlert("Se reenvio un código a tu correo electrónico", "success");
        instructionsEl.innerHTML = `
        Se <span class="text-red-500 font-bold">reenvió</span> un código a <strong>${email}</strong>. Ingresalo junto con tu nueva contraseña.
      `;
      } catch (error) {
        instructionsEl.innerHTML = `
        <span class="text-red-500 font-semibold">Error:</span> ${
          error.message || "No se pudo reenviar el código."
        }
      `;
        showAlert(error.message || "No se pudo reenviar el código.", "error");
      } finally {
        hideSpinner();
      }
    });

  setupPasswordToggles();
}

// register
function renderRegisterForm() {
  setAuthTabMode("login-register");
  formContainer.innerHTML = `
    <input type="text" id="register-firstname" placeholder="Nombre" class="${inputFieldClass}" required />
    <input type="text" id="register-lastname" placeholder="Apellido" class="${inputFieldClass}" required />
    <input type="number" id="register-dni" placeholder="DNI" class="${inputFieldClass}" required />
    <input type="email" id="register-email" placeholder="Email" class="${inputFieldClass}" required />

    <div class="password-input-wrapper relative">
      <input type="password" id="register-password" placeholder="Contraseña" class="${inputFieldClass} pr-10" required />
      <button type="button" class="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
        <i class="fa-solid fa-eye text-stone-300"></i>
      </button>
    </div>

    <div class="password-input-wrapper relative mt-2">
      <input type="password" id="register-confirm-password" placeholder="Confirmar contraseña" class="${inputFieldClass} pr-10" required />
      <button type="button" class="password-toggle absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
        <i class="fa-solid fa-eye text-stone-300"></i>
      </button>
    </div>

    <p id="match-error" class="text-red-500 text-sm hidden mt-1"></p>
    <p id="strength-error" class="text-red-500 text-sm hidden mt-1"></p>
    <p id="register-error" class="text-red-500 text-sm hidden mt-1"></p>

    <button type="submit" class="${submitButtonClass}">Registrarse</button>
  `;

  formContainer.onsubmit = async (event) => {
    event.preventDefault();
    const firstname = document
      .getElementById("register-firstname")
      .value.trim();
    const lastname = document.getElementById("register-lastname").value.trim();
    const dni = document.getElementById("register-dni").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm-password").value;

    const matchError = document.getElementById("match-error");
    const strengthError = document.getElementById("strength-error");

    matchError.classList.add("hidden");
    strengthError.classList.add("hidden");

    if (password !== confirm) {
      matchError.textContent = "Las contraseñas no coinciden";
      matchError.classList.remove("hidden");
      return;
    }

    if (!validatePasswordStrength(password)) {
      strengthError.textContent =
        "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y un caracter especial";
      strengthError.classList.remove("hidden");
      return;
    }

    try {
      showSpinner();
      await register(firstname, lastname, email, dni, password);
      showAlert("Se envio un código a tu correo electrónico", "success");
      renderVerifyEmailView(email);
    } catch (error) {
      const registerError = document.getElementById("register-error");
      registerError.textContent = error.message || "Error al registrarse";
      registerError.classList.remove("hidden");
      showAlert(error.message || "Error al registrarse", "error");
    } finally {
      hideSpinner();
    }
  };

  setupPasswordToggles();
}

// verificar email
function renderVerifyEmailView(email) {
  setAuthTabMode("login-register");
  formContainer.innerHTML = `
    <p id="verify-instructions" class="text-center mb-4">
      Se envió un código de verificación a <strong>${email}</strong>. Ingresalo para verificar tu cuenta.
    </p>
    <input
      type="text"
      id="verify-code"
      placeholder="Código"
      class="${inputFieldClass}"
      autocomplete="off"
      required
    />
    <p id="verify-error" class="text-red-500 text-sm hidden mt-1"></p>
    <button type="submit" class="${submitButtonClass}">Verificar Email</button>
    <p class="text-sm text-center mt-2">
      ¿No te llegó el código?
      <a href="#" id="resend-code" class="text-red-500 hover:underline">Reenviar</a>
    </p>
  `;

  formContainer.onsubmit = async (event) => {
    event.preventDefault();
    const code = document.getElementById("verify-code").value.trim();
    const errorEl = document.getElementById("verify-error");

    errorEl.classList.add("hidden");

    try {
      showSpinner();
      await verifyEmail(email, code);

      renderLoginForm();
      showAlert("Registro exitoso.", "success");

      const messageEl = document.createElement("p");
      messageEl.textContent = "Registro exitoso. Por favor, inicia sesión.";
      messageEl.className = "text-stone-200 text-center mb-3";

      formContainer.prepend(messageEl);
    } catch (error) {
      errorEl.textContent = error.message || "Código incorrecto";
      showAlert(error.message || "Error al registrarse", "error");
      errorEl.classList.remove("hidden");
    } finally {
      hideSpinner();
    }
  };

  document
    .getElementById("resend-code")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const instructionsEl = document.getElementById("verify-instructions");

      try {
        showSpinner();
        await resendVerificationEmail(email);
        showAlert("Se reenvio un código a tu correo electrónico", "success");
        instructionsEl.innerHTML = `
        Se <span class="text-red-500 font-bold">reenvió</span> un código de verificación a <strong>${email}</strong>. Ingresalo para verificar tu cuenta.
      `;
      } catch (error) {
        instructionsEl.innerHTML = `
        <span class="text-red-500 font-semibold">Error:</span> ${
          error.message || "No se pudo reenviar el código."
        }
      `;
        showAlert(error.message || "No se pudo reenviar el código.", "error");
      } finally {
        hideSpinner();
      }
    });
}

// ocultar/mostrar contraseña
export function setupPasswordToggles() {
  const toggles = document.querySelectorAll(".password-toggle");

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".password-input-wrapper");
      if (!wrapper) return;

      const input = wrapper.querySelector("input");
      if (!input) return;

      const icon = btn.querySelector("i");
      const isPassword = input.type === "password";

      input.type = isPassword ? "text" : "password";

      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }

      btn.setAttribute(
        "aria-label",
        isPassword ? "Ocultar contraseña" : "Mostrar contraseña"
      );
    });
  });
}

// validar contraseña
function validatePasswordStrength(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// helpers de errores
function showError(message) {
  const errorEl = document.getElementById("login-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  } else {
    alert(message);
  }
}

// ocultar/mostrar tabs
function setAuthTabMode(mode) {
  const loginTabLi = document.getElementById("login-tab-li");
  const registerTabLi = document.getElementById("register-tab-li");
  const resetTabLi = document.getElementById("reset-tab-li");

  if (mode === "login-register") {
    loginTabLi?.classList.remove("hidden");
    registerTabLi?.classList.remove("hidden");
    resetTabLi?.classList.add("hidden");
  } else if (mode === "reset") {
    loginTabLi?.classList.add("hidden");
    registerTabLi?.classList.add("hidden");
    resetTabLi?.classList.remove("hidden");
  }
}

// estilos
const tabActiveClasses = [
  "text-red-600",
  "border-red-600",
  "dark:text-red-500",
  "dark:border-red-500",
];
const tabInactiveClasses = [
  "text-stone-900",
  "border-b-transparent",
  "hover:text-stone-950",
  "dark:text-stone-400",
  "dark:hover:text-white",
];

const inputFieldClass = `border border-stone-300 text-stone-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`;
const submitButtonClass = `w-full p-2 mt-2 bg-red-500 hover:bg-red-600 rounded shadow-lg cursor-pointer`;
