'use strict';
let _ = require('lodash');

class OGMNeoOperation {

    constructor(cypher, type, object, then) {
        this.object = object || {};
        this.cypher = cypher || {};
        this.then = then;
        this.type = type || OGMNeoOperation.READ;
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
    }

    get object() {
        return this._object;
    }

    set object(value) {
        this._object = value;
    }
}

class OGMNeoOperationBuilder {
    constructor() {}

    static create() {
        return new OGMNeoOperationBuilder();
    }

    type(value) {
        this._type = value;
        return this;
    }

    cypher(value) {
        this._cypher = value;
        return this;
    }

    object(value) {
        this._object = value;
        return this;
    }

    then(value) {
        this._then = value;
        return this;
    }

    build() {
        return new OGMNeoOperation(this._cypher, this._type, this._object, this._then);
    }
}

module.exports =  { OGMNeoOperation : OGMNeoOperation, OGMNeoOperationBuilder: OGMNeoOperationBuilder };