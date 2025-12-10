# NodeJS-mongoTool

This is the development of a Nodejs module that works on mongoose to allow the management of primary keys and auto-incrementing fields within a collection

It consists of an exported class named mongoTool to which the mongoose object must be passed in the constructor once the connection with the database has been made

Once an object of this class is created, there are two public methods, insert and update, to add or modify a document to the collection, passing the name of an auto-incrementing field and an array with the fields that act together as the primary key; the update method does not receive the auto-incrementing field as is logical

If you do not have an auto-incrementing field, simply pass the empty string.

If you don't have primary keys, simply pass an empty array.

The insert method will also receive the document to be inserted and the mongoose model to which it belongs.

The update method will also receive an array with the fields to be modified and another array with the modifications in the same order in which the fields were placed in the previous array; it will also receive two arrays with the fields and values ​​that define the filtering condition for the update action

The insert method will retrieve the next value from the auto-incrementing field and add the document with this data to the collection but only if the primary key constraints are not violated.

If it cannot be inserted, the folloeing message is received : "The document you are trying to insert already exists with regard to primary keys"

The same applies to the update method; the data will only be updated if it does not violate the restrictions of the primary key.

If it cannot be updated, the folloeing message is received : "The document you are trying to update is not possible with regard to primary keys."
