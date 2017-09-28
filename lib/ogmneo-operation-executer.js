'use strict';

const { OGMNeoOperation }= require('./ogmneo-operation');
const OGMNeo = require('./ogmneo');

const _ = require('lodash');
/**
 * @class OGMNeoOperationExecuter
 */
class OGMNeoOperationExecuter {

    constructor() {}

    /**
        * Executes an array of READ operations in a single transaction and returns the results.
        *
        * @static
        * @param {array} operations - The array of operations that should be executed.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static executeReadOperations(operations) {
        try {
            this._validateOperations(operations, OGMNeoOperation.READ);
            if (_.isEmpty(operations)) {
                return Promise.resolve([]);
            }
            
            let session = OGMNeo.session();
            let readTxResultPromise = session.readTransaction((transaction) => {
                return Promise.all(operations.map(operation =>  transaction.run(operation.cypher, operation.object)));
            });
            return this._handleMultipleOperationsResult(operations, readTxResultPromise);
    
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Executes an array of WRITE operations in a single transaction and returns the results.
        *
        * @static
        * @param {array} operations - The array of operations that should be executed.
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static executeWriteOperations(operations) {
        try {
            this._validateOperations(operations, OGMNeoOperation.WRITE);
            if (_.isEmpty(operations)) {
                return Promise.resolve([]);
            }
            let session = OGMNeo.session();
            let writeTxResultPromise = session.writeTransaction((transaction) => {
                return Promise.all(operations.map(operation =>  transaction.run(operation.cypher, operation.object)));
            });
            return this._handleMultipleOperationsResult(operations, writeTxResultPromise);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Executes an READ of WRITE ogmneo.Operation and returns a result.
        *
        * @static
        * @param {operation} operation - .
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static execute(operation) {
        if (operation instanceof OGMNeoOperation) {
            if (operation.isReadType) {
                return this._executeRead(operation);
            } else {
                return this._executeWrite(operation);
            }
        } else {
            return Promise.reject(new Error('The operation must be a instance of ogmneo.Operation'));
        }
    }


    // Private API
    static _handleMultipleOperationsResult(operations, promise) {
        return promise.then((results) => {
            let parsedResults = new Array(operations.length);
            for (let i = 0; i < operations.length; i++) {
                let operation = operations[i];
                if (operation.then != null) {
                    parsedResults[i] = operation.then(results[i]);
                } else {
                    parsedResults[i] = results[i];
                }
            }
            return parsedResults;
        });      
    }

    static _executeRead(operation) {
        return new Promise((resolve, reject) => {
            let session = OGMNeo.session();
            let readTxResultPromise = session.readTransaction((transaction) => {
                if (operation.object != null) {
                    return transaction.run(operation.cypher, operation.object);
                } else {
                    return transaction.run(operation.cypher);
                }
            });
            this._handleSingleResultPromise(session, operation, readTxResultPromise, resolve, reject);
        });
    }

    static _executeWrite(operation) {
        return new Promise((resolve, reject) => {
            let session = OGMNeo.session();
            let writeTxResultPromise = session.writeTransaction((transaction) => {
                if (operation.object != null) {
                    return transaction.run(operation.cypher, operation.object);
                } else {
                    return transaction.run(operation.cypher);
                }
            });
            this._handleSingleResultPromise(session, operation, writeTxResultPromise, resolve, reject);
        });
    }

    static _handleSingleResultPromise(session, operation, promise, resolve, reject) {
        promise.then((result) => {
            session.close();
            resolve(this._parseResultForOperation(operation, result));
        }).catch( (error) => {
            reject(error);
        });
    }
    
    static _parseResultForOperation(operation, driverResult) {
        if (operation.then != null ) {
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