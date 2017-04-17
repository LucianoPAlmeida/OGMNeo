'use strict';

const _ = require('lodash');

class ORMNeoQuery {

    constructor() {
        this._queryObject = {
            where: ''
        };
    }

    get queryObject() {
        return this._queryObject;
    }


    limit(value) {
        if (_.isInteger(value)) {
            this.queryObject.limit = value;
        }
        return this;
    }

    and(property, condition) {
        return this;
    }

    or(property, condition) {

        return this;
    }

    xor(property, condition) {

        return this;
    }

    not(property, condition) {

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
            return conditionKeys.reduce( (result, key) => {
                let operator = conditionsMap[key];
                if (operator) {
                    return `${property} ${operator} ${conditions[key]}`;
                }
                return result;
            }, '');
        }
        return '';
    }
}

module.exports = ORMNeoQuery;

