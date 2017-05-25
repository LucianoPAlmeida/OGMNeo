'use strict';

const test = require('blue-tape');
const OGMNeo = require('../lib/ogmneo');
const OGMNeoNode = require('../lib/ogmneo-node');
const OGMQueryBuilder = require('../lib/ogmneo-query');
const OGMNeoWhere = require('../lib/ogmneo-where');
const _ = require('lodash');


var nodeId = 0;

test('Test create node', (assert) => {    
    OGMNeoNode.create({ name: 'name1', tes: 3}, 'test').then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'name1');
        assert.deepEqual(node.tes, 3);
        nodeId = node.id;
        assert.end();
    });
});

test('Test create node with DATE param', (assert) => {    
    OGMNeoNode.create({ name: 'name1', date: new Date()}, 'test')
    .then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'name1');
        assert.notEqual(node.date, null);
        assert.end();
    });
});

test('Test update node', (assert) => {
    OGMNeoNode.update({ id: nodeId, tes: 52 }).then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.equal(node.name, 'name1');
        assert.deepEqual(node.tes, 52);
        assert.end();
    });
});

test('Test FAIL update node', (assert) => {
    OGMNeoNode.update({ id: 'ddlkas', name: null, tes: 3 }).catch((error) => {
        assert.notEqual(error, null);
        assert.equals(error.message, 'Node must have an integer id to be updated');
        assert.end();
    });
});

test('Test FAIL for query param updateMany node', (assert) => {
    OGMNeoNode.updateMany('', {newProperty: 'new'}).catch((error) => {
        assert.equal(error.message, 'The query object must be an instance of OGMNeoQuery');
        assert.end();
    });
});

test('Test empty new properties updateMany node', (assert) => {
    let query = OGMQueryBuilder.query('test', new OGMNeoWhere('name', {$eq: 'name1'}));
    OGMNeoNode.updateMany(query, {}).then((updateNodes) => {
        assert.equal(updateNodes.length, 0);
        assert.end();
    });
});

test('Test updateMany node', (assert) => {
    let query = OGMQueryBuilder.query('test', new OGMNeoWhere('name', {$eq: 'name1'}));
    OGMNeoNode.updateMany(query, {newProperty: 'new!!!'})
    .then((updatedNodes) => {
        assert.equal(updatedNodes.length, 2);
        updatedNodes.forEach((node) => {
            assert.notEqual(node.id, null);
            assert.equal(node.newProperty, 'new!!!');
        });
        assert.end();
    });
});

test('Test get by id', (assert) => {
    OGMNeoNode.nodeWithId(nodeId).then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.equal(node.name, 'name1');
        assert.deepEqual(node.tes, 52);
        assert.end();
    });
});

test('Test FAIL find by id node', (assert) => {
    OGMNeoNode.nodeWithId('').catch((error) => {
        assert.notEqual(error, null);
        assert.equal(error.message, 'You must provide an non-null integer id property to find the node');
        assert.end();
    });
});

test('Test execute query with results', (assert) => {
    let query = OGMQueryBuilder.query('test', new OGMNeoWhere('name', {$eq: 'name1'}));
    OGMNeoNode.execute(query).then((nodes) => {
        assert.ok(_.size(nodes) >= 1);
        nodes.forEach((node)=> {
            assert.notEqual(node.id, null);
            assert.equal(node.name,'name1');
        });
        assert.end();
    });
});

test('Test execute query with NO results', (assert) => {
 let query = OGMQueryBuilder.query('test', new OGMNeoWhere('tes', {$eq: 1}));
    OGMNeoNode.execute(query).then((nodes) => {
        assert.ok(_.isEmpty(nodes));
        assert.end();
    });
});

test('Test FAIL delete NODE', (assert) => {
    OGMNeoNode.delete({ id: 'da' }).catch((error) => {
        assert.notEqual(error, true);
        assert.equal(error.message, 'Node must to have an non-nil property id to be deleted');
        assert.end();
    })
});

test('Test delete NODE', (assert) => {
    OGMNeoNode.delete({ id: nodeId }).then((deleted) => {
        assert.equal(deleted, true);
        assert.end();
    })
});

test('Test delete FAIL MANY NODE', (assert) => {
    OGMNeoNode.deleteMany('').catch((error) => {
        assert.equal(error.message, 'The query object must be an instance of OGMNeoQuery');
        assert.end();
    });
});

test('Test delete MANY NODE', (assert) => {
    let query = OGMQueryBuilder.query('test', new OGMNeoWhere('name', {$eq: 'name1'}));
    OGMNeoNode.deleteMany(query).then((numberOfDeleted) => {
        assert.equal(numberOfDeleted, 1);
        assert.end();
    });
});

test('Test count', (assert) => {
    OGMNeoNode.count(new OGMQueryBuilder('test')).then((count) => {
        assert.plan(1);
        assert.equal(count, 0);
    });
});
