'use strict';

const ORMCypher = require('./ormneo-cypher');
const _ = require('lodash');
class ORMNeoIndex {
    constructor() {}

    static create(label, fields) {
        return this._index(label, fields, 'CREATE');
    }
    
    static drop(label, fields) {
        return this._index(label, fields, 'DROP');
    }

    static _index(label, fields, operation) {
        return new Promise((resolve, reject) => {
            if (_.isString(label) && _.isArray(fields)) {
                let validFields = fields.filter( field => _.isString(field));
                if (_.isEmpty(validFields)) {
                    reject(new Error('You must provide an array with at least one field name string'));
                } else {
                    let fieldQuery = validFields.reduce((result, current) => {
                        return (result === '') ? `${current}` : `,${current}`;
                    }, '');
                    let cypher = `${operation} INDEX ON :${label}(${fieldQuery})`;
                    ORMCypher.execute(cypher).then((result) => {
                        resolve(result);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            } else {
                reject(new Error('You must provide and label and an array with at least one field name'));
            }
        });
    }
}

module.exports = ORMNeoIndex;