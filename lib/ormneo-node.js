'use strict';

var ORMNeo = require('./ormneo');
var QueryBuilder = require('./ormneo-query');
const _ = require('lodash');

class ORMNeoNode {

    static create(node, label = null) {
        let value = _.omitBy(node, _.isUndefined);
        return new Promise((resolve, reject) => {
            let objectString = this._generateObjectString(value);
            let labelCypher = (!_.isEmpty(label) && _.isString(label)) ? `:${label}` : '';
            let cypher = `CREATE (n${labelCypher} ${objectString}) RETURN n`;
            let session = ORMNeo.session();
            let readTxResultPromise = session.readTransaction((transaction) => {
                return transaction.run(cypher, value);
            });
            readTxResultPromise.then((result) => {
                let record = _.first(result.records);
                session.close();
                resolve(this._recordToObject(record));
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    static update(node) {
        let value = _.omitBy(node, _.isUndefined);
        return new Promise((resolve, reject) => {
            if (value && value.id != undefined && _.isInteger(value.id)) {
                let objectString = this._generateObjectString(node);
                let cypher = `MATCH (n) WHERE ID(n)=${node.id} SET n+=${objectString} RETURN n`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher, node);
                });
                readTxResultPromise.then((result) => {
                    let record = _.first(result.records);
                    session.close();
                    resolve(this._recordToObject(record));
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
        return new Promise((resolve, reject) => {
            if (_.isInteger(id)) {
                let cypher = `MATCH (n) WHERE ID(n)=${id} RETURN n`;
                let session = ORMNeo.session();
                let readTxResultPromise = session.readTransaction((transaction) => {
                    return transaction.run(cypher);
                });
                readTxResultPromise.then((result) => {
                    let record = _.first(result.records);
                    session.close();
                    resolve(this._recordToObject(record));
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                reject(new Error('Node must to have an property id to be deleted'));
            }
        });
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
                        resolve(record.get('count').low);
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

    execute(query) {
        console.info(query);
    }

    static _recordToObject(record) {
        if (record) {
            let node = record.get('n');
            let obj = node.properties || {};
            obj.id = node.identity.low;
            return obj;
        }
        return null;
    }
}

module.exports = ORMNeoNode;