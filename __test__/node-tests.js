'use strict';

const test = require('blue-tape');
const ORMNeo = require('../lib/ormneo');
const ORMNeoNode = require('../lib/ormneo-node');
const ORMQueryBuilder = require('../lib/ormneo-query');

ORMNeo.connect('neo4j', 'databasepass', 'localhost');

// test('Test create node', (assert) => {
//     ORMNeoNode.create({name: 'name'})
// });

test('Test count', (assert) => {
    ORMNeoNode.count( new ORMQueryBuilder('Object')).then(() => {
        assert.end();
    }).catch((error) => {
        assert.end();
    });
});