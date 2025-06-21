import { AUTH_URLS } from "../components/utilities.js";

export const renewAccessToken = async (expiredAccessToken, refreshToken) => {

    console.log('AccessToken:', expiredAccessToken);
    console.log('RefreshAccessToken:', refreshToken);
    try {
        const response = await fetch(AUTH_URLS.REFRESH_TOKEN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                expiredAccessToken, 
                refreshToken 
            })
        });

        console.log('Renew status code:', response.status);
        if (response.ok) {
            const data = await response.json();

            // Verifica el resultado
            if (data.result) {
                const { token: newAccessToken, refreshToken: newRefreshToken } = data;

                if (newAccessToken && newRefreshToken) {
                    localStorage.setItem('token', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    console.log('Nuevo token:', localStorage.getItem('token'));
                    console.log('Otro Token:', localStorage.getItem('refreshToken'));
                }

                return newAccessToken; 
            } else {
                console.error('No se pudo renovar el token:', data.message);
                return null;
            }
        } else {
            console.error('Error en la respuesta del servidor al renovar el token.');
            return null;
        }
    } catch (error) {
        console.error('Error al intentar renovar el token:', error);
        return null;
    }

};


