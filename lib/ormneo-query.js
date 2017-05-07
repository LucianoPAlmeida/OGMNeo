'use strict';

const _ = require('lodash');

/**
    * @class ORMNeoQuery
 */
class ORMNeoQuery {

    /**
        * Constructs a query object with an label.
        *
        * @constructor
        * @param {string=} label - The query to filter nodes that have to be returned.
    */
    constructor(label) {
        this._queryObject = {
            where: ''
        };
        this.label = label;
    }

    /**
        * Convenience method that creates a query object with an label.
        *
        * @static
        * @param {string=} label - The query to filter nodes that have to be returned.
        * @returns {ORMNeoQuery} Created query with label.
    */
    static query(label) {
        return new ORMNeoQuery(label);
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
     * @type {object}
     */
    get queryObject() {
        return this._queryObject;
    }

    /**
        * Add limit constraint to this query object.
        *
        * @param {integer} value - The max number of values that should be returned.
        * @returns {ORMNeoQuery} This instance of query.
    */
    limit(value) {
        if (_.isInteger(value)) {
            this.queryObject.limit = value;
        }
        return this;
    }

    /**
        * Add AND filter constraint to this query object.
        *
        * @param {string} property - Name of the property that the filter will be applied.
        * @param {object} filter - Filter that will be applied. Example: {$eq: 'v'}. 
        Possible filters are: $eq(equals), $lt(lessThan),$lte(lessThanOrEqual), $gt(greaterThan), $gte(greaterThanOrEqual), $ne(not equals)
        * @returns {ORMNeoQuery} This instance of query.
    */
    and(property, filter) {
        let obj = {};
        obj[property] = filter;
        this._appendWhere('AND', obj);
        return this;
    }

    /**
        * Add OR filter constraint to this query object.
        *
        * @param {string} property - Name of the property that the filter will be applied.
        * @param {object} filter - Filter that will be applied. Example: {$eq: 'v'}. 
        Possible filters are: $eq(equals), $lt(lessThan),$lte(lessThanOrEqual), $gt(greaterThan), $gte(greaterThanOrEqual), $ne(not equals)
        * @returns {ORMNeoQuery} This instance of query.
    */
    or(property, filter) {
        let obj = {};
        obj[property] = filter;
        this._appendWhere('OR', obj);
        return this;
    }

    /**
        * Return cypher WHERE query builded string clause from this query.
        *
        * @returns {string} Cypher WHERE clause builded.
    */
    where() {
        return (this.queryObject.where === '') ? '' : `WHERE ${this.queryObject.where}`;
    }

    /**
        * Return cypher query filter string clause from this query.
        *
        * @returns {string} Cypher filter clause builded.
    */
    filters() {
        return this.queryObject.where;
    }

    /**
        * Return cypher query count string matches from this query.
        *
        * @returns {string} Cypher count match builded.
    */
    count() {
        let queryLabel = (this.label) ? `:${this.label}` : '';
        let cypher = `MATCH (n${queryLabel}) ${this.where()} RETURN COUNT(n) as count`;
        return cypher;
    }

    /**
        * Return cypher nodes match string from this query.
        *
        * @returns {string} Cypher nodes match builded.
    */
    match() {
        let queryLabel = (this.label) ? `:${this.label}` : '';
        let limitQuery = (this.queryObject.limit) ? ` LIMIT ${this.queryObject.limit}` : '';
        return `MATCH (n${queryLabel}) WHERE ${this.queryObject.where} RETURN n${limitQuery}`;
    }

    //Convenience methods
    _appendWhere(operator, filter) {
        if (this.queryObject.where === '') {
            this.queryObject.where += this._conditionToQuery(filter);
        } else {
            this.queryObject.where += ` ${operator} ` + this._conditionToQuery(filter);
        }

    }

    _conditionToQuery(filter) {
        if (!_.isEmpty(filter)) {
            let conditionsMap = {
                $eq: '=',
                $lt: '<',
                $lte: '<=',
                $gt: '>',
                $gte: '>=',
                $ne: '!=',
                $regex: '=~'
            };
            let property = _.first(_.keysIn(filter));
            let conditionKeys = _.keysIn(filter[property]);
            let conditions = filter[property];
            return conditionKeys.reduce((result, key) => {
                let operator = conditionsMap[key];
                if (operator && this._isFilterValid(operator, conditions[key]) ) {
                    return ((result !== '') ? result + ' AND ' : '') +
                        `n.${property} ${operator} ${this._valueOnQuery(conditions[key])}`;
                }
                return result;
            }, '');
        }
        return '';
    }

    _isFilterValid(operator, value) {
        if (operator === '=~') {
            return _.isString(value);
        }
        return true;
    }

    _valueOnQuery(value) {
        if (_.isString(value)) {
            return `'${value}'`;
        } if (_.isDate(value)) {
            return `${value.getTime()}`;
        } else {
            return `${value}`;
        }
    }
}

module.exports = ORMNeoQuery;

