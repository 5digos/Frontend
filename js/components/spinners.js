export function showSpinner() {
    
    if (document.getElementById('loading-spinner')) {
        console.warn('El spinner ya está activo.');
        return; 
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-spinner';
    overlay.className = 'loading-overlay active';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    overlay.appendChild(spinner);
    
    document.body.appendChild(overlay);
}


export function hideSpinner() {
    const overlay = document.getElementById('loading-spinner');
    if (overlay) {
        overlay.classList.remove('active'); 
        setTimeout(() => {
            if (document.getElementById('loading-spinner')) {
                overlay.remove(); 
                console.log('Overlay eliminado correctamente.');
            }
        }, 400);
    } else {
        console.warn('No se encontró el overlay para ocultar.');
    }

}
