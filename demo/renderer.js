/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('submit-btn').addEventListener('click', handleSubmit);
    document.getElementById('cancel-btn').addEventListener('click', resetForm);

    cargarUsuarios();

    async function handleSubmit() {
        const id = document.getElementById('user-id').value;
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;

        if ((!nombre) || (!email)) { 
            Swal.fire("Error", "Todos los campos son obligatorios", "error");
            return;
        }

        if (id) {
            try {
                await app.editUser(id, {nombre, email});
                Swal.fire("Actualizado", "Usuario actualizado con éxito", "success");
            } catch (err) {
                Swal.fire("Error", err.message.substr(err.message.lastIndexOf('Error')), "error");
            }
        } else {
            try {
                await app.addUser({nombre, email});
                Swal.fire("Añadido", "Usuario añadido con éxito", "success");
            } catch (err) {
                Swal.fire("Error", err.message.substr(err.message.lastIndexOf('Error')), "error");
            }
        }

        resetForm()
        cargarUsuarios();
    }

    function fillForm(usuario) {
        document.getElementById('user-id').value = usuario.id;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('email').value = usuario.email;

        document.getElementById('form-title').textContent="Editar Usuario";
        document.getElementById('submit-btn').textContent="Ok";
        document.getElementById('submit-btn').classList.replace("btn-success", "btn-primary");

        document.getElementById('cancel-btn').classList.remove("d-none");
    }

    function resetForm() {
        document.getElementById('user-id').value = '';
        document.getElementById('nombre').value = '';
        document.getElementById('email').value = '';

        document.getElementById('form-title').textContent="Añadir Usuario";
        document.getElementById('submit-btn').textContent="Añadir";
        document.getElementById('submit-btn').classList.replace("btm-primary", "btn-success");

        document.getElementById('cancel-btn').classList.add("d-none");      
    }

    function cargarUsuarios() {

        const listaUsuarios = document.getElementById('list-usuarios');
        listaUsuarios.innerHTML = '';

        app.loadUsers()
        .then( (usuarios) => {

            usuarios.forEach( (usuario) => {

                let li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                let userText = document.createElement('span');
                userText.textContent = `${usuario.id} - ${usuario.nombre} - ${usuario.email}`;

                let buttonContainer = document.createElement('div');

                let editButton = document.createElement('button');
                editButton.classList.add('btn', 'btn-sm', 'btn-warning', 'me-2');
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => fillForm(usuario));

                let deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-sm', 'btn-warning', 'me-2');
                deleteButton.textContent = 'Eliminar';
                deleteButton.addEventListener('click', () => deleteUsuario(usuario.id));

                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(userText);
                li.appendChild(buttonContainer);

                listaUsuarios.appendChild(li);
            });
        })
        .catch( (error) => {
            Swal.fire("Error", error.message.substr(error.message.lastIndexOf('Error')), "error");
        })
    }

    async function deleteUsuario(id) {
        Swal.fire({
            title : 'Estas seguro ?',
            text : 'Esta acción no se puede deshacer',
            icon : 'warning',
            showCancelButton : true,
            confirmButtonColor : '#d33',
            cancelButtonColor : '#3085d6',
            confirmButtonText : 'Sí, eliminar'
        })
        .then( async (result) => {
            if (result.isConfirmed) {
                try {
                    await app.deleteUser(id);
                    Swal.fire("Eliminado", "Usuario eliminado con éxito", "success");
                } catch (err) {
                    Swal.fire("Error", err.message.substr(err.message.lastIndexOf('Error')), "error");
                }
                cargarUsuarios();
            }
        })
    }
})