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


    limit(value) {
        if (_.isInteger(value)) {
            this.queryObject.limit = value;
        }
        return this;
    }

    and(property, filter) {
        let obj = {};
        obj[property] = filter;
        this._appendWhere('AND', obj);
        return this;
    }

    or(property, filter) {
        let obj = {};
        obj[property] = filter;
        this._appendWhere('OR', obj);
        return this;
    }

    where() {
        return (this.queryObject.where === '') ? '' : `WHERE ${this.queryObject.where}`;
    }

    filters() {
        return this.queryObject.where;
    }

    count() {
        let queryLabel = (this.label) ? `:${this.label}` : '';
        let cypher = `MATCH (n${queryLabel}) ${this.where()} RETURN COUNT(n) as count`;
        return cypher;
    }

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
                $ne: '!='
            };
            let property = _.first(_.keysIn(filter));
            let conditionKeys = _.keysIn(filter[property]);
            let conditions = filter[property];
            return conditionKeys.reduce((result, key) => {
                let operator = conditionsMap[key];
                if (operator) {
                    return ((result !== '') ? result + ' AND ' : '') +
                        `n.${property} ${operator} ${this._valueOnQuery(conditions[key])}`;
                }
                return result;
            }, '');
        }
        return '';
    }
    _valueOnQuery(value) {
        if (_.isString(value)) {
            return `'${value}'`;
        } else {
            return `${value}`;
        }
    }
}

module.exports = ORMNeoQuery;

