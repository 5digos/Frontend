import {
  login,
  register,
  logout,
  verifyEmail,
  resendVerificationEmail,
} from "./api/auth.js";
import { loadLoginView, initializeApp } from "./main.js";
import { getAuthenticated } from "./state.js";

let emailToVerify = null;
let tempPassword = null;

export function setupAuthForm() {
  const form = document.getElementById("auth-form");
  if (!form) return;

  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginTabActive = document
      .getElementById("login-tab")
      .classList.contains("text-red-600");

    if (loginTabActive) {
      const email = newForm.querySelector("#email").value.trim();
      const password = newForm.querySelector("#password").value.trim();

      try {
        const data = await login(email, password);
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        getAuthenticated(true);
        initializeApp();
      } catch (error) {
        alert(error.message || "Error en login");
      }
    } else {
      const codeInput = newForm.querySelector("#verificationCode");
      if (codeInput) {
        const code = codeInput.value.trim();
        try {
          await verifyEmail(emailToVerify, code);

          const loginData = await login(emailToVerify, tempPassword);
          localStorage.setItem("token", loginData.accessToken);
          localStorage.setItem("refreshToken", loginData.refreshToken);
          alert("Email verificado y sesión iniciada con éxito.");

          initializeApp();
        } catch (error) {
          alert(error.message || "Código incorrecto");
        }
        return;
      }

      const firstName = newForm.querySelector("#firstName").value.trim();
      const lastName = newForm.querySelector("#lastName").value.trim();
      const dni = newForm.querySelector("#dni").value.trim();
      const email = newForm.querySelector("#email").value.trim();
      const password = newForm.querySelector("#password").value.trim();
      const confirmPassword = newForm
        .querySelector("#confirmPassword")
        .value.trim();

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      try {
        await register(firstName, lastName, email, dni, password);
        emailToVerify = email;
        tempPassword = password;
        alert("Te enviamos un código de verificación a tu email");

        newForm.innerHTML = `
          <p class="text-md text-stone-800 dark:text-stone-300">
            Se envió un código de verificación a 
            <span class="text-black dark:text-white font-semibold">${email}</span>. Ingresalo para verificar tu cuenta.
          </p>
          <input type="text" id="verificationCode" class="${inputFieldClass}" placeholder="Código de verificación" required autocomplete="off"/>
          <button type="submit" class="${submitButtonClass}">Verificar Email</button>
          <p class="mt-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer hover:underline text-center" id="resendCode">
          ¿No te llegó el código? <span class="text-black dark:text-white font-semibold">Reenviar</span>
          </p>
          `;

        // 🆕 Reenviar código de verificación
        document
          .getElementById("resendCode")
          .addEventListener("click", async () => {
            try {
              await resendVerificationEmail(email);
              alert("Se reenvió el código de verificación a tu email.");
            } catch (error) {
              alert(error.message || "Error al reenviar el código");
            }
          });
      } catch (error) {
        alert(error.message || "Error en registro");
      }
    }

    // 🆕 Activar funcionalidad de mostrar/ocultar contraseña después de renderizar el form
    setupPasswordToggles();
  });

  // 🆕 También ejecutar por si ya hay inputs en este form inicial
  setupPasswordToggles();
}

// tabs de login/register
export function setupAuthTabs() {
  const loginTab = document.getElementById("login-tab");
  const registerTab = document.getElementById("register-tab");
  const form = document.getElementById("auth-form");

  if (!loginTab || !registerTab || !form) return;

  loginTab.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveTab("login");
  });

  registerTab.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveTab("register");
  });

  function setActiveTab(tab) {
    const activeClasses = [
      "text-red-600",
      "border-red-600",
      "dark:text-red-500",
      "dark:border-red-500",
    ];
    const inactiveClasses = [
      "text-stone-900",
      "border-b-transparent",
      "hover:text-stone-950",
      "dark:text-stone-400",
      "dark:hover:text-white",
    ];

    if (tab === "login") {
      loginTab.classList.add(...activeClasses);
      loginTab.classList.remove(...inactiveClasses);

      registerTab.classList.remove(...activeClasses);
      registerTab.classList.add(...inactiveClasses);
    } else {
      registerTab.classList.add(...activeClasses);
      registerTab.classList.remove(...inactiveClasses);

      loginTab.classList.remove(...activeClasses);
      loginTab.classList.add(...inactiveClasses);
    }

    document.getElementById("auth-form").innerHTML =
      tab === "login" ? getLoginForm() : getRegisterForm();

    setupAuthForm(); // reiniciar el form
  }

  function getLoginForm() {
    return `
    <input type="email" id="email" class="${inputFieldClass}" placeholder="Email" required autocomplete="off" />

    <div class="relative">
      <input type="password" id="password" class="${inputFieldClass} pr-10" placeholder="Contraseña" required autocomplete="off" />
      <button type="button" id="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 dark:text-stone-300 cursor-pointer">
        <i class="fa-solid fa-eye" id="eyeIcon"></i>
      </button>
    </div>

    <button type="submit" class="${submitButtonClass}">Iniciar sesión</button>
  `;
  }

  function getRegisterForm() {
    return `
    <input type="text" id="firstName" class="${inputFieldClass}" placeholder="Nombre" required autocomplete="off"/>
    <input type="text" id="lastName" class="${inputFieldClass}" placeholder="Apellido" required autocomplete="off"/>
    <input type="number" id="dni" class="${inputFieldClass}" placeholder="DNI" required autocomplete="off"/>
    <input type="email" id="email" class="${inputFieldClass}" placeholder="Email" required autocomplete="off"/>
    
    <div class="relative">
      <input type="password" id="password" class="${inputFieldClass} pr-10" placeholder="Contraseña" required autocomplete="off"/>
      <button type="button" id="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 dark:text-stone-300 cursor-pointer">
        <i class="fa-solid fa-eye" id="eyeIcon"></i>
      </button>
    </div>

    <div class="relative">
      <input type="password" id="confirmPassword" class="${inputFieldClass} pr-10" placeholder="Confirmar contraseña" required autocomplete="off"/>
      <button type="button" id="toggleConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 dark:text-stone-300 cursor-pointer">
        <i class="fa-solid fa-eye" id="eyeConfirmPassword"></i>
      </button>
    </div>

    <button type="submit" class="${submitButtonClass}">Registrarse</button>
  `;
  }

  setActiveTab("login");
}

// 🆕 Función para activar toggle en todos los campos de contraseña
function setupPasswordToggles() {
  const toggleConfigs = [
    { inputId: "password", buttonId: "togglePassword", iconId: "eyeIcon" },
    {
      inputId: "confirmPassword",
      buttonId: "toggleConfirmPassword",
      iconId: "eyeConfirmPassword",
    },
  ];

  toggleConfigs.forEach(({ inputId, buttonId, iconId }) => {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);

    if (input && button) {
      button.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";

        if (icon) {
          icon.classList.toggle("fa-eye");
          icon.classList.toggle("fa-eye-slash");
        }
      });
    }
  });
}

export const inputFieldClass = `border border-stone-300 text-stone-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`;
export const submitButtonClass = `w-full p-2 mt-2 bg-red-500 hover:bg-red-600 rounded shadow-lg cursor-pointer`;

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
  loadLoginView();
}
