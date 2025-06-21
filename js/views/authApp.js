import { hideSpinner, showSpinner } from "../components/spinners.js";
import { AUTH_URLS, parseJwt } from "../components/utilities.js";
import { renewAccessToken } from "../services/renewAccessToken.js";


document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
});


// store email for verification
let registeredEmail = '';

async function initializeApp(){
    await checkLogin();
    loadPage();
}

//Chequear si el usuario esta logeado o no.

async function checkLogin() {
    const token = await renewAccessToken(localStorage.getItem('token'), localStorage.getItem('refreshToken'));

    if (token){
        loginUser(token);
    }
    else{
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }
}


//Funciones de la pagina.

function loadPage(){
    document.querySelector("#registerForm a").addEventListener("click", showLoginForm);
    document.querySelector("#loginForm a").addEventListener("click", showRegisterForm);
    document.querySelector("#resetPassword").addEventListener("click", showRestoreForm);
    document.querySelector("#restoreAgain").addEventListener("click", showRestoreForm);
    document.querySelector("#restoreButton").addEventListener("click", handleRestore);

    document.querySelector("#registerForm button").addEventListener("click", function (event) {
        event.preventDefault();
        handleRegister();
    });

    document.querySelector("#loginForm button").addEventListener("click", function (event) {
        event.preventDefault();
        handleLogin();
    });

    // toggle password visibility
    const toggle = document.getElementById("togglePassword");
    if (toggle) {
        toggle.addEventListener('click', function() {
            const pwd = document.getElementById('loginPassword');
            const eye = document.getElementById('eyeIcon');
            const eyeOff = document.getElementById('eyeOffIcon');
            if (pwd.type === 'password') {
                pwd.type = 'text';
                eye.classList.add('hidden');
                eyeOff.classList.remove('hidden');
            } else {
                pwd.type = 'password';
                eye.classList.remove('hidden');
                eyeOff.classList.add('hidden');
            }
        });
    }

    // registration password toggle
    const toggleReg = document.getElementById('togglePasswordReg');
    if (toggleReg) {
        toggleReg.addEventListener('click', function() {
            const pwdReg = document.getElementById('password');
            const eyeReg = document.getElementById('eyeIconReg');
            const eyeOffReg = document.getElementById('eyeOffIconReg');
            if (pwdReg.type === 'password') {
                pwdReg.type = 'text';
                eyeReg.classList.add('hidden');
                eyeOffReg.classList.remove('hidden');
            } else {
                pwdReg.type = 'password';
                eyeReg.classList.remove('hidden');
                eyeOffReg.classList.add('hidden');
            }
        });
    }
    // reset password visibility toggle
    const toggleReset = document.getElementById('togglePasswordReset');
    if (toggleReset) {
        toggleReset.addEventListener('click', () => {
            const pwd = document.getElementById('newPasswordReset');
            const eye = document.getElementById('eyeIconReset');
            const eyeOff = document.getElementById('eyeOffIconReset');
            if (pwd.type === 'password') {
                pwd.type = 'text';
                eye.classList.add('hidden');
                eyeOff.classList.remove('hidden');
            } else {
                pwd.type = 'password';
                eye.classList.remove('hidden');
                eyeOff.classList.add('hidden');
            }
        });
    }
    // confirm reset password visibility toggle
    const toggleConfirmReset = document.getElementById('togglePasswordConfirmReset');
    if (toggleConfirmReset) {
        toggleConfirmReset.addEventListener('click', () => {
            const pwd = document.getElementById('confirmNewPasswordReset');
            const eye = document.getElementById('eyeIconConfirmReset');
            const eyeOff = document.getElementById('eyeOffIconConfirmReset');
            if (pwd.type === 'password') {
                pwd.type = 'text';
                eye.classList.add('hidden');
                eyeOff.classList.remove('hidden');
            } else {
                pwd.type = 'password';
                eye.classList.remove('hidden');
                eyeOff.classList.add('hidden');
            }
        });
    }
    // live password rules validation
    const regPwd = document.getElementById('password');
    if (regPwd) {
        regPwd.addEventListener('focus', () => {
            const rules = document.getElementById('passwordRules');
            if (rules) rules.classList.remove('hidden');
        });
        regPwd.addEventListener('input', validatePasswordRules);
        regPwd.addEventListener('blur', () => {
            const rules = document.getElementById('passwordRules');
            if (rules) rules.classList.add('hidden');
        });
    }
    // live password rules validation for reset form
    const resetPwd = document.getElementById('newPasswordReset');
    if (resetPwd) {
        resetPwd.addEventListener('focus', () => {
            const rules = document.getElementById('passwordRulesReset');
            if (rules) rules.classList.remove('hidden');
        });
        resetPwd.addEventListener('input', validatePasswordRulesReset);
        resetPwd.addEventListener('blur', () => {
            const rules = document.getElementById('passwordRulesReset');
            if (rules) rules.classList.add('hidden');
        });
    }

    // Ensure reset password confirm button triggers handler
    const resetBtn = document.getElementById('ResetPasswordButton');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(event) {
            event.preventDefault();
            handleValidateReset();
        });
    }

    // email verification confirm button
    const validateEmailBtn = document.getElementById('validateEmailButton');
    if (validateEmailBtn) {
        validateEmailBtn.addEventListener('click', function(event) {
            event.preventDefault();
            handleValidateEmail();
        });
    }
    // resend verification code link
    const resendEmailLink = document.getElementById('sendAgain');
    if (resendEmailLink) {
        resendEmailLink.addEventListener('click', function(event) {
            event.preventDefault();
            handleResendVerificationEmail();
        });
    }
}

