'use strict';

const _ = require('lodash');

const OGMNeo = require('./ogmneo');
const OGMNeoQuery = require('./ogmneo-query');
const OGMNeoObjectParse = require('./ogmneo-parse');
const Printer = require('./ogmneo-printer');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('./ogmneo-operation');

/**
    * @class OGMNeoNode
 */
class OGMNeoNode {
    /**
        * Creates a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties.
        * @param {string} [label=null] - The label of the node. Default null is a node without label. 
        * @returns {Promise<object|Error>} Created node literal object if fulfilled, or some neo4j error if rejected.
    */
    static create(node, label = null) {
        let value = _.omitBy(node, _.isUndefined);
        OGMNeoObjectParse.parseProperties(value);
        return new Promise((resolve, reject) => {
            let objectString = OGMNeoObjectParse.objectString(value);
            let labelCypher = (!_.isEmpty(label) && _.isString(label)) ? `:${label}` : '';
            let cypher = `CREATE (n${labelCypher} ${objectString}) RETURN n`;
            Printer.printCypherIfEnabled(cypher);
            let session = OGMNeo.session();
            let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher, value));
            writeTxResultPromise.then((result) => {
                let record = _.first(result.records);
                session.close();
                resolve(OGMNeoObjectParse.parseRecordNode(record, 'n'));
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
        * Creates a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties.
        * @param {string} [label=null] - The label of the node. Default null is a node without label. 
        * @returns {OGMNeoOperation} Create node operation that can be executed later.
    */
    
    static createOperation(node, label = null) {
        let value = _.omitBy(node, _.isUndefined);
        OGMNeoObjectParse.parseProperties(value);
        let objectString = OGMNeoObjectParse.objectString(value);
        let labelCypher = (!_.isEmpty(label) && _.isString(label)) ? `:${label}` : '';
        let cypher = `CREATE (n${labelCypher} ${objectString}) RETURN n`;
        return OGMNeoOperationBuilder.create()
                                     .cypher(cypher)
                                     .object(value)
                                     .type(OGMNeoOperation.WRITE).then((result) => {
                                         let record = _.first(result.records);
                                         return OGMNeoObjectParse.parseRecordNode(record, 'n');
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
        OGMNeoObjectParse.parseProperties(value);
        return new Promise((resolve, reject) => {
            if (value && value.id != undefined && _.isInteger(value.id)) {
                let objectString = OGMNeoObjectParse.objectString(value);
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} SET n+=${objectString} RETURN n`;
                Printer.printCypherIfEnabled(cypher);
                let session = OGMNeo.session();
                let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher, value));
                writeTxResultPromise.then((result) => {
                    let record = _.first(result.records);
                    session.close();
                    resolve(OGMNeoObjectParse.parseRecordNode(record, 'n'));
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('Node must have an integer id to be updated'));
            }
        });
    }

    /**
        * Update new properties on every node that matches the.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter the nodes.
        * @param {object} newProperties - NEW properties.
        * @returns {Promise.<array|Error>} Updated nodes if fulfilled or some neo4j error if rejected.
    */
    static updateMany(query, newProperties) {
        return new Promise((resolve, reject) => {
            if (_.isObject(newProperties)) {
                let value = _.omitBy(newProperties, _.isUndefined);
                if (!_.isEmpty(value)) {
                    OGMNeoObjectParse.parseProperties(value);
                    if (query instanceof OGMNeoQuery) {
                        let objectString = OGMNeoObjectParse.objectString(value);
                        let cypher = `${query.matchCypher()} SET n+=${objectString} RETURN n`;
                        Printer.printCypherIfEnabled(cypher);
                        let session = OGMNeo.session();
                        let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher, value));
                        writeTxResultPromise.then((result) => {
                            session.close();
                            let nodes = result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n'));
                            resolve(nodes);
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        reject(new Error('The query object must be an instance of OGMNeoQuery'));
                    }
                } else {
                    resolve([]);
                }
            } else {
                resolve([]);
            }
        });
    }


    /**
        * Deletes a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {Promise.<boolean|Error>} True if fulfilled and found and delete node, false if not found object to delete, or error if node.id is invalid or some neo4j error if rejected.
    */
    static delete(node) {
        return new Promise((resolve, reject) => {
            if (node && node.id != undefined && _.isInteger(node.id)) {
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} DELETE n RETURN n`;
                Printer.printCypherIfEnabled(cypher);
                let session = OGMNeo.session();
                let readTxResultPromise = session.readTransaction(transaction => transaction.run(cypher));
                readTxResultPromise.then((result) => {
                    session.close();
                    resolve(!_.isEmpty(result.records));
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('Node must to have an non-nil property id to be deleted'));
            }
        });
    }

    /**
        * Deletes every node that matches the.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter the nodes.
        * @returns {Promise.<number|Error>} Number of nodes deleted if fulfilled or some neo4j error if rejected.
    */
    static deleteMany(query) {
        return new Promise((resolve, reject) => {
            if (query instanceof OGMNeoQuery) {
                let cypher = `${query.matchCypher()} DELETE n RETURN n`;
                Printer.printCypherIfEnabled(cypher);
                let session = OGMNeo.session();
                let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher));
                writeTxResultPromise.then((result) => {
                    session.close();
                    resolve(result.records.length);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('The query object must be an instance of OGMNeoQuery'));
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
                Printer.printCypherIfEnabled(cypher);
                let session = OGMNeo.session();
                let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher));
                writeTxResultPromise.then((result) => {
                    let record = _.first(result.records);
                    session.close();
                    resolve(OGMNeoObjectParse.parseRecordNode(record, 'n'));
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('You must provide an non-null integer id property to find the node'));
            }
        });
    }

    /**
        * Retrive nodes with ids.
        *
        * @static
        * @param {array} ids - The ids of nodes that are wanted.
        * @returns {Promise.<array|Error>} Array of nodes if found fulfilled or null if not found fulfilled, 
        or error if id is invalid or some neo4j error if rejected.
    */
    static manyWithIds(ids) {
        if (_.isArray(ids)) {
            return new Promise((resolve, reject) => {
                let validIds = ids.filter(id => _.isInteger(id));
                if (_.isEmpty(validIds)) {
                    resolve([]);
                } else {
                    let idsQuery = validIds.reduce((result, current) => {
                        return result + ((result === '') ? '' : ',') + ` ${current}`;
                    }, '');
                    let cypher = `MATCH (n) WHERE ID(n) IN [${idsQuery}] RETURN n`;
                    Printer.printCypherIfEnabled(cypher);
                    let session = OGMNeo.session();
                    let readTxResultPromise = session.readTransaction(transaction => transaction.run(cypher));
                    readTxResultPromise.then((result) => {
                        session.close();
                        resolve(result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n')));
                    }).catch((error) => {
                        reject(error);
                    });
                }
            });
        }else {
            return Promise.reject(new Error('The parameter must be an array of ids'));
        }
    }

    /**
        * Count of nodes with the label.
        *
        * @static
        * @param {string} label - The label of nodes that have to be counted.
        * @returns {Promise.<integer|Error>} Count of nodes if fulfilled, some neo4j error if rejected.
    */
    static countWithLabel(label) {
        return this.count(new OGMNeoQuery(label));
    }

    /**
        * Count of nodes with the query.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be counted.
        * @returns {Promise.<integer|Error>} Count of nodes if fulfilled, some neo4j error if rejected.
    */
    static count(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof OGMNeoQuery) {
                let cypher = query.countCypher();
                Printer.printCypherIfEnabled(cypher);
                let session = OGMNeo.session();
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
                reject(new Error('A OGMNeoQuery object must to be provided'));
            }
        });

    }

    /**
        * Find returning nodes filtered by query parameter.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be returned.
        * @returns {Promise.<array|Error>} Nodes if fulfilled, some neo4j error if rejected.
    */
    static find(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof OGMNeoQuery) {
                let cypher = query.queryCypher();
                Printer.printCypherIfEnabled(cypher);
                let session = OGMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher);
                });
                readTxResultPromise.then((result) => {
                    session.close();
                    if (_.isEmpty(result.records)) {
                        resolve([]);
                    } else {
                        resolve(result.records.map((record) => OGMNeoObjectParse.parseRecordNode(record, 'n')));
                    }
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('A OGMNeoQuery object must to be provided'));
            }
        });
    }

    /**
        * Find one node filtered by query parameter.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be returned.
        * @returns {Promise.<object|Error>} Node found if fulfilled, some neo4j error if rejected.
    */
    static findOne(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof OGMNeoQuery) {
                query.limit(1);
                this.find(query).then((nodes) => {
                    resolve(_.first(nodes));
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('A OGMNeoQuery object must to be provided'));
            }
        });
    }
    /**
        * Adding label to a node.
        *
        * @static
        * @param {string} label - The label to be added to the node.
        * @param {integer} nodeId - The id of the node to add the label.
        * @returns {Promise.<object|Error>} Node(if node exists) or null(if not exists) if fulfilled, some error if rejected.
    */
    static addLabelToNode(label, nodeId) {
        if (_.isInteger(nodeId)) {
            return new Promise((resolve, reject) => {
                this.addLabelToNodes(label, [nodeId]).then((results) => {
                    resolve(_.first(results));
                }).catch((error) => {
                    reject(error);
                });
            });
        } else {
            return Promise.reject(new Error('The nodeId must be an integer value'));
        }
    }

    /**
        * Remove label from a node.
        *
        * @static
        * @param {string} label - The label to be removed from the node.
        * @param {integer} nodeId - The id of the node to remove the label from.
        * @returns {Promise.<object|Error>} Node(if node exists) or null(if not exists) if fulfilled, some error if rejected.
    */
    static removeLabelFromNode(label, nodeId) {
        if (_.isInteger(nodeId)) {
            return new Promise((resolve, reject) => {
                this.removeLabelFromNodes(label, [nodeId]).then((results) => {
                    resolve(_.first(results));
                }).catch((error) => {
                    reject(error);
                });
            });
        } else {
            return Promise.reject(new Error('The nodeId must be an integer value'));
        }
    }
    
    /**
        * Adding label to nodes.
        *
        * @static
        * @param {string} label - The label to be added to the node.
        * @param {integer} nodesIds - The ids of the nodes to add the label.
        * @returns {Promise<array|Error>} Nodes(if nodes exists) or null(if not exists) if fulfilled, some error if rejected.
    */
    static addLabelToNodes(label, nodesIds) {
        if (_.isString(label) && !_.isEmpty(label)) {
            return new Promise((resolve, reject) => {
                this._validateAndBuildParams(nodesIds).then((params) => {
                    if (params) {
                        let cypher = `MATCH (n) WHERE ID(n) IN ${params} SET n:${label} RETURN n`;
                        Printer.printCypherIfEnabled(cypher);
                        let session = OGMNeo.session();                        
                        let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher));
                        writeTxResultPromise.then((result) => {
                            session.close();
                            resolve(result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n')));
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        resolve([]);
                    }
                }).catch((error) => {
                    reject(error);
                });
            });
        } else {
            return Promise.reject(new Error('label must be a non empty string'));
        }
    }

    /**
        * Remove label from nodes.
        *
        * @static
        * @param {string} label - The label to be removed from the nodes.
        * @param {integer} nodeId - The ids of the nodes to remove the label from.
        * @returns {Promise.<array|Error>} Nodes(if nodes exists) or null(if not exists) if fulfilled, some error if rejected.
    */
    static removeLabelFromNodes(label, nodesIds) {
        if (_.isString(label) && !_.isEmpty(label)) {
            return new Promise((resolve, reject) => {
                this._validateAndBuildParams(nodesIds).then((params) => {
                    if (params) {
                        let cypher = `MATCH (n:${label}) WHERE ID(n) IN ${params} REMOVE n:${label} RETURN n`;
                        Printer.printCypherIfEnabled(cypher);
                        let session = OGMNeo.session();                        
                        let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher));
                        writeTxResultPromise.then((result) => {
                            session.close();
                            resolve(result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n')));
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        resolve([]);
                    }
                }).catch((error) => {
                    reject(error);
                });
            });
        } else {
            return Promise.reject(new Error('label must be a non empty string'));
        }
    }

    static _validateAndBuildParams(nodesIds) {
        if (_.isArray(nodesIds)) {
            return new Promise((resolve) => {
                let validIds = nodesIds.filter(id => _.isInteger(id));
                if (_.isEmpty(validIds)) {
                    resolve(null);
                } else {
                    let parameters = validIds.reduce((result, current) => {
                        return result + `${(result === '') ? '' : ','} ${current}`;
                    }, '');
                    resolve(`[${parameters}]`);
                }
            });
        } else {
            return Promise.reject(new Error('nodesIds must be an array'));
        }
    }
}

module.exports = OGMNeoNode;