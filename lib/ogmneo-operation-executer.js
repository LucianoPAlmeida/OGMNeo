'use strict';

const OGMNeoOperation = require('./ogmneo-operation');
const OGMNeo = require('./ogmneo');

const _ = require('lodash');

class OGMNeoOperationExecuter {

    constructor() {}

    executeReadOperations(operations) {
        try {
            this._validateOperations(operations);
            return null;            
        } catch (error) {
            return Promise.reject(error);
        }
    }

    executehWriteOperations(operations) {
        try {
            this._validateOperations(operations);
            return null;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    execute(operation) {
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

    _executeRead(operation) {
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

    //Private functions

    _executeWrite(operation) {
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

    _handleSingleResultPromise(session, operation, promise, resolve, reject) {
        promise.then((result) => {
            session.close();
            resolve(this._performResultCallForOperation(operation, result));
        }).catch( (error) => {
            reject(error);
        });
    }
    
    _parseResultForOperation(operation, driverResult) {
        if (operation.resultParser != null ) {
            return operation.resultParser(driverResult);
        } else {
            return driverResult;
        }
    }

    _validateOperations(operations, type=null) {
        if (_.isArray(operations)) {
            for (let op in operations) {
                if ((op instanceof OGMNeoOperation) == false) {
                    throw new Error('The parameter operations must be an array that contains only instances of ogmneo.Operation'); 
                }else if (type != null && op.type != type) {
                    throw new Error(`The parameter operations must be an array that contains only instances of ogmneo.Operation that have type : ${type}`);                     
                }
            }
        } else {
            throw new Error('The parameter operations must be an array');
        }
    }

}

module.exports = OGMNeoOperationExecuter;