'use strict';

const _ = require('lodash');
const OGMNeoWhere = require('./ogmneo-where');
const OGMObjectParse = require('./ogmneo-parse');

/**
    * @class OGMNeoQuery
 */
class OGMNeoQuery {

    /**
        * Constructs a query object with an label.
        *
        * @constructor
        * @param {string=} label - The query to filter nodes that have to be returned.
    */
    constructor(label) {
        this.label = label;
    }

    /**
        * Convenience method that creates a query object with an label.
        *
        * @static
        * @param {string=} label - The query to filter nodes that have to be returned.
        * @returns {OGMNeoQuery} Created query with label.
    */
    static create(label) {
        return new OGMNeoQuery(label);
    }

    set label(value) {
        if (value && _.isString(value) && !_.isEmpty(value)) {
            this._label = value;
        }
    }
    /**
     * @type {string}
    */
    get label() {
        return this._label;
    }

    /**
     * @type {OGMNeoWhere}
    */
    get whereObject() {
        return  this._where;
    }

    where(value) {
        if (value == null || value instanceof OGMNeoWhere) {
            this._where = value; 
        } else {
            throw new Error('where parameter must be an instance of OGMNeoWhere class or null');
        }
        return this;
    } 

    /**
        * Add limit constraint to this query object.
        *
        * @param {integer} value - The max number of values that should be returned.
        * @returns {OGMNeoQuery} This instance of query.
    */
    limit(value) {
        if (_.isInteger(value)) {
            this._limit = value;
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

    /**
        * Add the properties that must be returned in the objects.
        *
        * @param {string|array} properties - The properties that must to be returned.
        * @returns {OGMNeoQuery} This instance of query.
    */
    return(properties) {
        if (OGMObjectParse.isValidPropertiesArray(properties)) {
            this._return = `RETURN ${OGMObjectParse.parsePropertiesArray(properties)}`;
        }
        return this;
    }

    orderByClause(variable = 'n') {
        if (this._orderBy && OGMObjectParse.isValidPropertiesArray(this._orderBy.properties)) {
            let properties = OGMObjectParse.parsePropertiesArray(this._orderBy.properties, variable);
            return `ORDER BY ${properties} ${this._orderBy.order}`;
        }
        return '';
    }

    limitClause() {
        return (this._limit) ? `LIMIT ${this._limit}` : '';
    }

    returnClause() {
        return (this._return !== undefined) ? this._return : 'RETURN n';
    }
    /**
        * Return cypher query string for count that represents this query.
        *
        * @returns {string} Cypher count match string.
    */
    countCypher() {
        let queryLabel = (this.label) ? `:${this.label}` : '';
        let cypher = `MATCH (n${queryLabel}) ${this._whereStatement()} RETURN COUNT(n) as count`;
        return cypher;
    }

    /**
        * Return full cypher query string related to this query.
        *
        * @returns {string} Cypher query.
    */
    queryCypher() {
        let order = this.orderByClause();
        order = (order !== '')? ` ${order}` : '';
        return `${this.matchCypher()} ${this.returnClause()}${order} ${this.limitClause()}`.trim();
    }

    /**
        * Return ONLY MATCH cypher statement string that represents this query.
        *
        * @returns {string} Cypher match query.
    */
    matchCypher() {
        let queryLabel = (this.label) ? `:${this.label}` : '';
        return `MATCH (n${queryLabel}) ${this._whereStatement()}`.trim();
    }

    _whereStatement() {
        return (this.whereObject == null) ? '' : `WHERE ${this.whereObject.clause}`;
    }
}

module.exports = OGMNeoQuery;

