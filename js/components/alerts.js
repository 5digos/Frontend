export function showAlert(message, type = "info") {
  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-orange-500 text-white",
  };

  const icons = {
    success: "fa-regular fa-circle-check",
    error: "fa-regular fa-circle-xmark",
    info: "fa-solid fa-circle-info",
    warning: "fa-solid fa-triangle-exclamation",
  };

  let container = document.getElementById("alert-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "alert-container";
    container.className =
      "fixed bottom-22 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center";
    document.body.appendChild(container);
  }

  const alert = document.createElement("div");
  alert.className = `whitespace-nowrap rounded-xl p-4 shadow-md flex items-center gap-2 animate-fade-in-out transition-opacity duration-500 ${
    colors[type] || colors.info
  }`;

  alert.innerHTML = `
    <div class="flex items-center gap-2">
        <i class="bi ${icons[type] || icons.info} text-lg"></i>
        <span class="text-md leading-tight">${message}</span>
    </div>
  `;

  container.appendChild(alert);

  setTimeout(() => {
    alert.classList.add("opacity-0");
    setTimeout(() => alert.remove(), 500);
  }, 3000);
}
