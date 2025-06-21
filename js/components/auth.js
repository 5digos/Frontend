import { AUTH_URLS } from "./utilities.js";
import { showErrorAlert } from "./alerts.js";
import { showSpinner, hideSpinner } from "./spinners.js";


export async function logout() {

    localStorage.removeItem('token');

    try {
        const refreshToken = localStorage.getItem('refreshToken');

        showSpinner();

        if (!refreshToken) {
            setTimeout(() => {
                hideSpinner();
                window.location.href = '../pages/auth.html';
            }, 2000);
            return; 
        }

        const response = await fetch(AUTH_URLS.LOGOUT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({refreshToken})
        });
    
        localStorage.removeItem('refreshToken');

        setTimeout(() => {
            hideSpinner();
            window.location.href = '../pages/auth.html';
        }, 2000); 
    }
    catch (error){
        console.log("Se produjo un error al desloguear el usuario");
        hideSpinner();
        showErrorAlert();
    }
}

export function setupLogoutEvent() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            logout(); 
        });
    }
}

