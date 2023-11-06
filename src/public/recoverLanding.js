const form = document.getElementById("reset-password-form");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");

// Agrega un evento de escucha al formulario cuando se envíe
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const currentPasswordInput = document.getElementById("current-password");
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const currentPassword = currentPasswordInput.value;

  // Verifica que la nueva contraseña no sea igual a la anterior
  if (newPassword === currentPassword) {
    displayErrorMessage(
      "La nueva contraseña no puede ser igual a la contraseña actual."
    );
    return;
  }

  // Verifica que la nueva contraseña y la confirmación sean iguales
  if (newPassword !== confirmPassword) {
    displayErrorMessage("Las contraseñas no coinciden.");
    return;
  }

  // Verifica que la nueva contraseña cumpla con tus requisitos, como contener "!"
  if (!newPassword.includes("!")) {
    displayErrorMessage("La nueva contraseña debe contener el carácter '!'.");
    return;
  }
  clearErrorMessage();
});

// Agrega un evento de escucha al botón "Restaurar" por separado
const resetButton = document.getElementById("resetPass");
resetButton.addEventListener("click", () => {
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Muestra el mensaje de éxito
  const successMessage = document.getElementById("success-message");
  successMessage.style.display = "block";


  if (newPassword === "") {
    displayErrorMessage("La nueva contraseña no puede estar en blanco.");
    return;
  }

  if (newPassword !== confirmPassword) {
    displayErrorMessage("Las contraseñas no coinciden.");
    return;
  }

  if (!newPassword.includes("!")) {
    displayErrorMessage("La nueva contraseña debe contener el carácter '!'.");
    return;
  }
  clearErrorMessage();
});

// Función para mostrar un mensaje de error
function displayErrorMessage(message) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
}
