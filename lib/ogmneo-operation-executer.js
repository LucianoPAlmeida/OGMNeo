'use strict';

const { OGMNeoOperation } = require('./ogmneo-operation');
const OGMNeo = require('./ogmneo');
const Printer = require('./ogmneo-printer');
const _ = require('lodash');

/**
 * @class OGMNeoOperationExecuter
 */
class OGMNeoOperationExecuter {

    /**
        * Batches an array of READ operations in a single transaction and returns the results.
        *
        * @static
        * @param {array} operations - The array of operations that should be executed.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static batchReadOperations(operations) {
        try {
            this._validateOperations(operations, OGMNeoOperation.READ);
            if (_.isEmpty(operations)) {
                return Promise.resolve([]);
            }
            return this.read((transaction) => {
                return Promise.all(operations.map(operation => this.execute(operation, transaction)));
            });            
    
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Batches an array of WRITE operations in a single transaction and returns the results.
        *
        * @static
        * @param {array} operations - The array of operations that should be executed.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static batchWriteOperations(operations) {
        try {
            this._validateOperations(operations, OGMNeoOperation.WRITE);
            if (_.isEmpty(operations)) {
                return Promise.resolve([]);
            }
            return this.write((transaction) => {
                return Promise.all(operations.map(operation => this.execute(operation, transaction)));
            });                          
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Opens a read transaction of neo4j driver and returns a result.
        *
        * @static
        * @param {function} transactional - A function with the transaction parameter that you must return a promise of your operations on this transaction.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static read(transactional) {
        return new Promise((resolve, reject) => {
            let session = OGMNeo.session();
            return session.readTransaction((transaction) => {
                return transactional(transaction);
            }).then((result) => {
                session.close();
                resolve(result);
            }).catch((error)=> {
                reject(error);
            });
        });

    }

   /**
        * Opens a write transaction of neo4j drive and returns a result.
        *
        * @static
        * @param {function} transactional - A function with the transaction parameter that you must return a promise of your operations on this transaction.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static write(transactional) {
        return new Promise((resolve, reject) => {
            let session = OGMNeo.session();
            return session.writeTransaction((transaction) => {
                return transactional(transaction);
            }).then((result) => {
                session.close();
                resolve(result);
            }).catch((error)=> {
                reject(error);
            });
        });
    }

    /**
        * Executes an READ or WRITE ogmneo.Operation and returns a result.
        *
        * @static
        * @param {OGMNeoOperation} operation - ogmneo.Operation object to be executed.
        * @param {object} transaction - Transaction created on read or write methods or transaction created on neo4j driver.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static execute(operation, transaction = null) {
        if (operation instanceof OGMNeoOperation) {
            if (operation.isReadType) {
                return this._executeRead(operation, transaction);
            } else {
                return this._executeWrite(operation, transaction);
            }
        } else {
            return Promise.reject(new Error('The operation must be a instance of ogmneo.Operation'));
        }
    }


    // Private API
    static _executeRead(operation, transaction) {
        return new Promise((resolve, reject) => {
            if (transaction != null) {
                let promise = this.runInTransaction(operation, transaction);
                this._handleSingleResultPromise(null, operation, promise, resolve, reject);
            } else {
                let session = OGMNeo.session();
                session.readTransaction((transaction) => {
                    let promise = this.runInTransaction(operation, transaction);
                    this._handleSingleResultPromise(session, operation, promise, resolve, reject);
                });
            }
        });
    }

    static _executeWrite(operation, transaction) {
        return new Promise((resolve, reject) => {
            if (transaction != null) {
                let promise = this.runInTransaction(operation, transaction);
                this._handleSingleResultPromise(null, operation, promise, resolve, reject);
            } else {
                let session = OGMNeo.session();
                let promise = session.writeTransaction((transaction) => {
                    return this.runInTransaction(operation, transaction);
                });
                this._handleSingleResultPromise(session, operation, promise, resolve, reject);
            }
        });
    }

    static runInTransaction(operation, transaction) {
        Printer.printCypherIfEnabled(operation.cypher);        
        if (operation.object != null) {
            return transaction.run(operation.cypher, operation.object);
        } else {
            return transaction.run(operation.cypher);
        }
    }

    static _handleSingleResultPromise(session, operation, promise, resolve, reject) {
        promise.then((result) => {
            if (session != null) { 
                session.close();
            }
            resolve(this._parseResultForOperation(operation, result));
        }).catch((error) => {
            reject(error);
        });
    }

    static _parseResultForOperation(operation, driverResult) {
        if (operation.then != null) {
            return operation.then(driverResult);
        } else {
            return driverResult;
        }
    }

    static _validateOperations(operations, type=null) {
        if (_.isArray(operations)) {
            for (let op of operations) {
                if ((op instanceof OGMNeoOperation) == false) {
                    throw new Error('The parameter operations must be an array that contains only instances of ogmneo.Operation'); 
                } else if (type != null && op.type != type) {
                    throw new Error(`The parameter operations must be an array that contains only instances of ogmneo.Operation that have type : ${type}`);                     
                }
            }
        } else {
            throw new Error('The parameter operations must be an array');
        }
    }
}

module.exports = OGMNeoOperationExecuter;