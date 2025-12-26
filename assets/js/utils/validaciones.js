// assets/js/utils/validaciones.js

function validarFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], select[required]');
    let esValido = true;

    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        if (!input.value || input.value.trim() === '') {
            input.classList.add('is-invalid');
            esValido = false;
        } else {
            input.classList.add('is-valid');
        }
    });

    if (!esValido) {
        mostrarNotificacion('❌ Complete todos los campos requeridos', 'error');
    }

    return esValido;
}