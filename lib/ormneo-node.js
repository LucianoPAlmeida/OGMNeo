'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder = require('./ormneo-query');
const _ = require('lodash');

class ORMNeoNode {



    static create(node, label = null) {
        return new Promise((resolve, reject) => {
            let labelQuery = (label && _.isString(label)) ? `:${label}` : '';
            let cypher = `CREATE (n${labelQuery} ${JSON.stringify(node)}) RETURN n`;
            console.info(cypher);
        });
    }

    static update(node) {

    }

    static delete(node) {
        return new Promise((resolve, reject) => {
            if (node && node.id) {
                let cypher = `MATCH (n) WHERE ID(n) = ${node.id} DELETE n`;
                // ORMNeo.session.
            } else {
                reject(new Error(''));
            }
        });
    }

    static nodeWithId(id) {

    }

    static countWithLabel(label) {
        return this.count(new QueryBuilder(label));
    }

    static count(query) {
        return new Promise((resolve, reject) => {
            if (query && query instanceof QueryBuilder) {
                let cypher = query.count();
                let session = ORMNeo.session();
                session.run(cypher).subscribe({
                    onNext:  (record) => {
                        resolve(record.get('count'));
                    },
                    onCompleted: () => {
                        session.close();
                    },
                    onError: (error) => {
                        reject(error);
                    }
                });
            } else {
                reject(new Error('An QueryBuilder object must to be provider'));
            }
        });

    }

    static query(label = null) {
        return new QueryBuilder(label);
    }

}

module.exports = ORMNeoNode;