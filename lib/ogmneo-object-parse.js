'use strict';

const _ = require('lodash');

class OGMNeoObjectParse {

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
}

module.exports = OGMNeoObjectParse;