function showRegisterForm() {
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm" ).classList.add("hidden");
}

// function showRegisterForm() {
//     document.getElementById("registerForm").classList.remove("hidden");
//     document.getElementById("loginForm").classList.add("hidden");
//     document.getElementById("restoreForm").classList.add("hidden");
//     document.getElementById("validateResetForm" ).classList.add("hidden");
// }

function showLoginForm() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm").classList.add("hidden");
    document.getElementById("validateEmailForm").classList.add("hidden");
}

function showRestoreForm() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.remove("hidden");
    document.getElementById("validateResetForm" ).classList.add("hidden");
}

function showRestore() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm" ).classList.remove("hidden");
}

// show email validation form
function showValidateEmailForm() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("restoreForm").classList.add("hidden");
    document.getElementById("validateResetForm").classList.add("hidden");
    document.getElementById("validateEmailForm").classList.remove("hidden");
}

async function handleRegister() {
    const firstName = document.getElementById("username").value.trim();
    const lastName = document.getElementById("userLastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const dni = document.getElementById("dni").value.trim();
    const password = document.getElementById("password").value.trim();

    let errores = [];

    if (!firstName) errores.push("Debe proporcionar su nombre.");
    if (!lastName) errores.push("Debe proporcionar su apellido.");
    if (!email || !validateEmail(email)) errores.push("Debe proporcionar un email valido.");
    if (!dni) errores.push("Debe proporcionar un DNI.");
    if (!password) errores.push("Debe ingresar una contraseña.");
    if (password.length > 0 && password.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres.");

    if (errores.length > 0) {
        Swal.fire({
            title: "Atención",
            html: errores.join("<br>"),
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    try {
        showSpinner();
        const response = await fetch(AUTH_URLS.CREATE_USER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, email, dni, password })
        });

        console.log(response.status);
        
        
        if (response.ok) {
            registeredEmail = email;
            Swal.fire({
                title: "¡Éxito!",
                text: "Se envió un código de verificación a tu correo.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            }).then(() => {
                clearAllForm();
                showValidateEmailForm();
            });}
         else {
            // Si el código de estado es 4xx o 5xx, maneja el error
            const errorData = await response.json();
            const errorMessage = errorData.message || "No se pudo crear la cuenta.";
            Swal.fire({
                title: "¡Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "¡Error!",
            text: "Ocurrió un error inesperado durante el registro.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
    }
    finally{
        hideSpinner();
    }
}

// Manejo de inicio de sesión
async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    let errores = [];

    if (!email || !validateEmail(email)) errores.push("Debe proporcionar un email valido.");
    if (!password) errores.push("Debe ingresar su contraseña.");

    if (errores.length > 0) {
        Swal.fire({
            title: "Advertencia",
            html: errores.join("<br>"),
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    const loginData = {
        email: email,  // Usamos las variables previamente definidas
        password: password
    };

    try {
        showSpinner();
        const response = await fetch(AUTH_URLS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            // Maneja el error si la respuesta no es exitosa
            const errorData = await response.json();
            const errorMessage = errorData.message || "No se pudo crear la cuenta.";
            Swal.fire({
                title: "¡Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        } else {
            const data = await response.json();
            // Si el login es exitoso
            Swal.fire({
                title: "¡Éxito!",
                text: 'Has iniciado sesión exitosamente.',
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            }).then(() => {
                localStorage.setItem('refreshToken', data.refreshToken); 
                localStorage.setItem('token', data.accessToken);

                console.log('refreshToken:', localStorage.getItem('refreshToken'));
                console.log('token:', localStorage.getItem('token'));

                const params = new URLSearchParams(window.location.search);
                const redirectUrl = params.get('redirect');

                if (redirectUrl) {
                window.location.href = redirectUrl; 
                } else {
                    // loginUser(data.token);
                }           
            });
        }
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un problema al realizar la solicitud.'
        });
    }finally{
        hideSpinner();
    }
}

async function handleRestore() { 
    const email = document.getElementById("restoreEmail").value.trim();
    if (!email || !validateEmail(email)) {
        Swal.fire({
            title: "Advertencia",
            text: "Debe proporcionar un email valido.",
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    try {
        showSpinner();

        const response = await fetch(AUTH_URLS.PASSWORD_RESET_REQUEST, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Email: email })
        });

        console.log(response.status);

        if (response.status === 200) {
            const data = await response.json();
            Swal.fire({
                title: "¡Éxito!",
                text: "Se envió un código de recuperación a su correo electrónico.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });

            // Ocultar el formulario de solicitud de restablecimiento
            document.getElementById("restoreForm").classList.add("hidden");
            // Mostrar el formulario de validación de código
            document.getElementById("validateResetForm").classList.remove("hidden");
        } else {
            const errorData = await response.json();
            Swal.fire({
                title: "¡Error!",
                text: errorData.Message,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "¡Error!",
            text: "Hubo un problema con la solicitud de restablecimiento.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
    }
    finally{
        hideSpinner();
    }
}

async function handleValidateReset() {
    const email = document.getElementById('restoreEmail').value.trim();
    const code = document.getElementById('resetCode').value.trim();
    const newPassword = document.getElementById('newPasswordReset').value.trim();
    const confirmNewPassword = document.getElementById('confirmNewPasswordReset').value.trim();

    let errores = [];

    if (!code) errores.push("Debe ingresar el código.");
    if (!newPassword) errores.push("Debe ingresar su contraseña.");
    if (newPassword.length > 0 && newPassword.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres.");
    if (confirmNewPassword !== newPassword) errores.push("Ambas contraseñas deben coincidir");

    if (errores.length > 0) {
        Swal.fire({
            title: "Advertencia",
            html: errores.join("<br>"),
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
        return;
    }

    try {
        showSpinner();

        const response = await fetch(AUTH_URLS.PASSWORD_RESET_CONFIRM, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Email: email, ResetCode: code, NewPassword: newPassword })
        });

        console.log(response.status);

        console.log(response);

        if (response.status === 200) {
            const data = await response.json();
            Swal.fire({
                title: "¡Éxito!",
                text: data.message,
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            }).then(() => {
                document.getElementById("validateResetForm").classList.add("hidden");
                document.getElementById("loginForm").classList.remove("hidden");
                clearAllForm();
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                title: "¡Error!",
                text: errorData.message || errorData.Message,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: 'custom-confirm-button',
                    popup: 'custom-swal'
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "¡Error!",
            text: "Hubo un problema con el restablecimiento de la contraseña.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                confirmButton: 'custom-confirm-button',
                popup: 'custom-swal'
            }
        });
    }finally{
        hideSpinner();
    }
}

// validate email with code
async function handleValidateEmail() {
    const code = document.getElementById("emailCode").value.trim();
    if (!code) {
        Swal.fire({ title: "Advertencia", text: "Ingrese el código de verificación.", icon: "warning", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } });
        return;
    }
    try {
        showSpinner();
        const response = await fetch(AUTH_URLS.VERIFY_EMAIL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: registeredEmail, verificationCode: code })
        });
        if (response.ok) {
            Swal.fire({ title: "¡Cuenta confirmada!", text: "Tu correo ha sido validado.", icon: "success", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } })
            .then(() => { clearAllForm(); showLoginForm(); });
        } else {
            const errorData = await response.json();
            Swal.fire({ title: "¡Error!", text: errorData.message || "Código inválido.", icon: "error", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } });
        }
    } catch (error) {
        Swal.fire({ title: "¡Error!", text: "Ocurrió un error de validación.", icon: "error", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } });
    } finally {
        hideSpinner();
    }
}

// resend verification code
async function handleResendVerificationEmail() {
    if (!registeredEmail) return;
    try {
        showSpinner();
        const response = await fetch(AUTH_URLS.RESEND_VERIFICATION_EMAIL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: registeredEmail })
        });
        if (response.ok) {
            Swal.fire({ title: "Código reenviado", text: "Revisa tu correo nuevamente.", icon: "info", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } });
        } else {
            const errorData = await response.json();
            Swal.fire({ title: "¡Error!", text: errorData.message || "No se pudo reenviar el código.", icon: "error", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } });
        }
    } catch (error) {
        Swal.fire({ title: "¡Error!", text: "Ocurrió un error al reenviar.", icon: "error", confirmButtonText: "OK", customClass: { confirmButton: 'custom-confirm-button', popup: 'custom-swal' } });
    } finally {
        hideSpinner();
    }
}

