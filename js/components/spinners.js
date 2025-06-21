export function showSpinner() {
    // Verifica si ya existe el spinner
    if (document.getElementById('loading-spinner')) {
        console.warn('El spinner ya está activo.');
        return; // Si ya existe, no hace nada
    }

    // Crea el overlay y spinner
    const overlay = document.createElement('div');
    overlay.id = 'loading-spinner';
    overlay.className = 'loading-overlay active';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    overlay.appendChild(spinner);

    // Agrega el overlay al body
    document.body.appendChild(overlay);
}

// Función para ocultar el spinner

export function hideSpinner() {
    const overlay = document.getElementById('loading-spinner');
    if (overlay) {
        overlay.classList.remove('active'); // Remueve la clase para la transición
        setTimeout(() => {
            if (document.getElementById('loading-spinner')) {
                overlay.remove(); // Elimina el overlay tras la transición
                console.log('Overlay eliminado correctamente.');
            }
        }, 300);
    } else {
        console.warn('No se encontró el overlay para ocultar.');
    }

}
