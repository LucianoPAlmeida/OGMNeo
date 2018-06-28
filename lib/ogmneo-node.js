'use strict';

const _ = require('lodash');

const OGMNeoQuery = require('./ogmneo-query');
const OGMNeoObjectParse = require('./ogmneo-parse');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('./ogmneo-operation');
const OGMNeoOperationExecuter = require('./ogmneo-operation-executer');

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
        let operation = this.createOperation(node, label);
        return OGMNeoOperationExecuter.execute(operation);
    }

    /**
        * Operation that creates a node on neo4j.
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
            }).build();
    }


    /**
      * Merges a node on neo4j.
      *
      * @static
        * @param {object} node - The literal object with node propeperties.
        * @param {string} [label=null] - The label of the node. Default null is a node without label. 
        * @returns {Promise<object|Error>} Created node literal object if fulfilled, or some neo4j error if rejected.
    */
    static merge(node, label = null) {
        let operation = this.mergeOperation(node, label);
        return OGMNeoOperationExecuter.execute(operation);
    }

    /**
    * Operation that merges a node on neo4j.
    *
    * @static
    * @param {object} node - The literal object with node propeperties.
    * @param {string} [label=null] - The label of the node. Default null is a node without label. 
    * @returns {OGMNeoOperation} Create node operation that can be executed later.
    */

    static mergeOperation(node, label = null) {
        let value = _.omitBy(node, _.isUndefined);
        OGMNeoObjectParse.parseProperties(value);
        let objectString = OGMNeoObjectParse.objectString(value);
        let labelCypher = (!_.isEmpty(label) && _.isString(label)) ? `:${label}` : '';
        let cypher = `MERGE (n${labelCypher} ${objectString}) RETURN n`;
        return OGMNeoOperationBuilder.create()
            .cypher(cypher)
            .object(value)
            .type(OGMNeoOperation.WRITE).then((result) => {
                let record = _.first(result.records);
                return OGMNeoObjectParse.parseRecordNode(record, 'n');
            }).build();
    }



    /**
        * Updates a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {Promise.<object|Error>} Updated node literal object if fulfilled, or error if node.id is invalid or some neo4j error if rejected.
    */
    static update(node) {
        try {
            let operation = this.updateOperation(node);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that updates a node.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {OGMNeoOperation} Update node operation that can be executed later.
        * @throws {Error} Will throw an error if the node.id was not integer or not exists.
    */
    static updateOperation(node) {
        let value = _.omitBy(node, _.isUndefined);
        OGMNeoObjectParse.parseProperties(value);
        if (value && value.id != undefined && _.isInteger(value.id)) {
            let objectString = OGMNeoObjectParse.objectString(value);
            let cypher = `MATCH (n) WHERE ID(n)=${node.id} SET n+=${objectString} RETURN n`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .object(value)
                .type(OGMNeoOperation.WRITE).then((result) => {
                    let record = _.first(result.records);
                    return OGMNeoObjectParse.parseRecordNode(record, 'n');
                }).build();
        } else {
            throw new Error('Node must have an integer id to be updated');
        }
    }

    /**
        * Update new properties on every node that matches the query.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter the nodes.
        * @param {object} newProperties - NEW properties.
        * @returns {Promise.<array|Error>} Updated nodes if fulfilled or some neo4j error if rejected.
    */
    static updateMany(query, newProperties) {
        try {
            let operation = this.updateManyOperation(query, newProperties);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
          * Returns an operation that updates new properties on every node that matches the query.
          *
          * @static
          * @param {OGMNeoQuery} query - The query to filter the nodes.
          * @param {object} newProperties - NEW properties.
          * @returns {OGMNeoOperation} Operation that updates new properties on every node that matches the query.
          * @throws {Error} Will throw an error if the query is not an instance of ogmneo.Query.
          * @throws {Error} Will throw an error if newProperties is not an object.
          * @throws {Error} Will throw an error if newProperties don't have at least one property with NO undefined values to update.
      */
    static updateManyOperation(query, newProperties) {
        if (_.isObject(newProperties)) {
            let value = _.omitBy(newProperties, _.isUndefined);
            if (!_.isEmpty(value)) {
                OGMNeoObjectParse.parseProperties(value);
                if (query instanceof OGMNeoQuery) {
                    let objectString = OGMNeoObjectParse.objectString(value);
                    let cypher = `${query.matchCypher()} SET n+=${objectString} RETURN n`;
                    return OGMNeoOperationBuilder.create()
                        .cypher(cypher)
                        .object(value)
                        .type(OGMNeoOperation.WRITE).then((result) => {
                            return result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n'));
                        }).build();
                } else {
                    throw new Error('The query object must be an instance of OGMNeoQuery');
                }
            } else {
                throw new Error('You must provide at least one property with NO undefined values to update');
            }
        } else {
            throw new Error('The new properties must be an object');
        }
    }

    /**
        * Deletes a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {Promise.<boolean|Error>} True if fulfilled and found and delete node, false if not found object to delete, or error if node.id is invalid or some neo4j error if rejected.
    */
    static delete(node) {
        try {
            let operation = this.deleteOperation(node);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that deletes a node on neo4j.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {OGMNeoOperation} Operation that deletes a node.
        * @throws {Error} Will throw an error if the node.id was not integer or not exists.
    */
    static deleteOperation(node) {
        if (node && node.id != undefined && _.isInteger(node.id)) {
            let cypher = `MATCH (n) WHERE ID(n)=${node.id} DELETE n RETURN n`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.WRITE).then((result) => {
                    return !_.isEmpty(result.records);
                }).build();
        } else {
            throw new Error('Node must to have an non-nil property id to be deleted');
        }
    }

    /**
        * Deletes a node and it's relation from database.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {Promise.<boolean|Error>} True if fulfilled and found and delete node, false if not found object to delete, or error if node.id is invalid or some neo4j error if rejected.
    */
    static deleteCascade(node) {
        try {
            let operation = this.deleteCascadeOperation(node);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that deletes a node and it's relation from database.
        *
        * @static
        * @param {object} node - The literal object with node propeperties and required node.id.
        * @returns {OGMNeoOperation} Operation that deletes a node.
        * @throws {Error} Will throw an error if the node.id was not integer or not exists.
    */
    static deleteCascadeOperation(node) {
        if (node && node.id != undefined && _.isInteger(node.id)) {
            let cypher = `MATCH (n) WHERE ID(n)=${node.id} DETACH DELETE n RETURN n`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.WRITE).then((result) => {
                    return !_.isEmpty(result.records);
                }).build();
        } else {
            throw new Error('Node must to have an non-nil property id to be deleted');
        }
    }

    /**
        * Deletes every node that matches the ogmneo.Query.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter the nodes.
        * @returns {Promise.<number|Error>} Number of nodes deleted if fulfilled or some neo4j error if rejected.
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
        * Creates an operation that deletes every node that matches the query.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter the nodes.
        * @returns {OGMNeoOperation} Operation that deletes the matched nodes.
        * @throws {Error} Will throw an error if the query was not a instance of ogmneo.Query.
    */
    static deleteManyOperation(query) {
        if (query instanceof OGMNeoQuery) {
            let cypher = `${query.matchCypher()} DELETE n RETURN n`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.WRITE)
                .then((result) => {
                    return result.records.length;
                }).build();
        } else {
            throw new Error('The query object must be an instance of OGMNeoQuery');
        }
    }

    /**
        * Retrive node with id.
        *
        * @static
        * @param {integer} id - The id of node that's wanted.
        * @returns {Promise.<object|Error>} Object if found fulfilled or null if not found fulfilled, or error if the id is invalid or some neo4j error if rejected.
    */
    static nodeWithId(id) {
        try {
            let operation = this.nodeWithIdOperation(id);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Creates a operation that retrives a node with id.
        *
        * @static
        * @param {integer} id - The id of node that's wanted.
        * @returns {OGMNeoOperation} Operation retrives a node.
        * @throws {Error} Will throw an error if id was not an integer value.
    */
    static nodeWithIdOperation(id) {
        if (_.isInteger(id)) {
            let cypher = `MATCH (n) WHERE ID(n)=${id} RETURN n`;
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    let record = _.first(result.records);
                    return OGMNeoObjectParse.parseRecordNode(record, 'n');
                }).build();
        } else {
            throw new Error('You must provide an non-null integer id property to find the node');
        }
    }

    /**
        * Retrive nodes with ids.
        *
        * @static
        * @param {array} ids - The ids of nodes that are wanted.
        * @returns {Promise.<array|Error>} An array of nodes if found fulfilled or null if not found fulfilled, or error if the ids are invalid or some neo4j error if rejected.
    */
    static manyWithIds(ids) {
        try {
            let operation = this.manyWithIdsOperation(ids);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation to retrive nodes with ids.
        *
        * @static
        * @param {array} ids - The ids of nodes that are wanted.
        * @returns {OGMNeoOperation} Operation that query the nodes with the ids.
        * @throws {Error} Will throw an error if you don't provide any valid id to retrive.
        * @throws {Error} Will throw an error if the ids are not an array.

    */
    static manyWithIdsOperation(ids) {
        if (_.isArray(ids)) {
            let validIds = ids.filter(id => _.isInteger(id));
            if (_.isEmpty(validIds)) {
                throw new Error('You must provide at least one valid(integer) id to query');
            } else {
                let idsQuery = validIds.reduce((result, current) => {
                    return result + ((result === '') ? '' : ',') + ` ${current}`;
                }, '');
                let cypher = `MATCH (n) WHERE ID(n) IN [${idsQuery}] RETURN n`;
                return OGMNeoOperationBuilder.create()
                    .cypher(cypher)
                    .type(OGMNeoOperation.READ)
                    .then((result) => {
                        return result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n'));
                    }).build();
            }
        } else {
            throw new Error('The parameter must be an array of ids');
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
        try {
            let operation = this.countOperation(query);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Creates an operation count of nodes with a query object.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be counted.
        * @returns {OGMNeoOperation} Operation that query the count of the nodes with query.
        * @throws {Error} Will throw an error if the query was not a instance of ogmneo.Query.
    */
    static countOperation(query) {
        if (query && query instanceof OGMNeoQuery) {
            let cypher = query.countCypher();
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    let record = _.first(result.records);
                    return (record != null) ? record.get('count').low : 0;
                }).build();
        } else {
            throw new Error('A OGMNeoQuery object must to be provided');
        }
    }

    /**
        * Find nodes filtered by query parameter.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be returned.
        * @returns {Promise.<array|Error>} Nodes if fulfilled, some neo4j error if rejected.
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
        * Operation for find nodes filtered by the query parameter.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be returned.
        * @returns {OGMNeoOperation} Operation that returns the nodes with query.
        * @throws {Error} Will throw an error if the query was not a instance of ogmneo.Query.
    */
    static findOperation(query) {
        if (query && query instanceof OGMNeoQuery) {
            let cypher = query.queryCypher();
            return OGMNeoOperationBuilder.create()
                .cypher(cypher)
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    return result.records.map((record) => OGMNeoObjectParse.parseRecordNode(record, 'n'));
                }).build();
        } else {
            throw new Error('A OGMNeoQuery object must to be provided');
        }
    }

    /**
        * Find one node filtered by query parameter. Will return the first node that it finds.
        *
        * @static
        * @param {OGMNeoQuery} query - The query to filter nodes that have to be returned.
        * @returns {Promise.<object|Error>} Node found if fulfilled, some neo4j error if rejected.
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
        * Operation that find one node filtered by query parameter.
        *
        * @static
        * @param {OGMNeoQuery} query  The query to filter nodes that have to be returned.
        * @returns {OGMNeoOperation} Operation that returns the node with query.
        * @throws {Error} Will throw an error if the query was not a instance of ogmneo.Query.
    */
    static findOneOperation(query) {
        if (query && query instanceof OGMNeoQuery) {
            query.limit(1);
            return OGMNeoOperationBuilder.create()
                .cypher(query.queryCypher())
                .type(OGMNeoOperation.READ)
                .then((result) => {
                    let record = _.first(result.records);
                    return (record != null) ? OGMNeoObjectParse.parseRecordNode(record, 'n') : null;
                }).build();
        } else {
            throw new Error('A OGMNeoQuery object must to be provided');
        }
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
        try {
            let operation = this.addLabelToNodeOperation(label, nodeId);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation to add a label to a node.
        *
        * @static
        * @param {string} label - The label to be added to the node.
        * @param {integer} nodeId - The id of the node to add the label.
        * @returns {OGMNeoOperation} Operation that adds a label.
        * @throws {Error} Will throw an error if the nodeId was not an integer value.
        * @throws {Error} Will throw an error if the label was anything diferent than an non-empty string.
    */
    static addLabelToNodeOperation(label, nodeId) {
        if (_.isInteger(nodeId)) {
            let operation = this.addLabelToNodesOperation(label, [nodeId]);
            operation.then = (result) => {
                let record = _.first(result.records);
                return (record != null) ? OGMNeoObjectParse.parseRecordNode(record, 'n') : null; 
            };
            return operation;
        } else {
            throw new Error('The nodeId must be an integer value');
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
        try {
            let operation = this.removeLabelFromNodeOperation(label, nodeId);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        *  Operation to remove a label from a node.
        *
        * @static
        * @param {string} label - The label to be removed from the node.
        * @param {integer} nodeId - The id of the node to remove the label from.
        * @returns {OGMNeoOperation} Operation that removes a label.
        * @throws {Error} Will throw an error if the nodeId was not an integer value.
        * @throws {Error} Will throw an error if the label was anything diferent than an non-empty string.
    */
    static removeLabelFromNodeOperation(label, nodeId) {
        if (_.isInteger(nodeId)) {
            let operation = this.removeLabelFromNodesOperation(label, [nodeId]);
            operation.then = (result) => {
                let record = _.first(result.records);
                return (record != null) ? OGMNeoObjectParse.parseRecordNode(record, 'n') : null; 
            };
            return operation;
        } else {
            throw new Error('The nodeId must be an integer value');
        }
    }

    /**
        * Adding label to nodes.
        *
        * @static
        * @param {string} label - The label to be added to the node.
        * @param {array} nodesIds - The ids of the nodes to add the label.
        * @returns {Promise<array|Error>} Nodes(if nodes exists) or null(if not exists) if fulfilled, some error if rejected.
    */
    static addLabelToNodes(label, nodesIds) {
        try {
            let operation = this.addLabelToNodesOperation(label, nodesIds);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that adds a label to nodes.
        *
        * @static
        * @param {string} label - The label to be added to the node.
        * @param {array} nodesIds - The ids of the nodes to add the label.
        * @returns {OGMNeoOperation} Operation that removes a label.
        * @throws {Error} Will throw an error if you don't provide at least one valid id to this operation.
        * @throws {Error} Will throw an error if the label was anything diferent than an non-empty string.
    */
    static addLabelToNodesOperation(label, nodesIds) {
        if (_.isString(label) && !_.isEmpty(label)) {
            let params = this._validateAndBuildParams(nodesIds);
            if (params != null) {
                let cypher = `MATCH (n) WHERE ID(n) IN ${params} SET n:${label} RETURN n`;
                return OGMNeoOperationBuilder
                    .create()
                    .cypher(cypher)
                    .type(OGMNeoOperation.WRITE)
                    .then((result) => {
                        return result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n'));
                    }).build();
            } else {
                throw new Error('You must provide at least one valid id to this operation');
            }
        } else {
            throw new Error('label must be a non empty string');
        }
    }

    /**
        * Remove label from nodes.
        *
        * @static
        * @param {string} label - The label to be removed from the nodes.
        * @param {array} nodeIds - The ids of the nodes to remove the label from.
        * @returns {Promise.<array|Error>} Nodes(if nodes exists) or null(if not exists) if fulfilled, some error if rejected.
    */
    static removeLabelFromNodes(label, nodesIds) {
        try {
            let operation = this.removeLabelFromNodesOperation(label, nodesIds);
            return OGMNeoOperationExecuter.execute(operation);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
        * Operation that removes a label from nodes.
        *
        * @static
        * @param {string} label - The label to be removed from the nodes.
        * @param {array} nodeIds - The ids of the nodes to remove the label from.
        * @returns {OGMNeoOperation} Operation that removes a label from many nodes.
        * @throws {Error} Will throw an error if you don't provide at least one valid id to this operation.
        * @throws {Error} Will throw an error if the label was anything diferent than an non-empty string.
    */
    static removeLabelFromNodesOperation(label, nodesIds) {
        if (_.isString(label) && !_.isEmpty(label)) {
            let params = this._validateAndBuildParams(nodesIds);
            if (params) {
                let cypher = `MATCH (n:${label}) WHERE ID(n) IN ${params} REMOVE n:${label} RETURN n`;
                return OGMNeoOperationBuilder
                    .create()
                    .cypher(cypher)
                    .type(OGMNeoOperation.WRITE)
                    .then((result) => {
                        return result.records.map(record => OGMNeoObjectParse.parseRecordNode(record, 'n'));
                    }).build();
            } else {
                throw new Error('You must provide at least one valid id to this operation');
            }
        } else {
            throw new Error('label must be a non empty string');
        }
    }

    static _validateAndBuildParams(nodesIds) {
        if (_.isArray(nodesIds)) {
            let validIds = nodesIds.filter(id => _.isInteger(id));
            if (_.isEmpty(validIds)) {
                return null;
            } else {
                let parameters = validIds.reduce((result, current) => {
                    return result + `${(result === '') ? '' : ','} ${current}`;
                }, '');
                return `[${parameters}]`;
            }
        } else {
            throw new Error('nodesIds must be an array');
        }
    }
}

module.exports = OGMNeoNode;