function showSwal(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: "OK",
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        }
    });
}
//export { handleLogin, handleRegister, handleRestore };

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function clearAllForm() {
    const inputs = document.querySelectorAll('input'); 

    inputs.forEach(input => {
        input.value = ''; 
    });
}

// function loginUser(token){
//     const payload = parseJwt(token);
//     window.location.href = '../../src/reservations.html'    
// }

// validate password rules helper
function validatePasswordRules() {
    const pwd = this.value;
    const tests = [
        { id: 'rule-length', ok: pwd.length >= 8, text: 'La contraseña debe tener al menos 8 caracteres' },
        { id: 'rule-lower', ok: /[a-z]/.test(pwd), text: 'Debe contener al menos una letra minúscula' },
        { id: 'rule-upper', ok: /[A-Z]/.test(pwd), text: 'Debe contener al menos una letra mayúscula' },
        { id: 'rule-digit', ok: /\d/.test(pwd), text: 'Debe contener al menos un dígito' },
        { id: 'rule-special', ok: /[@$!%*?&_]/.test(pwd), text: 'Debe contener al menos un símbolo (@$!%*?&_)' }
    ];
    tests.forEach(rule => {
        const el = document.getElementById(rule.id);
        if (!el) return;
        if (rule.ok) {
            el.textContent = `✅ ${rule.text}`;
            el.classList.remove('text-red-500');
            el.classList.add('text-green-500');
        } else {
            el.textContent = `❌ ${rule.text}`;
            el.classList.remove('text-green-500');
            el.classList.add('text-red-500');
        }
    });
}
// validate password rules helper for reset form
function validatePasswordRulesReset() {
    const pwd = document.getElementById('newPasswordReset').value;
    const tests = [
        { id: 'rule-length-reset', ok: pwd.length >= 8, text: 'La contraseña debe tener al menos 8 caracteres' },
        { id: 'rule-lower-reset', ok: /[a-z]/.test(pwd), text: 'Debe contener al menos una letra minúscula' },
        { id: 'rule-upper-reset', ok: /[A-Z]/.test(pwd), text: 'Debe contener al menos una letra mayúscula' },
        { id: 'rule-digit-reset', ok: /\d/.test(pwd), text: 'Debe contener al menos un dígito' },
        { id: 'rule-special-reset', ok: /[@$!%*?&_]/.test(pwd), text: 'Debe contener al menos un símbolo (@$!%*?&_)' }
    ];
    tests.forEach(rule => {
        const el = document.getElementById(rule.id);
        if (!el) return;
        if (rule.ok) {
            el.textContent = `✅ ${rule.text}`;
            el.classList.remove('text-red-500');
            el.classList.add('text-green-500');
        } else {
            el.textContent = `❌ ${rule.text}`;
            el.classList.remove('text-green-500');
            el.classList.add('text-red-500');
        }
    });
}