'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder = require('./ormneo-query');
const _ = require('lodash');
const ORMNeoObjectParse = require('./ormneo-object-parse');
/**
    * @class ORMNeoNode
 */
class ORMNeoNode {
    /**
        * Creates a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties.
        * @param {string} [label=null] - The label of the node. Default null is a node without label. 
        * @returns {Promise.<object|Error>} Created node literal object if fulfilled, or some neo4j error if rejected.
    */
    static create(node, label = null) {
        let value = _.omitBy(node, _.isUndefined);
        return new Promise((resolve, reject) => {
            let objectString = ORMNeoObjectParse.objectString(value);
            let labelCypher = (!_.isEmpty(label) && _.isString(label)) ? `:${label}` : '';
            let cypher = `CREATE (n${labelCypher} ${objectString}) RETURN n`;
            let session = ORMNeo.session();
            let readTxResultPromise = session.readTransaction((transaction) => {
                return transaction.run(cypher, value);
            });
            readTxResultPromise.then((result) => {
                let record = _.first(result.records);
                session.close();
                resolve(this._recordToObject(record));
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    /**
        * Updates a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {Promise.<object|Error>} Updated node literal object if fulfilled, or error if node.id is invalid or some neo4j error if rejected.
    */
    static update(node) {
        let value = _.omitBy(node, _.isUndefined);
        return new Promise((resolve, reject) => {
            if (value && value.id != undefined && _.isInteger(value.id)) {
                let objectString = ORMNeoObjectParse.objectString(value);
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} SET n+=${objectString} RETURN n`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher, node);
                });
                readTxResultPromise.then((result) => {
                    let record = _.first(result.records);
                    session.close();
                    resolve(this._recordToObject(record));
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must have an integer id to be updated'));
            }
        });
    }

    /**
        * Deletes a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {Promise.<void|Error>} Void if fulfilled, or error if node.id is invalid or some neo4j error if rejected.
    */
    static delete(node) {
        return new Promise((resolve, reject) => {
            if (node && node.id != undefined && _.isInteger(node.id)) {
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} DELETE n`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher);
                });
                readTxResultPromise.then(() => {
                    session.close();
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must to have an property id to be deleted'));
            }
        });
    }
    
    /**
        * Retrive node with id.
        *
        * @static
        * @param {integer} id - The id of node that's wanted.
        * @returns {Promise.<object|Error>} Object if found fulfilled or null if not found fulfilled, 
        or error if id is invalid or some neo4j error if rejected.
    */
    static nodeWithId(id) {
        return new Promise((resolve, reject) => {
            if (_.isInteger(id)) {
                let cypher = `MATCH (n) WHERE ID(n)=${id} RETURN n`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher);
                });
                readTxResultPromise.then((result) => {
                    let record = _.first(result.records);
                    session.close();
                    resolve(this._recordToObject(record));
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must to have an property id to be deleted'));
            }
        });
    }

    /**
        * Count of nodes with the label.
        *
        * @static
        * @param {string} label - The label of nodes that have to be counted.
        * @returns {Promise.<integer|Error>} Count of nodes if fulfilled, some neo4j error if rejected.
    */
    static countWithLabel(label) {
        return this.count(new QueryBuilder(label));
    }

    /**
        * Count of nodes with the query.
        *
        * @static
        * @param {ORMNeoQuery} query - The query to filter nodes that have to be counted.
        * @returns {Promise.<integer|Error>} Count of nodes if fulfilled, some neo4j error if rejected.
    */
    static count(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof QueryBuilder) {
                let cypher = query.count();
                let session = ORMNeo.session();
                session.run(cypher).subscribe({
                    onNext: (record) => {
                        resolve(record.get('count').low);
                    },
                    onCompleted: () => {
                        session.close();
                    },
                    onError: (error) => {
                        reject(error);
                    }
                });
            } else {
                reject(new Error('An QueryBuilder object must to be provider'));
            }
        });

    }

    /**
        * Executing query returning nodes filtered by query parameter.
        *
        * @static
        * @param {ORMNeoQuery} query - The query to filter nodes that have to be returned.
        * @returns {Promise.<array|Error>} Nodes if fulfilled, some neo4j error if rejected.
    */
    static execute(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof QueryBuilder) {
                let cypher = query.match();
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher);
                });
                readTxResultPromise.then((result) => {
                    session.close();
                    if (_.isEmpty(result.records)) {
                        resolve([]);
                    } else {
                        resolve(result.records.map((record) => this._recordToObject(record)));
                    }
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must to have an property id to be deleted'));
            }
        });
    }

    static _recordToObject(record) {
        if (record) {
            let node = record.get('n');
            let obj = node.properties || {};
            obj.id = node.identity.low;
            return obj;
        }
        return null;
    }
}

module.exports = ORMNeoNode;