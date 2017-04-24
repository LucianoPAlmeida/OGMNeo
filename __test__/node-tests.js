'use strict';

const test = require('blue-tape');
const ORMNeo = require('../lib/ormneo');
const ORMNeoNode = require('../lib/ormneo-node');
const ORMQueryBuilder = require('../lib/ormneo-query');

ORMNeo.connect('neo4j', 'databasepass', 'localhost');

test('Test create node', (assert) => {
    ORMNeoNode.create({name: 'name', tes: 3},'test');
    assert.end();
});

test('Test update node', (assert) => {
    ORMNeoNode.update({ id: 0, name: 'nameup', tes: 3});
    assert.end();
});

test('Test delete NODE', (assert) => {
    ORMNeoNode.delete({id: 1}).then((r)=> {
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});

test('Test count', (assert) => {
    ORMNeoNode.count( new ORMQueryBuilder('Object')).then((count) => {
        assert.equal(count, 0);
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});