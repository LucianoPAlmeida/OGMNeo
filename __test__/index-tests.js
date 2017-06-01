'use strict';

const test = require('blue-tape');
const OGMNeoIndex = require('../lib/ogmneo-index');

test('Test create Index', (assert) => {    
   OGMNeoIndex.create('object', ['name']).then((result) => {
        assert.notEqual(result, null);
        assert.end();
   });
});

test('Test create Index with string param', (assert) => {
    OGMNeoIndex.create('object', 'string').then((result) => {
        assert.notEqual(result, null);
        assert.end();
    })
});

test('Test FAIL create Index with string param', (assert) => {
    OGMNeoIndex.create('object', '').catch((error) => {
        assert.equals(error.message, 'You must provide and label and an array with at least one field name or a string name');
        assert.end();
    });
});

test('Test create Index fail', (assert) => {    
    OGMNeoIndex.create(null, ['name','tes']).catch((error) => {
        assert.equals(error.message, 'You must provide and string as label param');
         assert.end();
    });
});

test('Test create index fail by parameters', (assert) => {
    OGMNeoIndex.create('object', []).catch((error) => {
        assert.equals(error.message, 'You must provide and label and an array with at least one field name or a string name');
         assert.end();
    });
});

test('Test drop Index', (assert) => {    
    OGMNeoIndex.drop('object', ['name']).then((result) => {
        assert.notEqual(result, null);
        assert.end();
    })
});

