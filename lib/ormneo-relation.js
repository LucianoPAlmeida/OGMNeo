'use strict';

const ORMNeo = require('./ormneo');
const ORMNeoWhere = require('./ormneo-where');
const ORMNeoObjectParse = require('./ormneo-object-parse');
const _ = require('lodash');

/**
    * @class ORMRelation
 */
class ORMRelation {
    constructor() { }

    /**
        * Creates a relation between two nodes if they both exists.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} otherNodeId - Second in relation node id.
        * @param {string} type - Relation type name.
        * @param {object} [properties={}] - Relation properties.
        * @param {bool} [unique=false] - If include unique clause on create statement.
        * @returns {Promise.<object|Error>} Created relation literal object if fulfilled, or some neo4j error if rejected.
    */
    static relate(nodeId, type, otherNodeId, properties = {}, unique = false) {
        ORMNeoObjectParse.parseProperties(properties);
        let value = _.omitBy(properties, _.isUndefined);
        return new Promise((resolve, reject) => {
            if (_.isInteger(nodeId) && _.isInteger(otherNodeId)) {
                if (_.isString(type) && !_.isEmpty(type)) {
                    let uniqueQuery = (unique) ? 'UNIQUE' : '';
                    let cypher = `MATCH (n1) WHERE ID(n1)=${nodeId} 
                                  MATCH (n2) WHERE ID(n2)=${otherNodeId} 
                                  CREATE ${uniqueQuery} (n1)-[r:${type} ${ORMNeoObjectParse.objectString(value)}]->(n2)  
                                  RETURN r`;
                    let session = ORMNeo.session();
                    let readTxResultPromise = session.readTransaction(transaction =>  transaction.run(cypher, value));
                    readTxResultPromise.then((result) => {
                        let record = _.first(result.records);
                        session.close();
                        resolve(this._recordToRelation(record));
                    }).catch(function (error) {
                        reject(error);
                    });
                } else {
                    reject(new Error('A relatioship type must be specified'));
                }
            } else {
                reject(new Error('Ids from node must to be integers'));
            }
        });
    }

