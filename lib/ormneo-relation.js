'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder = require('./ormneo-query');
const _ = require('lodash');

class ORMRelation {
    constructor() {

    }


    relate(nodeId, otherNodeId, name, properties, unique = false) {

    }
    update(relationId, newProperties) {
        
    }

    find(nodeId, otherNodeId, name = null) {

    }

    count(nodeId, otherNodeId, name = null) {

    }

    exists(nodeId, otherNodeId, name = null) {

    } 

    deleteRelation(nodeId, otherNodeId, name) {

    }


    
}

module.exports = ORMRelation;
