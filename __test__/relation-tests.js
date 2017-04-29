'use strict';

const test = require('blue-tape');
const ORMNeo = require('../lib/ormneo');
const ORMNeoRelation = require('../lib/ormneo-relation');
const ORMQueryBuilder = require('../lib/ormneo-query');
const _ = require('lodash');

ORMNeo.connect('neo4j', 'databasepass', 'localhost');


test('Test CREATE relation', (assert) => {
    assert.end();
});

test('Test COUNT relation', (assert) => {
    assert.end();
});