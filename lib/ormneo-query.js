'use strict';

const _ = require('lodash');

class ORMNeoQuery {

    constructor () {
        this._queryObject = {
            where: ''
        };
    }

    get queryObject() {
        return this._queryObject;
    }


    limit(value) {
        if(_.isInteger(value)) {
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

    _conditionToQuery(condition) {
        
    }
}

module.exports = ORMNeoQuery;

