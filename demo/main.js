// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const mongoose = require('mongoose');

const { mongoTool } = require('./mongoTool.js');

try {
  mongoose.connect("mongodb://localhost:27017/db_usuarios");
} catch (err) {
  app.quit();
}

let mongotool = new mongoTool(mongoose);

let usuarioSchema = new mongoose.Schema({
    id : Number,
    nombre : String,
    email : String
})

let usuarioModel = mongoose.model("usuarios", usuarioSchema);

const PK = ["nombre", "email"];

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

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


  // methods to be exported from the main process
  // all methods access the database directly without an API
  // all return a promise

  ipcMain.handle('get-usuarios', () => {
    return new Promise ( (resolve, reject) => {
      usuarioModel.find().sort('id')
      .then( (data) => {
        resolve(JSON.parse(JSON.stringify(data)));
      })
      .catch( (error) => {
        reject( new Error(error));
      })
    });
  });


  ipcMain.handle('add-usuario', async (event, usuario) => {
    return new Promise ( (resolve, reject) => {      

      // Creating the new usuario
      let usuarioNuevo = new usuarioModel( {
        nombre : usuario.nombre,
        email : usuario.email
      })

      // Inserting the usuario
      mongotool.insert(usuarioModel, usuarioNuevo, PK, "id")
      .then( value => resolve(value))
      .catch ( error => reject(error));
    });
  });


  ipcMain.handle('edit-usuario', async (event, id, usuario) => {
    return new Promise ( (resolve, reject) => {

      // Creating the update conditions
      let fields = ["nombre", "email"];
      let values = [usuario.nombre, usuario.email];
      let conditionFields = ["id"];
      let conditionValues = [id];

      // Updating the usuario
      mongotool.update(usuarioModel, fields, values, conditionFields, conditionValues, PK)
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




















// Funciones utiles para aplicaciones con MongoDB


// Función que comprueba si un registro existe
// pks seria un array con los campos que actuan de clave primaria
// valores sería un array con los valores a comprobar
async function existeRegistro(model, pks, valores) {
    let encontrado = false;
    let data = await model.find();
    
    // se utiliza for...of porque necesitamos lanzar un break
    for (elemento of data) {
        let registroExiste = true;

        if (pks.length > 0 && valores.length >0)
            pks.forEach( (campo, index) => {
                // se debe utilizar la sintaxis de array asociativo
                if (index < valores.length)
                    if (elemento[campo] != valores[index]) registroExiste = false
            })

        if (registroExiste) {
            encontrado = true;
            break;
        }
    }
    return encontrado;
}


// Funcion que nos daria el siguiente valor de un campo autoincrementable
async function newValueAutoInc(model, autoIncField) {
    let arrayIds = [];
    let data = await model.find();
    data.forEach( (elemento) => {
        arrayIds.push(elemento[autoIncField]);
    })
    if (arrayIds.length > 0) return Math.max(...arrayIds) + 1;
    else return 1;
}

// Función que verifica si el registro que le pasamos es valido
// Se utiliza a la hora de hacer un update
// Se comprueba si el registro actualizado aparece más de una vez en cuyo caso el registro modificado no sería valido
// Si unicamente aparece una única vez el registro modificado sería valido
async function verifyRegistro(model, pks, valores) {
     let data = await model.find();
     let contador = 0;
     if ((pks.length > 0) && (valores.length >0)) {
        for (elemento of data) {
            let registroOk = true;
            pks.forEach( (campo, index) => {
                // se debe utilizar la sintaxis de array asociativo
                if (index < valores.length)
                    if (elemento[campo] != valores[index]) registroOk = false;
            })
            if (registroOk) contador++;
        }
     }
     if (contador > 1) return false;
     else return true;
}