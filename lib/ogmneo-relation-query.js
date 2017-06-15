'use strict';

const _ = require('lodash');
const OGMNeoWhere = require('./ogmneo-where');
const OGMObjectParse = require('./ogmneo-parse');

/**
    * @class OGMNeoRelationQuery
 */
class OGMNeoRelationQuery {

    constructor(type) {
        this.type = type;
    }

    set type(type) {
        if (_.isString(type) && !_.isEmpty(type)) {
            this._type = type;
        }
    }

    get type() {
        return this._type;
    }

    static create(type) {
        return new OGMNeoRelationQuery(type);
    }

    startNode(nodeId, label) {
        if(_.isInteger(nodeId)) {
            this._startNodeId = nodeId;
        }
        if(_.isString(label)) {
            this._startNodeLabel = label;
        }
        return this;
    }

    endNode(nodeId, label) {
        if (_.isInteger(nodeId)) {
            this._endNodeId = nodeId;
        }
        if (_.isString(label)) {
            this._endNodeLabel = label;
        }
        return this;
    }

    startNodeWhere(where) {
        if (where == null || where instanceof OGMNeoWhere) {
            this._startNodeWhere = where;
            if (where) {
                this._startNodeWhere.variable = 'n1';
            }
        }
        return this;    
    }

    endNodeWhere(where) {
        if (where == null || where instanceof OGMNeoWhere) {
            this._endNodeWhere = where;
            if(where) {
                this._endNodeWhere.variable = 'n2';
            }
        }
        return this; 
    }

    relationWhere(where) {
        if (where == null || where instanceof OGMNeoWhere) {
            this._relationWhere = where;
            if (where) {
                this._relationWhere.variable = 'r';
            }
        }
        return this; 
    }

    limit(limit) {
        if (_.isInteger(limit)) {
            this._limit = limit;
        }
        return this;
    }

    /**
    * Add DESCENDING order by clause to this query object.
    *
    * @param {string|array} properties - The properties in order to order by for.
    * @returns {OGMNeoQuery} This instance of query.
    */
    descOrderBy(properties) {
        this._orderBy = {
            properties: properties,
            order: 'DESC'
        };
        return this;
    }

    /**
        * Add ASCENDING order by clause to this query object.
        *
        * @param {string|array} properties - The properties in order to order by for.
        * @returns {OGMNeoQuery} This instance of query.
    */
    ascOrderBy(properties) {
        this._orderBy = {
            properties: properties,
            order: 'ASC'
        };
        return this;
    }

    returnStartNode(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._returnStart = OGMObjectParse.parsePropertiesArray(properties, 'n1');
        }
        return this;
    }

    returnEndNode(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._returnEnd = OGMObjectParse.parsePropertiesArray(properties, 'n2');
        }
        return this;
    }

    returnRelationNode(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._returnRelation = OGMObjectParse.parsePropertiesArray(properties, 'r');
        }
        return this;
    }

    matchCypher() {
        return `MATCH p=(${this._startNodeClause()})-[${this._relationClause()}]->(${this._endNodeClause()}) ${this.whereCypher()}`;
    }

    whereCypher() {
        let where = '';
        if(this._startNodeId) {
            where = this._concatWhereClause(where, `ID(n1) = ${this._startNodeId}`);
        }
        if (this._endNodeId) {
            where = this._concatWhereClause(where, `ID(n2) = ${this._endNodeId}`);
        }
        if (this._relationWhere) {
            where = this._concatWhereClause(where, this._relationWhere.clause);
        }
        if (this._startNodeWhere) {
            where = this._concatWhereClause(where, this._startNodeWhere.clause);
        }
        if (this._endNodeWhere) {
            where = this._concatWhereClause(where, this._endNodeWhere.clause);
        }
        return (where !== '') ? `WHERE ${where}` : '';
    }

    _concatWhereClause(whereClause, newClause) {
        let and = '';
        if (whereClause !== '') {
            and = ' AND ';
        }
        return whereClause + and + newClause;
    }

    _startNodeClause() {
        return 'n1' + ((this._startNodeLabel) ? `:${this._startNodeLabel}` : '');
    }
    _endNodeClause() {
        return 'n2' + ((this._endNodeLabel) ? `:${this._endNodeLabel}` : '');
    }
    _relationClause() {
        return 'r' + ((this._type) ? `:${this._type}` : '');
    }

    returnClause(populated = false) {
        let returnClause = (this._returnRelation) ? this._returnRelation: 'r';
        if (populated) {
            returnClause += ', ' + ((this._returnStart) ? this._returnStart : 'n1');
            returnClause += ', ' + ((this._returnEnd) ? this._returnEnd : 'n2');
        }
        return `RETURN ${returnClause}`;
    }

    orderByClause(variable = 'r') {
        if (this._orderBy && OGMObjectParse.isValidPropertiesArray(this._orderBy.properties)) {
            let properties = OGMObjectParse.parsePropertiesArray(this._orderBy.properties, variable);
            return `ORDER BY ${properties} ${this._orderBy.order}`;
        }
        return '';
    }

    limitClause() {
        return (this._limit) ? `LIMIT ${this._limit}` : '';
    }

    queryCypher() {
        return this._queryCypherBuilder(false);
    }

    queryPopulatedCypher() {
        return this._queryCypherBuilder(true);
    }

    _queryCypherBuilder(populated = false) {
        let query = `${this.matchCypher()} ${this.returnClause(populated)}`;
        let orderBy = this.orderByClause();
        let limit = this.limitClause();
        if (orderBy !== '') {
            query += ` ${orderBy}`;
        }
        if (limit !== '') {
            query += ` ${limit}`;
        }
        return query;
    }
}

module.exports = OGMNeoRelationQuery;