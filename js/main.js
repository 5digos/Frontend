import { setupAuthTabs } from "./auth-tabs.js";
import { loadPage, setupNavLinks } from "./navigation.js";
import { getAuthenticated } from "./state.js";

document.addEventListener("DOMContentLoaded", async () => {
    await waitForElement("#main");
    await waitForElement("#navbar");

  if (!getAuthenticated()) {
    loadLoginView();
  } else {
    initializeApp();
  }
});

export function loadLoginView() {
  fetch("pages/login.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("main").innerHTML = html;
      setupAuthTabs();
    });
}

export function initializeApp() {
  fetch("components/navbar.html")
    .then((res) => res.text())
    .then((data) => {
        const navbar = document.getElementById("navbar");
        if (!navbar) {
            console.error("No se encontró el contenedor #navbar");
            return;
        }
        navbar.innerHTML = data;
        setupNavLinks();
    });

  const lastPage = JSON.parse(localStorage.getItem("lastPage"));
  if (lastPage?.page) {
    loadPage(lastPage.page);
  } else {
    loadPage("home");
  }
}

export function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${selector} no apareció en el DOM.`));
        }, timeout);
    });
}
