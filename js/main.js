import { setupNavLinks, loadPage } from "./navigation.js";
import { setupAuthTabs } from "./auth-tabs.js";

let isAuthenticated = false; // false aparece el login, true aparece el home

// cargar la app
document.addEventListener("DOMContentLoaded", () => {  
    initializeApp();  
});

// document.addEventListener("DOMContentLoaded", () => {
//   if (!isAuthenticated) {
//     loadLoginView();
//   } else {
//     initializeApp();
//   }
// });


// login/register
function loadLoginView() {
  fetch("pages/login.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("main").innerHTML = html;
      setupAuthTabs();
      setupAuthForm();
    });
}

// atenticacion
export function setupAuthForm() {
  const form = document.getElementById("auth-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    isAuthenticated = true;

    initializeApp();
  });
}

// cargar navbar
function initializeApp() {
  fetch("components/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
      setupNavLinks();
    });

  loadPage("home");
}
