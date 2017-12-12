'use strict';

const _ = require('lodash');
const OGMNeo = require('./ogmneo');

/**
    * @class OGMNeoCypher

 */
class OGMNeoCypher {
    
    /**
        * Executes one or more cypher read statements in a transaction.
        *
        * @static
        * @param {string|array} statements - The cypher read statements to be executed.
        * @returns {Promise<object|Error>} - Execute cypher query and return a result if successfully completes or a neo4j error.
    */
    static transactionalRead(statements) {
        return new Promise((resolve, reject) => {
            if (!_validateStatements(statements)) {
                reject(new Error('Cypher statements must to be a string or a non empty string array'));
            } else {
                let session = OGMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    if (_.isString(statements)) {
                        return transaction.run(statements);
                    } else {
                        return Promise.all(statements.map(statement => transaction.run(statement)));
                    } 
                });
                readTxResultPromise.then((result) => {
                    session.close();
                    resolve(result);
                    
                }).catch( (error) => {
                    reject(error);
                });
                
            }
        });
    }

    /**
        * Executes one or more cypher write statements in a transaction.
        *
        * @static
        * @param {string|array} statements - The cypher write statements to be executed.
        * @returns {Promise<object|Error>} - Execute cypher query and return a result if successfully completes or a neo4j error.
    */
    static transactionalWrite(statements) {
        return new Promise((resolve, reject) => {
            if (!_validateStatements(statements)) {
                reject(new Error('Cypher statements must to be a string or a non empty string array'));
            } else {
                let session = OGMNeo.session();
                let writeTxResultPromise = session.writeTransaction((transaction) => {
                    if (_.isString(statements)) {
                        return transaction.run(statements);
                    } else {
                        return Promise.all(statements.map(statement => transaction.run(statement)));
                    } 
                });
                writeTxResultPromise.then((result) => {
                    session.close();
                    resolve(result);
                    
                }).catch( (error) => {
                    reject(error);
                });
            }
        });
    }
}

//Private validate statements
function _validateStatements(statements) {
    if (_.isString(statements)) {
        return true;
    } else if (_.isArray(statements)) {
        let filtered = statements.filter(statement => _.isString(statement));
        return !_.isEmpty(filtered);
    }
    return false;
}
module.exports = OGMNeoCypher;