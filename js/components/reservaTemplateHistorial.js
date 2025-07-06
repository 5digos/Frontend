//reservaTemplate.js
export function reservaTemplateHistorial(prefix = "") {
  const p = (id) => `${prefix}-${id}`;
  return `
    <!-- Imagen clickable -->
    <div class="relative cursor-pointer" onclick="toggleAccordion('main', '${prefix}')">
    <div class="aspect-[4/3] overflow-hidden">
        <img id="${p(
          "vehicle-image"
        )}" src="" alt="" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
    </div>
    <div id="${p(
      "vehicle-title"
    )}" class="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
        <span class="font-semibold">Cargando...</span>
    </div>
    <div class="absolute bottom-3 right-3">
        <svg id="${p(
          "main-arrow"
        )}" class="w-6 h-6 text-white transition-transform duration-300 accordion-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
    </div>
</div>

<!-- Contenido que se despliega -->
<div id="${p(
    "main-content"
  )}" class="accordion-content transition-all duration-500 ease-in-out max-h-0 overflow-hidden ">
    <div class="p-4 space-y-4">
      <div class="bg-accordion border border-gray-600 rounded-lg shadow-sm">
        <button onclick="toggleAccordion('vehicle', '${prefix}')" class="w-full p-4 flex items-center justify-between rounded-t-lg accordion-hover">
          <div class="flex items-center gap-3">
            <span class="material-icons text-blue-400 text-xl">directions_car</span>
            <span class="font-semibold text-white">Datos del Vehículo</span>
          </div>
          <svg id="${p(
            "vehicle-arrow"
          )}" class="w-5 h-5 text-gray-400 accordion-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="${p("vehicle-content")}" class="accordion-content">
          <div class="px-4 pb-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm text-gray-400">Marca y Modelo</span>
                <p id="${p(
                  "vehicle-brand-model"
                )}" class="font-medium text-white">-</p>
              </div>
              <div>
                <span class="text-sm text-gray-400">Año</span>
                <p id="${p(
                  "vehicle-year"
                )}" class="font-medium text-white">-</p>
              </div>
              <div>
                <span class="text-sm text-gray-400">Patente</span>
                <p id="${p(
                  "vehicle-plate"
                )}" class="font-medium text-white">-</p>
              </div>
              <div>
                <span class="text-sm text-gray-400">Precio/hora</span>
                <p id="${p(
                  "vehicle-price"
                )}" class="font-bold text-green-400">-</p>
              </div>
            </div>
            <div class="flex items-center justify-between py-2 border-t border-gray-600">
              <span class="text-sm text-gray-300">Asientos</span>
              <span id="${p(
                "vehicle-seats"
              )}" class="font-medium text-white">-</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-300">Transmisión</span>
              <span id="${p(
                "vehicle-transmission"
              )}" class="font-medium text-white">-</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-300">Categoría</span>
              <span id="${p(
                "vehicle-category"
              )}" class="font-medium text-white">-</span>
            </div>
            <div class="border-t border-gray-600 pt-4">
              <h4 class="font-medium text-white mb-2">Documentos</h4>
              <div id="${p("documents-container")}" class="space-y-2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Datos de la Reserva -->
      <div class="bg-accordion border border-gray-600 rounded-lg shadow-sm">
        <button onclick="toggleAccordion('reservation', '${prefix}')" class="w-full p-4 flex items-center justify-between rounded-t-lg accordion-hover">
          <div class="flex items-center gap-3">
            <span class="material-icons text-green-400 text-xl">calendar_today</span>
            <span class="font-semibold text-white">Datos de la Reserva</span>
          </div>
          <svg id="${p(
            "reservation-arrow"
          )}" class="w-5 h-5 text-gray-400 accordion-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="${p("reservation-content")}" class="accordion-content">
          <div class="px-4 pb-4 space-y-4">
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div class="flex items-start gap-3 mb-2">
                <span class="material-icons text-blue-400 text-lg">place</span>
                <div class="flex-1">
                  <span class="text-sm text-blue-400 font-medium">Sucursal de Retiro</span>
                  <h5 id="${p(
                    "pickup-office-name"
                  )}" class="font-semibold text-white">-</h5>
                </div>
              </div>
              <div id="${p(
                "pickup-office-details"
              )}" class="ml-8 space-y-2 text-gray-300 text-sm hidden">
                <div class="flex items-start gap-2">
                  <span class="material-icons text-gray-300 text-base">place</span>
                  <p id="${p("pickup-office-address")}">-</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-icons text-gray-300 text-base">phone</span>
                  <p id="${p("pickup-office-phone")}">-</p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="material-icons text-gray-300 text-base">info</span>
                  <p id="${p("pickup-office-reference")}" class="text-xs">-</p>
                </div>
              </div>
            </div>

            <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div class="flex items-start gap-3 mb-2">
                <span class="material-icons text-red-400 text-lg">place</span>
                <div class="flex-1">
                  <span class="text-sm text-red-400 font-medium">Sucursal de Devolución</span>
                  <h5 id="${p(
                    "dropoff-office-name"
                  )}" class="font-semibold text-white">-</h5>
                </div>
              </div>
              <div id="${p(
                "dropoff-office-details"
              )}" class="ml-8 space-y-2 text-gray-300 text-sm hidden">
                <div class="flex items-start gap-2">
                  <span class="material-icons text-gray-300 text-base">place</span>
                  <p id="${p("dropoff-office-address")}">-</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-icons text-gray-300 text-base">phone</span>
                  <p id="${p("dropoff-office-phone")}">-</p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="material-icons text-gray-300 text-base">info</span>
                  <p id="${p("dropoff-office-reference")}" class="text-xs">-</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-600 pt-4">
              <h4 class="font-medium text-white mb-2">Horarios Programados</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm text-gray-400">Inicio</span>
                  <p id="${p(
                    "res-date-start"
                  )}" class="font-medium text-white">-</p>
                  <p id="${p(
                    "res-time-start"
                  )}" class="text-sm text-gray-300">-</p>
                </div>
                <div>
                  <span class="text-sm text-gray-400">Fin</span>
                  <p id="${p(
                    "res-date-end"
                  )}" class="font-medium text-white">-</p>
                  <p id="${p(
                    "res-time-end"
                  )}" class="text-sm text-gray-300">-</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-600 pt-4">
              <h4 class="font-medium text-white mb-2">Horarios Reales</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-sm text-gray-400">Retiro Real</span>
                  <p id="${p(
                    "res-date-real-start"
                  )}" class="font-medium text-gray-500">-</p>
                  <p id="${p(
                    "res-time-real-start"
                  )}" class="text-sm text-gray-500">-</p>
                </div>
                <div>
                  <span class="text-sm text-gray-400">Devolución Real</span>
                  <p id="${p(
                    "res-date-real-end"
                  )}" class="font-medium text-gray-500">-</p>
                  <p id="${p(
                    "res-time-real-end"
                  )}" class="text-sm text-gray-500">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Datos del Pago -->
      <div class="bg-accordion border border-gray-600 rounded-lg shadow-sm">
        <button onclick="toggleAccordion('paid', '${prefix}')" class="w-full p-4 flex items-center justify-between rounded-t-lg accordion-hover">
            <div class="flex items-center gap-3">
                <span class="material-icons text-yellow-400 text-xl">paid</span>
                <span class="font-semibold text-white">Datos del Pago</span>
            </div>
            <svg id="${p(
              "paid-arrow"
            )}" class="w-5 h-5 text-gray-400 accordion-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <div id="${p("paid-content")}" class="accordion-content">
          <div class="px-4 pb-4 space-y-4">
            <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div class="flex items-center gap-3 mb-3">
                <span class="material-icons text-yellow-400 text-lg">payment</span>
                <span class="text-sm text-yellow-400 font-medium">Información de Pago</span>
              </div>
              <div class="space-y-3">
                <div class="grid grid-cols-1 gap-3">
                  <div>
                    <span class="text-sm text-gray-400">ID del Pago</span>
                    <p id="${p("payment-id")}" class="font-mono text-white text-sm break-all">-</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm text-gray-400">Fecha</span>
                      <p id="${p("payment-date")}" class="font-medium text-white">-</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-400">Hora</span>
                      <p id="${p("payment-time")}" class="font-medium text-white">-</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm text-gray-400">Monto Total</span>
                      <p id="${p("payment-amount")}" class="font-bold text-green-400">-</p>
                    </div>
                    <div>
                      <span class="text-sm text-gray-400">Método de Pago</span>
                      <p id="${p("payment-method")}" class="font-medium text-white">-</p>
                    </div>
                  </div>
                  <div id="${p("payment-status-container")}" class="hidden">
                    <span class="text-sm text-gray-400">Estado</span>
                    <p id="${p("payment-status")}" class="font-medium">-</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
       </div>
      </div>
    </div>
  `;
}
