class mongoTool {

    // Contains the mongoose object already connected to the database
    #mongoose

    // Establish the query condition
    #condition

    // Establish an error message
    #error
    
    constructor(mongoose) {
        this.#mongoose = mongoose;
        this.#condition = "{}";
        this.#error = null;
    }


// public API with private auxiliary methods
 
    // insert method
    // The model on which to act is passed to him.
    // The document to insert
    // An array of strings with the names of the fields that together will form the primary key (optional)
    // A String with the name of the auto-incrementing field (optional)

    insert(model, document, pks = [], autoIncField = "") {
        return new Promise ( (resolve, reject) => {       
            this.#newValueAutoInc(model, autoIncField)
            .then( value => {
                // Setting the autoIncField value if necessary
                if (value != "") document[autoIncField] = value;
                // Saving the document
                this.#save(model, document, pks)
                .then( value => resolve(value))
                .catch( error => reject(error));
            })
            .catch( error => reject(error));
        });    
    }

    // Auxiliary method private for the insert method
    // Checks if the pks restriction is ok and save the document
    #save = (model, document, pks = []) =>  {
        return new Promise ( (resolve, reject) => {       
            // Generate the values for the primary keys from the document
            let values = [];
            pks.forEach( element => values.push(document[element]));
            // Checking if the document already exist
            this.#existDocument(model, pks, values)
            .then( condition => {
                // If it doesnt exist another document with the pks restriction
                if (condition == false) {        
                    // Saving the document
                    return document.save({runSettersOnQuery : true})
                    .then( result => resolve("Document added : " + result))
                    .catch( error => reject(error))
                // The document already exists with regard to primary keys.
                } else reject("The document you are trying to insert already exists with regard to primary keys.");
            })
            .catch( error => reject(error));
        })
    }

    update(model, fields, values, pks = []) {
        return new Promise ( (resolve, reject) => {   
            // If the where clause send an error we stop
            if (this.#error != null) reject(error);
            if (this.#condition == "") reject(new Error("The condition has not been passed"));
            // Generate the modified document
            model.find(this.#condition)
            .then( (document) => {
                if (document.length > 0) {
                    // If there is only one document to update this is the easy case
                    if (document.length == 1) {
                        // Modifying the fields to be updated
                        fields.forEach ( (field, index) => {
                            document[field] = values[index];
                        })
                        // Cheking if the modified document exist in its primary keys
                        let pkValues = [];
                        pks.forEach( element => pkValues.push(document[element]));
                        this.#existDocument(model, pks, pkValues)
                        .then( (condicion) => {
                            // If it doesnt exist another document with the pks restriction
                            if (condicion == false) {        
                                // Updating the document
                                return model.findOneAndUpdate( this.#condition, this.#genJson(fields, values), {new : false, runSettersOnQuery : true })
                                .then( result => resolve("Document updated : " + result))
                                .catch( error => reject(error))
                            // The document already exists with regard to primary keys.
                            } else reject("The document you are trying to update is not possible with regard to primary keys.");
                        })
                        .catch( error => reject(error));
                    } else {
                        // There are more than one document to be update, this is the complex case
                        // Getting all the documents of the collection
                        model.find()
                        .then( (result) => {
                            // Getting the documents that fit the condition
                            model.find(this.#condition)
                            .then ( (document) => {
                                // Modifying the documents that fit the condition in the result of all the documents
                                result.forEach( (element) => {
                                    document.forEach( (oneDocument) => {
                                        if (JSON.stringify(element) === JSON.stringify(oneDocument) ) {
                                            fields.forEach ( (field, index) => {
                                                element[field] = values[index]
                                            })
                                        }
                                    })
                                })
                                // Cheking if the modified document exist in its primary keys
                                // Creating a Map for each document to be modified with the primary keys
                                let pksMap = [];
                                result.forEach( (oneDocument) => {
                                    let theMap = new Map();
                                    pks.forEach( element => {
                                        theMap.set(element, oneDocument[element]);
                                    })
                                    pksMap.push(theMap);
                                });
                                // Passing the Map array
                                // the existDocument method distingues between passing an array with values or an array with maps
                                this.#existDocument(model, pks, pksMap)
                                .then( (condition) => {
                                    // If it is passed the condition restriction...
                                    if (condition == false) {        
                                        // Updating the document
                                        return model.updateMany( this.#condition, this.#genJson(fields, values), {new : false, runSettersOnQuery : true })
                                        .then( result => resolve("Document updated : " + result))
                                        .catch( error => reject(error))
                                    // The document already exists with regard to primary keys.
                                    } else reject("The document you are trying to update is not possible with regard to primary keys.");
                                })
                                .catch( error => reject(error));
                            })
                            .catch( error => reject(error));
                        })
                        .catch( error => reject(error));
                    }
                } else reject("The document you are trying to update has not been found.");
            })
            .catch( error => reject(error));
        });
    }

    delete(model) {
        return new Promise ( (resolve, reject) => {

            // If the where clause send an error we stop
            if (this.#error != null) reject(error);
            if (this.#condition == "") reject(new Error("The condition has not been passed"));
            // Ordering the delete action...
            model.deleteMany(this.#condition)
            .then( (resultado) => {
                if (resultado.deletedCount == 0) reject("The document you are trying to delete has not been found.")
                else resolve("Document sucessful deleted : " + resultado.deletedCount)
            })
            .catch( (error) => {
                reject(new Error(error));
            })
        });
    }


    where(conditionFields, conditionValues) {
        this.#error = null;
        if (arguments.length > 0) 
            if (arguments.length == 1) this.#condition = arguments[0]
            else this.#condition = this.#genJson(conditionFields, conditionValues);
        return this;
    }












// private helpers functions


    // Function that checks if a record exists
    // model would be the model to use
    // pks would be an array with the fields that act as the primary key
    // values ​​would be an array with the values ​​to be checked
    // Return a promise
    #existDocument = async (model, pks=[], values=[]) =>  {
        try {
            // If there is a pks array and a values array then go forward
            // If not return false
            if ((pks.length  > 0) && (values.length > 0)) {
                // Checking if it is passed an array of values or an array with Maps (manyUpdate case)
                if (values[0] instanceof Map) {
                    // Here it means we have to check the Map for repeated entries returning true or false
                    const uniqueElements = new Set();
                    const duplicatedElements = [];
                    values.forEach(item => {
                        if (uniqueElements.has(JSON.stringify(Object.fromEntries(item)))) {
                            duplicatedElements.push(item)
                        } else {
                            uniqueElements.add(JSON.stringify(Object.fromEntries(item)));
                        }
                    });
                    if (duplicatedElements.length > 0) return true;
                    else return false;
                } else {
                    // The values array stores the element of the database assigned to the pk of only one element
                    // We check if it is right just searching for another element with the same pks generating previously the condition
                    // If the pks and values array have different length
                    if (pks.length != values.length) throw new Error("Incorrect call to the function that checks primary keys")
                    else {
                        // Generate the condition
                        let condition = this.#genJson(pks, values);
                        // Read the entire collection applying the condition
                        let data = await model.find(condition);
                        // If there is one document that fetch the condition return true otherwise false
                        if (data.length > 0) return true;
                        else return false;
                    }
                }
            // If there is no pks array whatever document is correct
            } else return false;
        } catch (error) {
            return new Error(error.message);
        }
    }

    // Generates a JSON Object from two arrays one of fields and another of values
    #genJson = (fields=[], values=[]) =>  {
        // Creating a map with the conditions values
        let entries = new Map();
        fields.forEach( (field, index) => {
            entries.set(field, values[index])
        });
        // Returning the JSON object with the condition for the pks restrictions
        return JSON.parse(JSON.stringify(Object.fromEntries(entries)));
    }


    // Function that would give us the next value of an auto-incrementing field
    // model would be the model to use
    // autoIncField would be a string with the auto-incrementing field
    #newValueAutoInc = async (model, autoIncField="") => {
        try {
            // If is setted the autoIncField
            if (autoIncField != "") {
                // Temporary array to store all values ​​of the auto-incrementing field
                let arrayIds = [];
                // Read the entire collection and extract the autoIncField values in a proper way
                let data = await model.find();
                arrayIds = data.map( function(item) {
                if (typeof item[autoIncField] == "number") return parseInt(item[autoIncField]);
                });
                // returns the right value of the autoIncField
                if (arrayIds.length > 0) return Math.max(...arrayIds) + 1; else return 1;
            // If not is setted the autoIncField
            } else return "";
        } catch (error) {
            return new Error(error.message);
        }
    }
}

module.exports = {   
    mongoTool : mongoTool }