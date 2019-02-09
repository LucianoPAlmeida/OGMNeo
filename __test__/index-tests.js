'use strict';

const test = require('tape');
const OGMNeoIndex = require('../lib/ogmneo-index');

test('Test create an index', (assert) => {    
    OGMNeoIndex.create('object', ['name','test']).then((result) => {
        assert.notEqual(result, null);
        assert.end();
    });
});

test('Test create index with a string param', (assert) => {
    OGMNeoIndex.create('object', 'string').then((result) => {
        assert.notEqual(result, null);
        assert.end();
    });
});

test('Test FAIL to create an index with a string param', (assert) => {
    OGMNeoIndex.create('object', '').catch((error) => {
        assert.equals(error.message, 'You must provide and label and an array with at least one field name or a string name');
        assert.end();
    });
});

test('Test FAIL to create index', (assert) => {    
    OGMNeoIndex.create(null, ['name','tes']).catch((error) => {
        assert.equals(error.message, 'You must provide and string as label param');
        assert.end();
    });
});

test('Test FAIL to create index with invalid parameters', (assert) => {
    OGMNeoIndex.create('object', []).catch((error) => {
        assert.equals(error.message, 'You must provide and label and an array with at least one field name or a string name');
        assert.end();
    });
});

test('Test drop index', (assert) => {    
    OGMNeoIndex.drop('object', ['name','test']).then((result) => {
        assert.notEqual(result, null);
        assert.end();
    });
});