    /**
        * Update a relation propeties if it exists.
        *
        * @static
        * @param {integer} relationId - Relation node id.
        * @param {object} newProperties - Relation NEW properties.
        * @returns {Promise.<object|Error>} Updated relation literal object if fulfilled, or some neo4j error if rejected.
    */
    static update(relationId, newProperties) {
        ORMNeoObjectParse.parseProperties(newProperties);
        let value = _.omitBy(newProperties, _.isUndefined);
        return new Promise((resolve, reject) => {
            if (_.isInteger(relationId)) {
                let propertiesString = ORMNeoObjectParse.objectString(value);
                let cypher = 'MATCH p=(n1)-[r]->(n2) '+
                             `WHERE ID(r)=${relationId} SET r+=${propertiesString} RETURN r`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction(transaction =>  transaction.run(cypher, newProperties));
                readTxResultPromise.then((result) => {
                    session.close();
                    if (_.isEmpty(result.records)) {
                        resolve(null);
                    } else {
                        let record = _.first(result.records);
                        resolve(this._recordToRelation(record));
                    }
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Relation id must to be integers'));
            }
        });
    }

    /**
        * Find relation nodes.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} [otherNodeId=null] - Second in relation node id..
        * @param {string} [name=null] - Relation type name.
        * @param {ORMNeoWhere} [propertiesFilter=null] - Where object filter to be applied on find.
        * @returns {Promise.<array|Error>}  Found relation if fulfilled, or some neo4j error if rejected.
    */
    static find(nodeId, otherNodeId = null, name = null, propertiesFilter = null) {
        return new Promise((resolve, reject) => {
            if (_.isInteger(nodeId)) {
                let cypherMatch = this._cypherMatch(nodeId, otherNodeId, name, propertiesFilter);
                let cypher = `${cypherMatch} RETURN r`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction(transaction => transaction.run(cypher));
                readTxResultPromise.then((result) => {
                    session.close();
                    if (_.isEmpty(result.records)) {
                        resolve([]);
                    } else {
                        resolve(result.records.map(record => this._recordToRelation(record)));
                    }
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Both node ids have to be integers numbers'));
            }
        });
    }

    /**
        * Count relation nodes.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} [otherNodeId=null] - Second in relation node id..
        * @param {string} [name=null] - Relation type name.
        * @param {ORMNeoWhere} [propertiesFilter=null] - Where object filter to be applied on count.
        * @returns {Promise.<integer|Error>}  Count of relations if fulfilled, or some neo4j error if rejected.
    */
    static count(nodeId, otherNodeId = null, name = null, propertiesFilter = null) {
        return new Promise((resolve, reject) => {
            if (_.isInteger(nodeId)) {
                let cypherMatch = this._cypherMatch(nodeId, otherNodeId, name, propertiesFilter);
                let cypher = `${cypherMatch} RETURN COUNT(r) as count`;
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
                reject(new Error('Both node ids have to be integers numbers'));
            }
        });
    }

    /**
        * Check if there is relation nodes that matches parameters query.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} [otherNodeId=null] - Second in relation node id..
        * @param {string} [name=null] - Relation type name.
        * @param {ORMNeoWhere} [propertiesFilter=null] - Where object filter to be applied on exists.
        * @returns {Promise.<boolean|Error>}  True if there is some relation matching parameters and false otherwise if fulfilled, or some neo4j error if rejected.
    */
    static exists(nodeId, otherNodeId = null, name = null, propertiesFilter = null) {
        return new Promise((resolve, reject) => {
            this.count(nodeId, otherNodeId, name, propertiesFilter)
                .then((count) => {
                    resolve(count !== 0);
                }).catch((error) => {
                    reject(error);
                });
        });
    }

    /**
        * Delete relation by id.
        *
        * @static
        * @param {integer} relationId - relation node id.
        * @returns {Promise.<boolean|Error>} Deleted relation node if fulfilled, or some neo4j error if rejected.
    */
    static deleteRelation(relationId) {
        return new Promise((resolve, reject) => {
            if (_.isInteger(relationId)) {
                let cypher = `MATCH p=(n1)-[r]->(n2) WHERE ID(r)=${relationId} DELETE r RETURN r`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction(transaction =>  transaction.run(cypher));
                readTxResultPromise.then((result) => {
                    session.close();
                    if (_.isEmpty(result.records)) {
                        resolve(null);
                    } else {
                        let record = _.first(result.records);
                        resolve(this._recordToRelation(record));
                    }
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Relation id must to be integers numbers'));
            }
        });
    }

    /**
        * Deletes all relation nodes that matches parameters query.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} [otherNodeId=null] - Second in relation node id..
        * @param {string} [name=null] - Relation type name.
        * @param {ORMNeoWhere} [propertiesFilter=null] - Where object filter to be applied on delete.
        * @returns {Promise.<array|Error>}  Deleted nodes if fulfilled, or some neo4j error if rejected.
    */
    static deleteAll(nodeId, otherNodeId = null, name = null, propertiesFilter = null) {
        return new Promise((resolve, reject) => {
            if (_.isInteger(nodeId) && _.isInteger(otherNodeId)) {
                let cypherMatch = this._cypherMatch(nodeId, otherNodeId, name, propertiesFilter);
                let cypher = `${cypherMatch} DELETE r RETURN r`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction(transaction => transaction.run(cypher));
                readTxResultPromise.then((result) => {
                    session.close();
                    if (_.isEmpty(result.records)) {
                        resolve([]);
                    } else {
                        resolve(result.records.map(record => this._recordToRelation(record)));
                    }
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Both node ids have to be integers numbers'));
            }
        });
    }

    static _recordToRelation(record) {
        if (record) {
            let node = record.get('r');
            let obj = node.properties || {};
            obj.start = node.start.low;
            obj.end = node.end.low;
            obj.type = node.type;
            obj.id = node.identity.low;
            return obj;
        }
        return null;
    }

    static _filterQuery(propertiesFilter) {
        let filter = (propertiesFilter && propertiesFilter instanceof ORMNeoWhere && propertiesFilter) ? propertiesFilter.clause : '';
        return filter.replace('n.', 'r.');
    }

    static _cypherMatch(nodeId, otherNodeId = null, name = null, propertiesFilter = null) {
        let nameQuery = (name && _.isString(name) && !_.isEmpty(name)) ? `:${name}` : '';
        let rightNodeQuery = (otherNodeId && _.isInteger(otherNodeId)) ? `AND ID(n2)=${otherNodeId}` : '';
        let filter = this._filterQuery(propertiesFilter);
        filter = (filter !== '') ? `AND ${filter}` : '';
        return `MATCH p=(n1)-[r${nameQuery}]->(n2) ` +
               `WHERE ID(n1)=${nodeId} ${filter} ${rightNodeQuery}`;
    }

}

module.exports = ORMRelation;
