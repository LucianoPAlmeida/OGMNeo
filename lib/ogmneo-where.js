'use strict';

const _ = require('lodash');

/**
    * @class OGMNeoWhere
 */
class OGMNeoWhere {

    /**
        * Constructs a where object with an label.
        *
        * @constructor
        * @param {string=} property - Name of the property that the filter will be applied.
        * @param {object} filter - Filter that will be applied. Example: {$eq: 'v'}. 
        Possible filters are: $eq(equals), $lt(lessThan),$lte(lessThanOrEqual), $gt(greaterThan), $gte(greaterThanOrEqual), $ne(not equals) and for string properties $regex, $startswith, $endswith and $contains.
    */
    constructor(property, filter) {
        this._clause = '';
        let obj = {};
        obj[property] = filter;
        this._appendWhere('', obj);
    }

    /**
        * Convenience method that creates a where object with an property and a filter.
        *
        * @static
        * @param {string=} property - Name of the property that the filter will be applied.
        * @param {object} filter - Filter that will be applied. Example: {$eq: 'v'}. 
        Possible filters are: $eq(equals), $lt(lessThan),$lte(lessThanOrEqual), $gt(greaterThan), $gte(greaterThanOrEqual), $ne(not equals) and for string properties $regex, $startswith, $endswith and $contains.
        * @returns {OGMNeoWhere} Created query with label.
    */
    static create(property, filter) {
        return new OGMNeoWhere(property, filter);
    }

    /**
        * Add AND filter constraint to this query object.
        *
        * @param {string} property - Name of the property that the filter will be applied.
        * @param {object} filter - Filter that will be applied. Example: {$eq: 'v'}. 
        Possible filters are: $eq(equals), $lt(lessThan),$lte(lessThanOrEqual), $gt(greaterThan), $gte(greaterThanOrEqual), $ne(not equals) and for string properties $regex, $startswith, $endswith and $contains
        * @returns {OGMNeoWhere} This instance of query.
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
        Possible filters are: $eq(equals), $lt(lessThan),$lte(lessThanOrEqual), $gt(greaterThan), $gte(greaterThanOrEqual), $ne(not equals) and for string properties $regex, $startswith, $endswith and $contains
        * @returns {OGMNeoWhere} This instance of query.
    */
    or(property, filter) {
        let obj = {};
        obj[property] = filter;
        this._appendWhere('OR', obj);
        return this;
    }

    /**
     * The cypher representation of the where clause.
     * @type {string}
    */
    get clause() {
        return this._clause;
    }

    //Convenience methods
    _appendWhere(operator, filter) {
        if (this._clause === '') {
            this._clause += this._conditionToQuery(filter);
        } else {
            this._clause += ` ${operator} ` + this._conditionToQuery(filter);
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
                $ne: '<>',
                $regex: '=~',
                $startsWith: 'STARTS WITH',
                $endsWith: 'ENDS WITH',
                $contains: 'CONTAINS',
                $in: 'IN',
                $exists: 'EXISTS'
            };
            let property = _.first(_.keysIn(filter));
            let conditionKeys = _.keysIn(filter[property]);
            let conditions = filter[property];
            return conditionKeys.reduce((result, key) => {
                return this._propertyStatement(conditionsMap, conditions, result, key, property);
            }, '');
        }
        return '';
    }

    _propertyStatement(conditionsMap, conditions, result, key, property) {
        let operator = conditionsMap[key];
        let prefix = ((result !== '') ? result + ' AND ' : '');
        if (operator && this._isFilterValid(operator, conditions[key])) {
            let queryValue = '';
            if (operator === 'IN' && _.isArray(conditions[key])) {
                queryValue = `[${this._valueForArray(conditions[key])}]`;
            } else if (operator === 'EXISTS') {
                return prefix + ((conditions[key]) ? `EXISTS(n.${property})` : `NOT EXISTS(n.${property})`);
            } else {
                queryValue = this._valueOnQuery(conditions[key]);
            }
            return prefix + `n.${property} ${operator} ${queryValue}`;
        }
        return result;
    }

    _isFilterValid(operator, value) {
        var stringOnlyOperators = ['=~', 'STARTS WITH', 'ENDS WITH', 'CONTAINS'];
        if (_.includes(stringOnlyOperators, operator)) {
            return _.isString(value);
        }else if (operator === 'IN') {
            return _.isArray(value);
        }else if (operator === 'EXISTS') {
            return _.isBoolean(value);
        }
        return true;
    }

    _valueOnQuery(value) {
        if (_.isNull(value)) {
            return 'null';
        } else if (_.isString(value)) {
            return `'${value}'`;
        } if (_.isDate(value)) {
            return `${value.getTime()}`;
        } else {
            return `${value}`;
        }
    }

    _valueForArray(array) {
        return array.reduce((result, current) => {
            if (_.isString(current) || _.isNumber(current) || _.isNull(current)) {
                return result + `${(result === '') ? '' : ','} ${this._valueOnQuery(current)} `;
            }
            return result;
        }, '');
    }
}

module.exports = OGMNeoWhere;