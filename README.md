# NodeJS-mongoTool

This is the development of a Nodejs module that works on mongoose to allow the management of primary keys and auto-incrementing fields within a collection

It consists of an exported class named mongoTool to which a mongoose object must be passed in the constructor but necessarily once the connection to the database is established

Once an object of this class (mongoTool class) is created, there are four public methods available; the methods are : `where`, `insert`, `update` and `delete`, to add, modify or delete a document to the collection taking into account primary keys defined by the developer and the use of a single auto-incrementing field in the collection

The `where` method it is simply used to specify the condition of an update or delete action. The `where` method must be called before the `update` or `delete` method in the same statement. These two methods are concatenated after the `where` method using dot notation, so the `where` method returns a `mongoTool` object with the specified condition. If the `where` method is not called, or if it is called without parameters, it indicates that there is no filtering condition in the `update` or `delete` action.

For the `where` method :

The `where` method it can receive one or two parameters

A single argument can be passed as a parameter, in which case it will be a JSON object that establishes the condition and that mongoose can understand.

If two parameters are passed, the first will be an array with the fields of the condition and the second array will be the values ​​of those fields of the condition in the same order in which they were established in the array of fields; the method will generate the JSON object that represents this condition

For the `insert` method :

If you do not have an auto-incrementing field, simply pass the empty string to the `insert` method

For the `insert` and `update` method :

If you don't have primary keys, simply pass an empty array to the `insert` or the `update` method

The `insert` method will also receive the document to be inserted and the mongoose model to which it belongs.

The `update` method will also receive the mongoose model to which it belongs and an array with the fields to be modified and another array with the modifications in the same order in which the fields were placed in the previous array

The `insert` method will retrieve the next value from the auto-incrementing field and add the document with this data to the collection but only if the primary key constraints are not violated.

If it cannot be inserted, the following message is received : "The document you are trying to insert already exists with regard to primary keys"

The same applies to the `update` method; the data will only be updated if it does not violate the restrictions of the primary key.

If it cannot be updated, the following message is received : "The document you are trying to update is not possible with regard to primary keys."

Finally, the `update` method supports updating both a single document and multiple documents, applying primary key constraints in both cases. The programmer doesn't need to specify which case they are in; the `update` method will detect whether the condition generates a single document or more than one, applying a different process in each case. The method applied to a single document is simpler and more efficient.

==============================================================================================

Este es el desarrollo de un módulo Node.js que funciona con Mongoose para permitir la gestión de claves primarias y campos autoincrementables dentro de una colección.

Consiste en una clase exportada llamada MongoTool, a la que se debe pasar un objeto mongoose en el constructor, pero es necesario que la conexión con la base de datos se haya establecido en el objeto mongoose.

Una vez creado un objeto de esta clase (clase MongoTool), hay cuatro métodos públicos disponibles: `where`, `insert`, `update` y `delete`, para añadir, modificar o eliminar un documento de la colección, teniendo en cuenta las claves primarias definidas por el desarrollador y el uso de un único campo autoincrementable en la colección.

El método `where` se utiliza simplemente para especificar la condición de una acción de actualización o eliminación. Debe llamarse antes que el método `update` o `delete` en la misma instrucción. Estos dos métodos se concatenan después del método `where` mediante notación de punto, por lo que el método `where` devuelve un objeto MongoTool con la condición especificada. Si no se llama al método `where`, o si se llama sin parámetros, indica que no hay ninguna condición de filtrado en la acción de actualización o eliminación.

Para el método `where`:

El método `where` puede recibir uno o dos parámetros.

Se puede pasar un solo argumento como parámetro, en cuyo caso será un objeto JSON que establece la condición y que Mongoose puede comprender.

Si se pasan dos parámetros, el primero será un array con los campos de la condición y el segundo con los valores de dichos campos en el mismo orden en que se establecieron en el array de campos. El método generará el objeto JSON que representa esta condición.

Para el método `insert`:

Si no tiene un campo autoincrementable, simplemente pase la cadena vacía al método `insert`.

Para los métodos `insert` y `update`:

Si no tiene claves primarias, simplemente pase un array vacío al método `insert` o `update`.

El método `insert` también recibirá el documento que se va a insertar y el modelo de Mongoose al que pertenece.

El método `update` también recibirá el modelo de Mongoose al que pertenece, un array con los campos que se van a modificar y otro array con las modificaciones en el mismo orden en que se colocaron los campos en el array anterior.

El método `insert` recuperará el siguiente valor del campo autoincremental y añadirá el documento con estos datos a la colección, pero solo si no se infringen las restricciones de la clave primaria.

Si no se puede insertar, se recibe el siguiente mensaje: "El documento que intenta insertar ya existe con respecto a las claves primarias".

Lo mismo ocurre con el método `update`; los datos solo se actualizarán si no infringen las restricciones de la clave primaria.

Si no se puede actualizar, se recibe el siguiente mensaje: "El documento que intenta actualizar no es posible con respecto a las claves primarias".

Por último, el método `update` permite actualizar tanto un solo documento como varios, aplicando restricciones de clave primaria en ambos casos. El programador no necesita especificar en qué caso se encuentra; el método `update` detectará si la condición genera un solo documento o más, aplicando un proceso diferente en cada caso. El método aplicado a un solo documento es más simple y eficiente.
