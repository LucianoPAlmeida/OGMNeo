'use strict';

const test = require('blue-tape');
const ORMNeo = require('../lib/ormneo');
const ORMNeoNode = require('../lib/ormneo-node');
const ORMQueryBuilder = require('../lib/ormneo-query');
const _ = require('lodash');

ORMNeo.connect('neo4j', 'databasepass', 'localhost');

var nodeId = 0;

test('Test create node', (assert) => {    
    ORMNeoNode.create({ name: 'name', tes: 3 }, 'test').then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'name');
        assert.deepEqual(node.tes, 3);
        nodeId = node.id;
        assert.end();
    }).catch((error) => {
        assert.end();
    });
});

test('Test update node', (assert) => {
    ORMNeoNode.update({ id: nodeId, name: null, tes: 3 }).then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.equal(node.name, undefined);
        assert.deepEqual(node.tes, 3);
        assert.end();
    }).catch((error) => {
        assert.end();
    });
});

test('Test get by id', (assert) => {
    ORMNeoNode.nodeWithId(nodeId).then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.equal(node.name, undefined);
        assert.deepEqual(node.tes, 3);
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});

test('Test execute query with results', (assert) => {
    let query = ORMQueryBuilder.query('test').and('tes', {$eq: 3});
    ORMNeoNode.execute(query).then((nodes) => {
        assert.ok(_.size(nodes) >= 1);
        nodes.forEach((node)=> {
            assert.ok(node.tes == 3);
        });
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});

test('Test execute query with NO results', (assert) => {
 let query = ORMQueryBuilder.query('test').and('tes', {$eq: 1});
    ORMNeoNode.execute(query).then((nodes) => {
        assert.ok(_.isEmpty(nodes));
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});

test('Test delete NODE', (assert) => {
    ORMNeoNode.delete({ id: nodeId }).then(() => {
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});

test('Test count', (assert) => {
    ORMNeoNode.count(new ORMQueryBuilder('Object')).then((count) => {
        assert.equal(count, 0);
        assert.end();
    }).catch((error) => {
        assert.error(error);
        assert.end();
    });
});

test.onFinish(() => {
    ORMNeo.disconnet();
});