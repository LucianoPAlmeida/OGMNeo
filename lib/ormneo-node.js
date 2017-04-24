'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder = require('./ormneo-query');
const _ = require('lodash');

class ORMNeoNode {

    static create(node, label = null) {
        return new Promise((resolve, reject) => {
            let objectString = this._generateObjectString(node);
            let labelCypher = (!_.isEmpty(label) && _.isString(label)) ? `:${label}` : '';
            let cypher = `CREATE (n${labelCypher} ${objectString}) RETURN n`;
            let session = ORMNeo.session();
            let readTxResultPromise = session.readTransaction((transaction) => {
                return transaction.run(cypher, node);
            });
            readTxResultPromise.then((result) => {
                console.info(result);
                session.close();
                resolve();
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    static update(node) {
        return new Promise((resolve, reject) => {
            if (node && node.id != undefined && _.isInteger(node.id)) {
                let objectString = this._generateObjectString(node);
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} SET n+=${objectString} RETURN n`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher, node);
                });
                readTxResultPromise.then((result) => {
                    console.info(result);
                    session.close();
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must have an integer id to be updated'));
            }
        });
    }

    static _generateObjectString(node) {
        if (node && _.isObject(node)) {
            let keys = _.keys(node);
            let createString = keys.reduce((result, current) => {
                if (current !== 'id') {
                    return result + `${(result === '') ? '' : ','} ${current} : {${current}}`;
                }
                return result;
            }, '');
            return `{ ${createString} }`;
        }
        return '';
    }

    static delete(node) {
        return new Promise((resolve, reject) => {
            if (node && node.id != undefined && _.isInteger(node.id)) {
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} DELETE n`;
                console.info(cypher);
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher);
                });
                readTxResultPromise.then(() => {
                    session.close();
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must to have an property id to be deleted'));
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
                    onNext: (record) => {
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