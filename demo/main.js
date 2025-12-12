// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');

const mongoose = require('mongoose');

const { mongoTool } = require('./mongoTool.js');

// The mongotool variable
let mongotool = null;

// The schema to access the usuarios collection
let usuarioSchema = new mongoose.Schema({
    id : Number,
    nombre : String,
    email : {type: String , lowercase: true}
})

// Assign the schema to the collection
let usuarioModel = mongoose.model("usuarios", usuarioSchema);

// Defining the primary keys combination for the usuarios collection
const usuariosPK = ["nombre", "email"];

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })


  //mainWindow.webContents.openDevTools()

  // and load the index.html of the app and take out the default menu
  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  // Doing the connection to mongodb handling error
  mongoose.connect('mongodb://127.0.0.1:27017/db_usuarios',{ serverSelectionTimeoutMS: 2000 })
  .catch(error => { 
    dialog.showMessageBoxSync({
      type : 'error',
      message : error.message
    });
    app.quit();  
  })
  .then ( () => {
    // Once the connection is done successful
    // setting the mongotool variable
    mongotool = new mongoTool(mongoose);
    // Throwing the window
    createWindow();
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


  // methods to be exported from the main process
  // all methods access the database directly without an API
  // all return a promise
  // the mongoose method return a promise also

  ipcMain.handle('get-usuarios', () => {
    return new Promise ( (resolve, reject) => {
      usuarioModel.find().sort('id')
      .then( (data) => {
        // the data must be converted to a JSON object
        resolve(JSON.parse(JSON.stringify(data)));
      })
      .catch( (error) => {
        reject( new Error(error));
      })
    });
  });


  ipcMain.handle('add-usuario', async (event, usuario) => {
    return new Promise ( (resolve, reject) => {      

      // Creating the new usuario form the input object usuario
      let usuarioNuevo = new usuarioModel( {
        nombre : usuario.nombre,
        email : usuario.email
      })

      // Inserting the usuario - passing the model, the newuser, the PKs of usuarios collection and the autoincrement field name (as string)
      // Returns a promise with the result
      mongotool.insert(usuarioModel, usuarioNuevo, usuariosPK, "id")
      .then( value => resolve(value))
      .catch ( error => reject(error));
    });
  });


  ipcMain.handle('edit-usuario', async (event, id, usuario) => {
    return new Promise ( (resolve, reject) => {

      // Creating the update conditions for this update action
      // fields name to be updated
      let fields = ["nombre", "email"];
      // values of the fields to be updated in the same order as fields name
      let values = [usuario.nombre, usuario.email];
      // condition fields name for the update sentence
      let conditionFields = ["id"];
      // condition fields name values for the update sentence in the same order as the condition fields name are defined
      let conditionValues = [id];

      // Updating the usuario - passing the model, the fields and values to be updated, the fields and values of the sentence condition and the PK fields for the usuario collection
      // Returns a promise with the result
      mongotool.update(usuarioModel, fields, values, conditionFields, conditionValues, usuariosPK)
      .then( value => resolve(value))
      .catch ( error => reject(error));
    });
  });


  ipcMain.handle('delete-usuario', async (event, id) => {
    return new Promise ( (resolve, reject) => {

      usuarioModel.deleteOne({id : id})
      .then( (resultado) => {
        if (resultado.deletedCount == 0) throw new Error("No se ha encontrado el registro para ser eliminado")
        else resolve("Eliminado con exito : " + resultado.deletedCount)
      })
      .catch( (error) => {
        reject(new Error(error));
      })
    });
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
  mongoose.connection.close();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.