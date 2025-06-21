import { AUTH_URLS } from "../components/utilities.js";

import { hideSpinner, showSpinner } from "../components/spinners.js";

import { renewAccessToken } from "../services/renewAccessToken.js";

import { logout } from "../components/auth.js"

export function setupPasswordFormHandler() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        //Validaciones

        if (currentPassword && newPassword === currentPassword) {
            changePasswordAlert('La nueva contraseña no puede ser igual a la contraseña actual.');
            return;
        }

        if (newPassword.length < 8){
            changePasswordAlert('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            changePasswordAlert('La nueva contraseña y la confirmación no coinciden.');
            return;
        }

        const requestBody = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };


        try {

            showSpinner();

            let token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
    

            let response = await fetch(AUTH_URLS.CHANGE_PASSWORD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 401) {
             
                const newToken = await renewAccessToken(token, refreshToken);
    
                if (newToken) {
                    response = await fetch(AUTH_URLS.CHANGE_PASSWORD, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newToken}`
                        },
                        body: JSON.stringify(requestBody)
                    });
                } else {
                    console.log('No se pudo renovar el token, cerrando sesión.');
                    await logout();
                }
            }

            hideSpinner();

            if (response.ok) {

                const result = await response.json();

                changePasswordSuccess();

                togglePasswordForm();

            } else if (response.status === 400) {

                const error = await response.json();

                console.log(error);

                changePasswordAlert(error.message);

            } else {

                changePasswordAlert('Ocurrio un error al intentar cambiar la contraseña. Inténtelo nuevamente.');

            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            changePasswordAlert('Hubo un problema al procesar la solicitud. Inténtelo nuevamente.');

        }
        finally{
            hideSpinner();
        }
    });
}


function changePasswordAlert(errorText){
    if(Swal.isVisible()){
        return;
    };

    Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: errorText,
        footer: '<a href="https://wa.me/5491112345678">¿Aun tiene problemas? ¡Puede contactarnos!</a>',
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
      });
}

function changePasswordSuccess() {
    if (Swal.isVisible()) {
        return;
    };

    Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: '¡Tu contraseña ha sido actualizada exitosamente!',
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
    });
}

export function togglePasswordForm() {
    const form = document.getElementById('password-form');
    form.classList.toggle('hidden');

    const passwordForm = form.querySelector('form'); 
    passwordForm.reset();
}