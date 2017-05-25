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
}

module.exports = OGMNeoObjectParse;