'use strict';

const _ = require('lodash');

class ORMNeoObjectParse {

    static objectString(node) {
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
}

module.exports = ORMNeoObjectParse;