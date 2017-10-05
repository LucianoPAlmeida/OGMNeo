'use strict';

const OGMNeo = require('./ogmneo');
const OGMNeoObjectParse = require('./ogmneo-parse');
const OGMNeoRelationQuery = require('./ogmneo-relation-query');
const Printer = require('./ogmneo-printer');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('./ogmneo-operation');
const OGMNeoOperationExecuter = require('./ogmneo-operation-executer');

const _ = require('lodash');

/**
    * @class OGMRelation
 */
class OGMRelation {
    /**
        * Creates a relation between two nodes if they both exists.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} otherNodeId - Second in relation node id.
        * @param {string} type - Case sensitive relation type name.
        * @param {object} [properties={}] - Relation properties.
        * @param {bool} [unique=false] - If include unique clause on create statement.
        * @returns {Promise.<object|Error>} Created relation literal object if fulfilled, or some neo4j error if rejected.
    */
    static relate(nodeId, type, otherNodeId, properties = {}, unique = false) {
        try {
            let operation = this.relateOperation(nodeId, type, otherNodeId, properties, unique);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that creates a relation between two nodes if they both exists.
        *
        * @static
        * @param {integer} nodeId - First in relation node id.
        * @param {integer} otherNodeId - Second in relation node id.
        * @param {string} type - Case sensitive relation type name.
        * @param {object} [properties={}] - Relation properties.
        * @param {bool} [unique=false] - If include unique clause on create statement.
        * @returns {OGMNeoOperation} Operation that creates the relation between nodes.
        * @throws {Error} Will throw an error if the ids from node was not integers.
        * @throws {Error} Will throw an error if a relatioship type was not an non-empty string.
    */

    static relateOperation(nodeId, type, otherNodeId, properties = {}, unique = false) {
        OGMNeoObjectParse.parseProperties(properties);
        let value = _.omitBy(properties, _.isUndefined);
        if (_.isInteger(nodeId) && _.isInteger(otherNodeId)) {
            if (_.isString(type) && !_.isEmpty(type)) {
                let uniqueQuery = (unique) ? 'UNIQUE' : '';
                let cypher = `MATCH (n1) WHERE ID(n1)=${nodeId} ` +
                    `MATCH (n2) WHERE ID(n2)=${otherNodeId} ` +
                    `CREATE ${uniqueQuery} (n1)-[r:${type} ${OGMNeoObjectParse.objectString(value)}]->(n2) ` +
                    'RETURN r';

                return OGMNeoOperationBuilder.create()
                    .cypher(cypher)
                    .type(OGMNeoOperation.WRITE)
                    .object(value)
                    .then((result) => {
                        let record = _.first(result.records);
                        return OGMNeoObjectParse.recordToRelation(record);
                    }).build();
            } else {
                throw new Error('A relatioship type must be specified');
            }
        } else {
            throw new Error('Ids from node must to be integers');
        }
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
        try {
            let operation = this.updateOperation(relationId, newProperties);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that update a relation propeties if it exists.
        *
        * @static
        * @param {integer} relationId - Relation node id.
        * @param {object} newProperties - Relation NEW properties.
        * @returns {OGMNeoOperation} Operation that creates the relation between nodes.
        * @throws {Error} Will throw an error if the id from relation node was not integer.
    */
    static updateOperation(relationId, newProperties) {
        OGMNeoObjectParse.parseProperties(newProperties);
        let value = _.omitBy(newProperties, _.isUndefined);
        if (_.isInteger(relationId)) {
            let propertiesString = OGMNeoObjectParse.objectString(value);
            let cypher = 'MATCH p=(n1)-[r]->(n2) ' +
                `WHERE ID(r)=${relationId} SET r+=${propertiesString} RETURN r`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.WRITE)
                .object(value)
                .then((result) => {
                    let record = _.first(result.records);
                    return (record != null) ? OGMNeoObjectParse.recordToRelation(record) : null;
                }).build();
        } else {
            throw new Error('Relation id must to be integer');
        }
    }

    /**
        * Set or update newPropeties on all relation nodes that matches parameters query.
        *
        * @static
        * @param {object} newProperties - New properties ot be set or updated.
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<array|Error>}  Updated nodes if fulfilled, or some neo4j error if rejected.
    */
    static updateMany(newProperties, query) {
        try {
            let operation = this.updateManyOperation(newProperties, query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that set or update newPropeties on all relation nodes that matches parameters query.
        *
        * @static
        * @param {object} newProperties - New properties ot be set or updated.
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that updates properties on the relation nodes.
        * @throws {Error} Will throw an error if query was not an instance of ogmneo.RelationQuery.
        * @throws {Error} Will throw an error if newProperties was not an object.
        * @throws {Error} Will throw an error if newProperties was was empty.
    */
    static updateManyOperation(newProperties, query) {
        if (_.isObject(newProperties)) {
            let value = _.omitBy(newProperties, _.isUndefined);
            if (!_.isEmpty(value)) {
                OGMNeoObjectParse.parseProperties(value);
                if (query != null && query instanceof OGMNeoRelationQuery) {
                    let cypherMatch = query.matchCypher();
                    let propertiesString = OGMNeoObjectParse.objectString(value);
                    let cypher = `${cypherMatch} SET r+=${propertiesString} RETURN r`;
                    return OGMNeoOperationBuilder.create()
                        .cypher(cypher)
                        .type(OGMNeoOperation.WRITE)
                        .object(value)
                        .then((result) => {
                            return result.records.map(record => OGMNeoObjectParse.recordToRelation(record));
                        }).build();
                } else {
                    throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
                }
            } else {
                throw new Error('newProperties must be an object with at least one valid property to update');
            }
        } else {
            throw new Error('newProperties must be an object');
        }
    }

    /**
        * Find relation nodes.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<array|Error>}  Found relation if fulfilled, or some neo4j error if rejected.
    */
    static find(query) {
        try {
            let operation = this.findOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * An operation that finds relation nodes that matches queries.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that find the relation nodes.
        * @throws {Error} Will throw an error if the query object was null or not an instance of OGMNeoRelationQuery.
    */
    static findOperation(query) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            let cypher = query.queryCypher();
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    return result.records.map(record => OGMNeoObjectParse.parseRelation(record));
                }).build();
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }


    /**
        * Find one relation node.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<object|Error>}  Found relation if fulfilled, or some neo4j error if rejected.
    */
    static findOne(query) {
        try {
            let operation = this.findOneOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation to find one relation node that matches query.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that find one relation node.
        * @throws {Error} Will throw an error if the query object was null or not an instance of OGMNeoRelationQuery.
    */
    static findOneOperation(query) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            query.limit(1);
            let operation = this.findOperation(query);
            operation.then = (result) => {
                let record = _.first(result.records);
                return (record != null) ? OGMNeoObjectParse.parseRelation(record) : null;
            };
            return operation;
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }

    /**
        * Find relation nodes with start and end nodes populated.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<array|Error>}  Found populated relation if fulfilled, or some neo4j error if rejected.
    */
    static findPopulated(query) {
        try {
            let operation = this.findPopulatedOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }


    /**
        * Operation that find relation nodes with start and end nodes populated.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that find relations nodes.
        * @throws {Error} Will throw an error if the query object was null or not an instance of ogmneo.RelationQuery.
    */
    static findPopulatedOperation(query) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            let cypher = query.queryPopulatedCypher();
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    return result.records.map(record => OGMNeoObjectParse.recordToRelationPopulated(record));
                }).build();
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }
    
    /**
        * Find one Populated relation node.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<object|Error>}  Populated found relation if fulfilled, or some neo4j error if rejected.
    */
    static findOnePopulated(query) {
        try {
            let operation = this.findOnePopulatedOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation to find one populated relation node.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that find one populated relation node.
        * @throws {Error} Will throw an error if the query object was null or not an instance of ogmneo.RelationQuery.
    */
    static findOnePopulatedOperation(query) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            query.limit(1);
            let operation = this.findPopulatedOperation(query);
            operation.then = (result) => {
                let record = _.first(result.records);
                return (record != null) ? OGMNeoObjectParse.recordToRelationPopulated(record) : null;
            };
            return operation;
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }

    /**
        * Find start and end nodes for the relation. Do not return relation properties to find relation properties use find or find populated.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @param {string} [nodes='both'] - The return nodes. 'both'/null = return start and end nodes, 'start' = return start nodes, 'end' = return end nodes
        * @param {boolean} [distinct = false] - Add distinct clause to cypher return.
        * @returns {Promise.<array|Error>}  Found populated relation if fulfilled, or some neo4j error if rejected.
    */
    static findNodes(query, nodes = 'both', distinct = false) {
        try {
            let operation = this.findNodesOperation(query, nodes, distinct);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.resolve(error);
        }
    }


    /**
        * Operation to find start and end nodes for the relation. Do not return relation properties to find relation properties use find or find populated.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @param {string} [nodes='both'] - The return nodes. 'both'/null = return start and end nodes, 'start' = return start nodes, 'end' = return end nodes
        * @param {boolean} [distinct = false] - Add distinct clause to cypher return.
        * @returns {OGMNeoOperation} Operation that find start and end nodes with query.
        * @throws {Error} Will throw an error if the query object was null or not an instance of ogmneo.RelationQuery.
    */
    static findNodesOperation(query, nodes = 'both', distinct = false) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            let cypher = query.queryNodesCypher(nodes, distinct);
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    return result.records.map(record => OGMNeoObjectParse.recordToRelationStartEndNodes(record, nodes));
                }).build();
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }

    /**
        * Count relation nodes.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<integer|Error>}  Count of relations if fulfilled, or some neo4j error if rejected.
    */
    static count(query) {
        try {
            let operation = this.countOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that counts relation nodes.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that count nodes with query.
        * @throws {Error} Will throw an error if the query object was null or not an instance of ogmneo.RelationQuery.
    */
    static countOperation(query) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            let cypher = query.countCypher();
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    let record = _.first(result.records);
                    return (record != null) ? record.get('count').low : 0;
                }).build();
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }

    /**
        * Check if there is relation nodes that matches parameters query.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<boolean|Error>}  True if there is some relation matching parameters and false otherwise if fulfilled, or some neo4j error if rejected.
    */
    static exists(query) {
        return new Promise((resolve, reject) => {
            this.count(query)
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
        try {
            let operation = this.deleteRelationOperation(relationId);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }


    /**
        * Operation that deletes a relation by id.
        *
        * @static
        * @param {integer} relationId - relation node id.
        * @returns {OGMNeoOperation} Operation that deletes a node with id.
        * @throws {Error} Will throw an error if the relation id was not an integer value.
    */
    static deleteRelationOperation(relationId) {
        if (_.isInteger(relationId)) {
            let cypher = `MATCH p=(n1)-[r]->(n2) WHERE ID(r)=${relationId} DELETE r RETURN r`;
            return OGMNeoOperationBuilder.create().cypher(cypher)
                .type(OGMNeoOperation.WRITE)
                .then((result) => {
                    let record = _.first(result.records);
                    return (record != null) ? OGMNeoObjectParse.recordToRelation(record) : null;
                }).build();
        } else {
            throw new Error('Relation id must to be an integer number');
        }
    }

    /**
        * Deletes all relation nodes that matches parameters query.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {Promise.<array|Error>}  Deleted nodes if fulfilled, or some neo4j error if rejected.
    */
    static deleteMany(query) {
        try {
            let operation = this.deleteManyOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that deletes all relation nodes that matches parameters query.
        *
        * @static
        * @param {OGMNeoRelationQuery} query - Query filter.
        * @returns {OGMNeoOperation} Operation that deletes nodes with query.
        * @throws {Error} Will throw an error if the query object was null or not an instance of ogmneo.RelationQuery.
    */
    static deleteManyOperation(query) {
        if (query != null && query instanceof OGMNeoRelationQuery) {
            let cypherMatch = query.matchCypher();
            let cypher = `${cypherMatch} DELETE r RETURN r`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.WRITE)
                .then((result) => {
                    return result.records.map(record => OGMNeoObjectParse.recordToRelation(record));
                }).build();
        } else {
            throw new Error('The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        }
    }
}

module.exports = OGMRelation;
