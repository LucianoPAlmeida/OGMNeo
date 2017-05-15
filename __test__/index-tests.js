'use strict';

const test = require('blue-tape');
const ORMNeoIndex = require('../lib/ormneo-index');
const ORMNeo = require('../lib/ormneo');


test('Test create Index', (assert) => {    
   ORMNeoIndex.create('object', ['name']).then((result) => {
        assert.notEqual(result, null);
        assert.end();
   });
});

test('Test create Index fail', (assert) => {    
    ORMNeoIndex.create(null, ['name']).catch((error) => {
         assert.equals(error.message, 'You must provide and label and an array with at least one field name');
         assert.end();
    });
});

test('Test drop Index', (assert) => {    
    ORMNeoIndex.drop('object', ['name']).then((result) => {
        assert.notEqual(result, null);
        assert.end();
    })
});