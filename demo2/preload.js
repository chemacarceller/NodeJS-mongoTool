/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const  { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('app', {
    loadUsers : () => ipcRenderer.invoke('get-usuarios'),
    editUser : (id, usuario) => ipcRenderer.invoke('edit-usuario', id, usuario),
    addUser : (usuario) => ipcRenderer.invoke('add-usuario', usuario),
    deleteUser : (id) => ipcRenderer.invoke('delete-usuario', id)
});


