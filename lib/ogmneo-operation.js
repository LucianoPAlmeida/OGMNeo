'use strict';
let _ = require('lodash');

class OGMNeoOperation {

    constructor() {

    }

    get cypher() {
        return this._cypher;
    }

    set cypher(value) {
        if (_.isString(value)) {
            this._cypher = value;
        }
    }

    // can be read or write operation
    get type() {
        return this._type;
    }

    set type(value) {
        if (_.isString(value)) {
            this._type = value;
        }
    }

    get resultParser() {
        return this._resultParser;
    }

    set resultParser(value) {
        if (_.isFunction(value)) {
            this._resultParser = value;
        }
    }
}

module.exports = OGMNeoOperation;