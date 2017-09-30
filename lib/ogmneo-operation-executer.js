'use strict';

const { OGMNeoOperation } = require('./ogmneo-operation');
const OGMNeo = require('./ogmneo');

const _ = require('lodash');
/**
 * @class OGMNeoOperationExecuter
 */
class OGMNeoOperationExecuter {

    constructor() { }

    /**
        * Executes an READ or WRITE ogmneo.Operation and returns a result.
        *
        * @static
        * @param {operation} operation - .
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static read(session, transactional) {
        if (session != null && session.readTransaction != null ) {
            return session.readTransaction((transaction) => {
                return transactional(session, transaction);
            });
        } else {
            return Promise.reject(new Error('You must provide a session object. See ogmneo.Connection.session()'));
        }
    }

    /**
        * Executes an READ or WRITE ogmneo.Operation and returns a result.
        *
        * @static
        * @param {operation} operation - .
        * @returns {Promise.<object|Error>} Result(Parsed or not) of the executed opertion or some error if rejected.
     */
    static write(session, transactional) {
        if (session != null && session.readTransaction != null ) {
            return session.readTransaction((transaction) => {
                return transactional(session, transaction);
            });
        } else {
            return Promise.reject(new Error('You must provide a session object. See ogmneo.Connection.session()'));
        }
    }

    /**
        * Executes an READ or WRITE ogmneo.Operation and returns a result.
        *
        * @static
        * @param {operation} operation - .
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
                session.writeTransaction((transaction) => {
                    let promise = this.runInTransaction(operation, transaction);
                    this._handleSingleResultPromise(session, operation, promise, resolve, reject);
                });
            }
        });
    }

    static runInTransaction(operation, transaction) {
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

    static _validateOperations(operations, type = null) {
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