'use strict';
let _ = require('lodash');

class OGMNeoOperation {

    constructor() {
        this.object = {};
        this.type = OGMNeoOperation.READ;
    }

    static get READ() {
        return 'READ';
    }

    static get WRITE() {
        return 'WRITE';
    }

    static create() {
        return new OGMNeoOperation();
    }


    get isReadType() {
        return this.type != null && this.type.toUpperCase() == OGMNeoOperation.READ;
    }

    get isWriteType() {
        return this.type != null && this.type.toUpperCase() == OGMNeoOperation.WRITE;
    }

    get cypher() {
        return this._cypher;
    }

    set cypher(value) {
        if (_.isString(value)) {
            this._cypher = value;
        }
        return this;
    }

    // can be read or write operation
    get type() {
        return this._type;
    }

    set type(value) {
        if (this._isValidType(value)){
            this._type = value;
        } else {
            throw new Error('The type cannot be null/undefined and must be a string with either value  \'READ\' or \'WRITE\'');
        }
        return this;        
    }

    _isValidType(type) {
        if (type != null && _.isString(type)) {
            let uType = type.toUpperCase();
            return uType == OGMNeoOperation.READ || uType == OGMNeoOperation.WRITE;
        }
        return false;
    }

    get then() {
        return this._then;
    }

    set then(value) {
        if (_.isFunction(value)) {
            this._then = value;
        }
        return this;        
    }

    get object() {
        return this._object;
    }

    set object(value) {
        this._object = value;
        return this;        
    }
}

module.exports = OGMNeoOperation;