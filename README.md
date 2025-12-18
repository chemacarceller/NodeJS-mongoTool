# NodeJS-mongoTool

This is the development of a Nodejs module that works on mongoose to allow the management of primary keys and auto-incrementing fields within a collection

It consists of an exported class named mongoTool to which the mongoose object must be passed in the constructor once the connection with the database has been made

Once an object of this class is created, there are four public methods, where, insert, update and delete, to add, modify or delete a document to the collection taking into account primary keys defined by the developer and the use of a single auto-incrementing field in the collection

If you do not have an auto-incrementing field, simply pass the empty string to the insert method

If you don't have primary keys, simply pass an empty array to the insert or the update method

For the update and delete method there is a `where` method available to set the condition. 

This method works either by passing it two arrays, one with the keys and the other with the condition values ​​(simple mode), or by passing it a single parameter, which will be the JSON object containing the condition that Mongoose can understand.

The insert and update methods will be concatenated to the select method using dot notation.

The insert method will also receive the document to be inserted and the mongoose model to which it belongs.

The update method will also receive an array with the fields to be modified and another array with the modifications in the same order in which the fields were placed in the previous array

The insert method will retrieve the next value from the auto-incrementing field and add the document with this data to the collection but only if the primary key constraints are not violated.

If it cannot be inserted, the following message is received : "The document you are trying to insert already exists with regard to primary keys"

The same applies to the update method; the data will only be updated if it does not violate the restrictions of the primary key.

If it cannot be updated, the following message is received : "The document you are trying to update is not possible with regard to primary keys."
