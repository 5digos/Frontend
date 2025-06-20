import { setupAuthForm } from "./main.js";

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

  // tab activo
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

    form.innerHTML =
      tab === "login" ? getLoginFormHTML() : getRegisterFormHTML();

    setupAuthForm();
  }

  // tab login
  function getLoginFormHTML() {
    return `
      <div>
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
        <input type="email" id="email" class="${inputFieldClass}" placeholder="name@email.com" required autocomplete="off" />
      </div>
      <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
        <input type="password" id="password" class="${inputFieldClass}" placeholder="••••••••" required autocomplete="off" />
      </div>
      <button type="submit" class="${submitButtonClass}">Iniciar sesión</button>
    `;
  }

  // tab register
  function getRegisterFormHTML() {
    return `
      <div>
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
        <input type="email" id="email" class="${inputFieldClass}" placeholder="name@email.com" required autocomplete="off"/>
      </div>
      <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
        <input type="password" id="password" class="${inputFieldClass}" placeholder="••••••••" required autocomplete="off"/>
      </div>
      <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirmar contraseña</label>
        <input type="password" id="confirmPassword" class="${inputFieldClass}" placeholder="••••••••" required autocomplete="off"/>
      </div>
      <button type="submit" class="${submitButtonClass}">Registrarse</button>
    `;
  }

  const inputFieldClass = `border border-stone-300 text-stone-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`;
  const submitButtonClass = `w-full p-2 mt-2 bg-red-500 hover:bg-red-600 rounded shadow-lg cursor-pointer`;

  // default
  setActiveTab("login");
}
