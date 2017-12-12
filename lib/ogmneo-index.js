'use strict';

const OGMNeo = require('./ogmneo');
const _ = require('lodash');
/**
    * @class OGMNeoIndex
 */
class OGMNeoIndex {
    /**
        * Creates properties index on neo4j.
        *
        * @static
        * @param {string} label - Label where the index will be create.
        * @param {array|string} properties -  The array fields where to create the index or in case of only a string name of the property. Must be a string array. OBS: More than one parameter you be accepted only on neo4j 3.2.0.
        * @returns {Promise<object|Error>} Neo4j result object if fulfilled, or some neo4j error if rejected.
    */
    static create(label, fields) {
        return this._index(label, fields, 'CREATE');
    }

    /**
        * Drops properties index on neo4j.
        *
        * @static
        * @param {string} label - Label where the index will be dropped.
        * @param {array|string} properties - The array fields where to drop the index or in case of only a string name of the property. Must be a string array. OBS: More than one parameter you be accepted only on neo4j 3.2.0
        * @returns {Promise<object|Error>} Neo4j result object if fulfilled, or some neo4j error if rejected.
    */
    static drop(label, properties) {
        return this._index(label, properties, 'DROP');
    }

    static _index(label, properties, operation) {
        return new Promise((resolve, reject) => {
            //Check for valid types on parameters            
            if (_.isString(label)) {
                let fieldParam = this._propertyParam(properties);
                if (fieldParam) {
                    let cypher = `${operation} INDEX ON :${label} ${fieldParam}`;
                    let session = OGMNeo.session();
                    let writeTxResultPromise = session.writeTransaction(transaction => transaction.run(cypher));
                    writeTxResultPromise.then((result) => {
                        session.close();
                        resolve(result);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    reject(new Error('You must provide and label and an array with at least one field name or a string name'));
                }
            } else {
                reject(new Error('You must provide and string as label param'));
            }
        });
    }

    static _propertyParam(properties) {
        if (properties != null) {
            if (_.isString(properties)) {
                return !_.isEmpty(properties) ? `(${properties})` : null;
            } else if (_.isArray(properties)) {
                let validProperties = properties.filter(field => _.isString(field));
                if (_.isEmpty(validProperties)) {
                    return null;
                } else {
                    let fieldQuery = properties.reduce((result, current) => {
                        return result + (result === '') ? `${current}` : `,${current}`;
                    }, '');
                    return `(${fieldQuery})`;
                }
            }
        }
        return null;
    }
}

module.exports = OGMNeoIndex;