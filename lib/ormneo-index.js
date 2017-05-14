'use strict';

const ORMCypher = require('./ormneo-cypher');
const _ = require('lodash');

class ORMNeoIndex {
    constructor() {}
    /**
        * Creates properties index on neo4j.
        *
        * @static
        * @param {string} label - Label where to create the index.
        * @param {array} fields - The fields where to create the index. Must be an string array. 
        * @returns {Promise<object|Error>} Neo4j result object if fulfilled, or some neo4j error if rejected.
    */
    static create(label, fields) {
        return this._index(label, fields, 'CREATE');
    }
    
    /**
        * Drops properties index on neo4j.
        *
        * @static
        * @param {string} label - Label where to create the index.
        * @param {array} fields - The fields where to create the index. Must be an string array. 
        * @returns {Promise<object|Error>} Neo4j result object if fulfilled, or some neo4j error if rejected.
    */
    static drop(label, fields) {
        return this._index(label, fields, 'DROP');
    }

    static _index(label, fields, operation) {
        return new Promise((resolve, reject) => {
            //Check for valid types on parameters
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