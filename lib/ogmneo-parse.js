'use strict';

const _ = require('lodash');

class OGMNeoParse {

    static objectString(node) {
        if (node && _.isObject(node)) {
            let keys = _.keys(node);
            let createString = keys.reduce((result, current) => {
                if (current !== 'id' && !_.isUndefined(node[current])) {
                    return result + `${(result === '') ? '' : ','} ${current} : {${current}}`;
                }
                return result;
            }, '');
            return `{ ${createString} }`;
        }
        return '';
    }

    static parseProperties(node) {
        if (node && _.isObject(node)) {
            _.forIn(node, (value, key) => {
                //Parsing date object
                if (_.isDate(value)) {
                    node[key] = value.getTime();
                }
            });
        }
        return {};
    }

    static parsePropertiesArray(properties, variable = 'n') {
        if (this.isValidPropertiesArray(properties)) {
            if (_.isString(properties)) {
                return `${variable}.${properties}`;
            } else if (_.isArray(properties)) {
                return properties.reduce((result, current) => {
                    return result + ((result === '') ? '' : ', ') + `${variable}.${current}`;
                }, '');
            }
        }
        return '';
    }

    static isValidPropertiesArray(properties) {
        if (_.isString(properties)) {
            return true;
        } else if (_.isArray(properties)) {
            let validProperties = properties.filter( property => _.isString(property));
            return (!_.isEmpty(validProperties));
        } 
        return false;
    }

    //Parsing result records to literal objects
    static relationNode(record) {
        if (record) {
            let node = record.get('r');
            let obj = node.properties || {};
            obj.type = node.type;
            obj.id = node.identity.low;
            return obj;
        }
        return null;
    }

    static parseRelation(record) {
        if (record) {
            if (_.includes(record.keys, 'r')) {
                return this.recordToRelation(record);
            } else {
                return this.propertiesFromVariable(record, 'r');
            }
        }
        return null;
    }

    static recordToRelation(record) {
        if (record) {
            let node = record.get('r');
            let obj = this.relationNode(record);
            obj.start = node.start.low;
            obj.end = node.end.low;
            return obj;
        }
        return null;
    }

    static recordToRelationPopulated(record) {
        if (record) {
            let obj = this.parseRelation(record);
            obj.start = this.parseRecordNode(record, 'n1');
            obj.end = this.parseRecordNode(record, 'n2');
            return obj;
        }
        return null;
    }
    static recordToRelationStartEndNodes(record, nodes = 'both') {
        if (record) {
            let obj = {};
            if (!nodes || nodes === 'start' || nodes === 'both') {
                obj.start = this.parseRecordNode(record, 'n1');
            }
            if (!nodes || nodes === 'end' || nodes === 'both') {
                obj.end = this.parseRecordNode(record, 'n2');
            }
            return obj;
        }
        return null;
    }

    static recordToNode(record, variable) {
        if (record) {
            let node = record.get(variable);
            let obj = node.properties || {};
            obj.id = node.identity.low;
            return obj;
        }
        return null;
    }

    static parseRecordNode(record, variable) {
        if (record) {
            if (_.includes(record.keys, variable)) {
                return this.recordToNode(record, variable);
            } else {
                return this.propertiesFromVariable(record, variable);
            }
        }
        return null;
    }

    static propertiesFromVariable(record, variable) {
        let obj = {};
        record.keys.forEach((key) => {
            let value = record.get(key);
            if (_.startsWith(key, `${variable}.`)) {
                obj[key.substring(variable.length + 1)] = value;
            }
        });
        return obj;
    }
}

module.exports = OGMNeoParse;