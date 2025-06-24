import { setupAuthTabs, setupAuthForm } from "./auth-tabs.js";
import { loadPage, setupNavLinks } from "./navigation.js";
import { getAuthenticated } from "./state.js";

document.addEventListener("DOMContentLoaded", () => {
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
      setupAuthForm();
    });
}

export function initializeApp() {
  fetch("components/navbar.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navbar").innerHTML = data;
      setupNavLinks();
    });

  const lastPage = JSON.parse(localStorage.getItem("lastPage"));
  if (lastPage?.page) {
    loadPage(lastPage.page);
  } else {
    loadPage("home");
  }
}
