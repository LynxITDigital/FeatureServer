/* 
 * Author: Oliver Jacobs
 * Date: 16/02/2016
 * 
 * This script should manage all mongoDB operations
 * In a more complex setup, we may use a more distributed or OO approach for various tables
 * But this is a simple demonstration database, mostly aimed at testing React Native
 * 
 */


var ObjectID = require('mongodb').ObjectID;

/***************************************************
 *              DATABASE IO FUNCTIONS              *
 ***************************************************/

Database = function(db) {
    this.db = db;
}

Database.prototype.getCollection = function(collectionName, callback) {
    this.db.collection(collectionName, function(error, the_collection) {
        if(error) callback(error);
        else callback(null, the_collection);
    });
};

/**
 * Get all records in a collection
 * @param {type} collectionName
 * @param {type} callback
 * @returns {undefined}
 */
Database.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if(error) callback(error);
        else {
            the_collection.find().toArray(function(error, results) {
                if(error) callback(error);
                else callback(null, results);
            });
        }
    });
};

/**
 * 
 * Get a Specific record from a collection by id
 * @param {type} collectionName
 * @param {type} id
 * @param {type} callback
 * @returns {undefined}
 */
Database.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, results) {
       if(error) callback(error);
       else {
           var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
           if(!checkForHexRegExp.test(id)) callback({error: "invalid id"});
           else {
               results.findOne({'_id':ObjectID(id)}, function(error, doc) {
                if(error) callback(error);
                else callback(null, doc);
               });
           }
       }
    });
};


/**
 * Save object ot collection
 * @param {type} collectionName
 * @param {type} obj
 * @param {type} callback
 * @returns {undefined}
 */
Database.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, collection) {
       if(error) callback(error);
       else {
           obj.created_at = new Date();
           collection.insert(obj, function() {
               callback(null, obj);
           });
       }
    });
};


/**
 * Update Object in Collection (by id)
 * @param {type} collectionName
 * @param {type} obj
 * @param {type} entityId
 * @param {type} callback
 * @returns {undefined}
 */
Database.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if(error) callback(error);
        else {
            obj_id = ObjectID(entityId);
            obj.updated_at = new Date();
            collection.save(obj, function(error, doc) {
               if(error) callback(error);
               else callback(null, doc);
            });
        }
    });
};

/**
 * Delete object in collection (by id)
 * @param {type} collectionName
 * @param {type} entityId
 * @param {type} callback
 * @returns {undefined}
 */
Database.prototype.delete = function(collectionName, entityId, callback) {
      this.getCollection(collectionName, function(error, collection) {
        if(error) callback(error);
        else {
            collection.remove({'_id':entityId}, function(error, doc) {
                if(error) callback(error);
                else callback(null, doc);
            });
        }
    });
};


/***************************************************
 *              SPECIFIC DB FUNCTIONS              *
 ***************************************************/


Database.prototype.login = function(object, callback) {
    this.getCollection('users', function(error, collection) {
                    if(error) callback(error);
                    else {
                        collection.findOne({ login: object.login, password: object.password }, 
                                           function(error, user) {
                                                if(error) callback(error);
                                                else callback(user);
                                            }); 
                    }
        });
};


/***************************************************
 *                  DB WEB INTERFACE               *
 ***************************************************/

exports.Database = Database;