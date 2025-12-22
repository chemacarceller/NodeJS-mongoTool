# NodeJS-mongoTool

This is the development of a Nodejs module that works on mongoose to allow the management of primary keys and auto-incrementing fields within a collection

It consists of an exported class named mongoTool to which a mongoose object must be passed in the constructor but necessarily once the connection to the database is established

Once an object of this class (mongoTool class) is created, there are four public methods available; the methods are : `where`, `insert`, `update` and `delete`, to add, modify or delete a document to the collection taking into account primary keys defined by the developer and the use of a single auto-incrementing field in the collection

The where method it is simply used to specify the condition of an update or delete action. The `where` method must be called before the `update` or `delete` method in the same statement. These two methods are concatenated after the `where` method using dot notation, so the `where` method returns a `mongoTool` object with the specified condition. If the `where` method is not called, or if it is called without parameters, it indicates that there is no filtering condition in the `update` or `delete` action.

It can receive one or two parameters

A single argument can be passed as a parameter, in which case it will be a JSON object that establishes the condition and that mongoose can understand.

If two parameters are passed, the first will be an array with the fields of the condition and the second array will be the values ​​of those fields of the condition in the same order in which they were established in the array of fields; the method will generate the JSON object that represents this condition

For the insert method :

If you do not have an auto-incrementing field, simply pass the empty string to the insert method

For the insert and update method :

If you don't have primary keys, simply pass an empty array to the insert or the update method

The insert method will also receive the document to be inserted and the mongoose model to which it belongs.

The update method will also receive an array with the fields to be modified and another array with the modifications in the same order in which the fields were placed in the previous array

The insert method will retrieve the next value from the auto-incrementing field and add the document with this data to the collection but only if the primary key constraints are not violated.

If it cannot be inserted, the following message is received : "The document you are trying to insert already exists with regard to primary keys"

The same applies to the update method; the data will only be updated if it does not violate the restrictions of the primary key.

If it cannot be updated, the following message is received : "The document you are trying to update is not possible with regard to primary keys."

Finally, the `update` method supports updating both a single document and multiple documents, applying primary key constraints in both cases. The programmer doesn't need to specify which case they are in; the `update` method will detect whether the condition generates a single document or more than one, applying a different process in each case. The method applied to a single document is simpler and more efficient.
