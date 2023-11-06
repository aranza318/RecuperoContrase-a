const restorePassword = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    const data = { email, password }; // Crear objeto con los datos a enviar
  
    const response = await fetch("/api/sessions/recover", {
      method: "POST",
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(data), // Enviar datos en el cuerpo de la solicitud como JSON
    });
  
    const responseData = await response.json();
    if (responseData.status === 200) {
      window.location.href = responseData.redirect;
    }
  };
  
  document.addEventListener("DOMContentLoaded", function () {
    const cambiarClaveButton = document.querySelector(".botons");
    cambiarClaveButton.addEventListener("click", () => {
      window.location.href = "/restore";
    });
    
    function sendRestoreLink() {
      // Obtener el valor del campo de correo electrónico
      const email = document.getElementById('email').value;
  
      // Crear un objeto FormData para enviar el valor del campo de correo electrónico al servidor
      const formData = new FormData();
      formData.append('email', email);
  
      // Realizar la solicitud HTTP al servidor en la ruta correcta
      fetch('/api/email/sendRestoreLink', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          // Aquí puedes manejar la respuesta del servidor, por ejemplo, mostrar un mensaje de éxito o error
          console.log(data);
        })
        .catch(error => {
          // Aquí puedes manejar los errores de la solicitud HTTP
          console.error(error);
        });
    }
  
    // Elimina cualquier otra referencia al campo de contraseña en tu código
  });