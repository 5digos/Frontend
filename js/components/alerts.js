export async function showErrorAlert(){
    
    if(Swal.isVisible()){
        Swal.close();
    };
    
    await Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "¡Ha ocurrido un error! ¡Intente nuevamente mas tarde!",
        footer: '<a href="https://wa.me/5491112345678">¿Aun tiene problemas? ¡Puede contactarnos!</a>',
        heightAuto: false, 
        scrollbarPadding: false,
        customClass: {
            confirmButton: 'custom-confirm-button',
            popup: 'custom-swal'
        },
      });
}