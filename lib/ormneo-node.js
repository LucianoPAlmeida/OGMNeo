'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder = require('./ormneo-query');

class ORMNeoNode {

    constructor() {
    }

    create(node, label = null) {

    }

    update(node) {

    }

    delete(node) {

    }

    countWithLabel(label) {
        return this.count(new QueryBuilder(label));
    }

    count(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof QueryBuilder) {
                ORMNeo.session.run(query.count()).then((record) => {
                    console.info(record);
                    resolve(record);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error('An QueryBuilder object must to be provider'));
            }
        });

    }

    query(label = null) {
        return new QueryBuilder(label);
    }

}

module.exports = ORMNeoNode;