'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder  = require('./ormneo-query');

class ORMNeoNode {

    constructor() {

    }

    create(node, label = null) {
        
    }

    update(node) {

    }

    delete(node) {

    }

    count(label, query = null) {
        
    }

    query(label = null) {
        return new QueryBuilder(label);
    }

}

module.exports = ORMNeoNode;