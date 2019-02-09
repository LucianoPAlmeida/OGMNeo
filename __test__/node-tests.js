'use strict';

const test = require('tape');
const OGMNeoNode = require('../lib/ogmneo-node');
const OGMQueryBuilder = require('../lib/ogmneo-query');
const OGMNeoRelation = require('../lib/ogmneo-relation');
const OGMNeoWhere = require('../lib/ogmneo-where');
const OGMNeoOperationExecuter = require('../lib/ogmneo-operation-executer');
const _ = require('lodash');


var nodeId = 0;

test('Test create node', (assert) => {    
    OGMNeoNode.create({ name: 'name1', tes: 3, array: ['das']}, 'test').then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'name1');
        assert.deepEqual(node.tes, 3);
        nodeId = node.id;
        assert.end();
    });
});

test('Test merge node', (assert) => {    
    OGMNeoNode.merge({ name: 'merge', tes: 3, array: ['das']}, 'test').then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'merge');
        assert.deepEqual(node.tes, 3);
        assert.end();
    });
});

test('Test create node with DATE param', (assert) => {    
    OGMNeoNode.create({ name: 'name1', date: new Date(), array: ['das']}, 'test')
    .then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'name1');
        assert.notEqual(node.date, null);
        assert.end();
    });
});

test('Test merge node with DATE param', (assert) => {    
    OGMNeoNode.merge({ name: 'merge', date: new Date(), array: ['das']}, 'test')
    .then((node) => {
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.deepEqual(node.name, 'merge');
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

test('Test FAIL for query param updateMany not object newProperties', (assert) => {
    OGMNeoNode.updateMany('', '').catch((error) => {
        assert.equal(error.message, 'The new properties must be an object');
        assert.end();
    });
});

test('Test empty new properties updateMany node', (assert) => {
    let query = OGMQueryBuilder.create('test', new OGMNeoWhere('name', {$eq: 'name1'}));
    OGMNeoNode.updateMany(query, {}).catch((error) => {
        assert.equal(error.message, 'You must provide at least one property with NO undefined values to update');
        assert.end();        
    });
});

test('Test updateMany node', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' }));
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

test('Test get MANY by ids', (assert) => {
    OGMNeoNode.manyWithIds([nodeId]).then((nodes) => {
        assert.equal(_.isArray(nodes), true);
        let node = _.first(nodes);
        assert.notEqual(node, null);
        assert.notEqual(node.id, null);
        assert.equal(node.name, 'name1');
        assert.deepEqual(node.tes, 52);
        assert.end();
    });
});

test('Test FAIL find MANY by ids', (assert) => {
    OGMNeoNode.manyWithIds('').catch((error) => {
        assert.notEqual(error, null);
        assert.equal(error.message, 'The parameter must be an array of ids');
        assert.end();
    });
});

test('Test Failed execute query', (assert) => {
    OGMNeoNode.find('').catch((error) => {
        assert.equal(error.message, 'A OGMNeoQuery object must to be provided');
        assert.end();
    });
});

test('Test execute query with results', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' }));
    OGMNeoNode.find(query).then((nodes) => {
        assert.ok(_.size(nodes) >= 1);
        nodes.forEach((node)=> {
            assert.notEqual(node.id, null);
            assert.equal(node.name,'name1');
        });
        assert.end();
    });
});

test('Test execute query with results and return clause', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' })).return(['newProperty','array']);
    OGMNeoNode.find(query).then((nodes) => {
        assert.ok(_.size(nodes) >= 1);
        nodes.forEach((node) => {
            assert.equal(node.id, undefined);
            assert.equal(node.name, undefined);
            assert.equal(node.newProperty, 'new!!!');
            assert.equal(node.tes, undefined);
        });
        assert.end();
    });
});

test('Test execute query with results and return clause containing id', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' })).return(['newProperty','array', 'id']);
    OGMNeoNode.find(query).then((nodes) => {
        assert.ok(_.size(nodes) >= 1);
        nodes.forEach((node) => {
            assert.notEqual(node.id, undefined);
            assert.equal(node.name, undefined);
            assert.equal(node.newProperty, 'new!!!');
            assert.equal(node.tes, undefined);
        });
        assert.end();
    });
});

test('Test Failed findOne query', (assert) => {
    OGMNeoNode.findOne('').catch((error) => {
        assert.equal(error.message, 'A OGMNeoQuery object must to be provided');
        assert.end();
    });
});

test('Test findOne query with results', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' })).ascOrderBy('name');
    OGMNeoNode.findOne(query).then((node) => {
        assert.notEqual(node.id, null);
        assert.equal(node.name,'name1');
    
        assert.end();
    });
});

test('Test findOne query with results and return clause', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' })).return(['newProperty','array']);
    OGMNeoNode.findOne(query).then((node) => {
        assert.equal(node.id, undefined);
        assert.equal(node.name, undefined);
        assert.equal(node.newProperty, 'new!!!');
        assert.equal(node.tes, undefined);
        assert.end();
    });
});

test('Test execute query with results and ORDER BY', (assert) => {
    let query = OGMQueryBuilder.create('test')
    .where(new OGMNeoWhere('name', { $eq: 'name1' }))
    .ascOrderBy('name');
    OGMNeoNode.find(query).then((nodes) => {
        assert.ok(_.size(nodes) >= 1);
        nodes.forEach((node) => {
            assert.notEqual(node.id, null);
            assert.equal(node.name, 'name1');
        });
        assert.end();
    });
});

test('Test execute query with NO results', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('tes', { $eq: 1 }));
    OGMNeoNode.find(query).then((nodes) => {
        assert.ok(_.isEmpty(nodes));
        assert.end();
    });
});

//Tests for add and remove labels
test('Test FAIL add label label not string', (assert) => {
    OGMNeoNode.addLabelToNode('', 32).catch((error) => {
        assert.equal(error.message, 'label must be a non empty string');
        assert.end();
    });
});

test('Test FAIL add label id integer', (assert) => {
    OGMNeoNode.addLabelToNode('label', '').catch((error) => {
        assert.equal(error.message, 'The nodeId must be an integer value');
        assert.end();
    });
});

test('Test FAIL add label ids not array', (assert) => {
    OGMNeoNode.addLabelToNodes('label', '').catch((error) => {
        assert.equal(error.message, 'nodesIds must be an array');
        assert.end();
    });
});

test('Test add label empty nodesIds', (assert) => {
    OGMNeoNode.addLabelToNodes('label', []).catch((error) => {
        assert.equal(error.message, 'You must provide at least one valid id to this operation');
        assert.end();
    });
});

test('Test success adding label', (assert) => {
    OGMNeoNode.addLabelToNode('label', nodeId).then((node) => {
        assert.notEqual(node, null);
        assert.equal(node.id, nodeId);
        assert.end();
    });
});

//================
test('Test FAIL remove label not string', (assert) => {
    OGMNeoNode.removeLabelFromNode('', 32).catch((error) => {
        assert.equal(error.message, 'label must be a non empty string');
        assert.end();
    });
});

test('Test FAIL remove label id integer', (assert) => {
    OGMNeoNode.removeLabelFromNode('label', '').catch((error) => {
        assert.equal(error.message, 'The nodeId must be an integer value');
        assert.end();
    });
});

test('Test FAIL remove label ids not array', (assert) => {
    OGMNeoNode.removeLabelFromNodes('label', '').catch((error) => {
        assert.equal(error.message, 'nodesIds must be an array');
        assert.end();
    });
});

test('Test remove label empty nodesIds', (assert) => {
    OGMNeoNode.removeLabelFromNodes('label', []).catch((error) => {
        assert.equal(error.message, 'You must provide at least one valid id to this operation');
        assert.end();
    });
});

test('Test success removing label', (assert) => {
    OGMNeoNode.removeLabelFromNode('label', nodeId).then((node) => {
        assert.notEqual(node, null);
        assert.equal(node.id, nodeId);
        assert.end();
    });
});

//Test delete node
test('Test FAIL delete NODE', (assert) => {
    OGMNeoNode.delete({ id: 'da' }).catch((error) => {
        assert.notEqual(error, true);
        assert.equal(error.message, 'Node must to have an non-nil property id to be deleted');
        assert.end();
    });
});

test('Test delete NODE', (assert) => {
    OGMNeoNode.delete({ id: nodeId }).then((deleted) => {
        assert.equal(deleted, true);
        assert.end();
    });
});

test('Test delete cascade NODE', (assert) => {
    let createUser1 = OGMNeoNode.createOperation({name: 'Ayrton Senna'}, 'Person');
    let createUser2 = OGMNeoNode.createOperation({name: 'Alain Prost'}, 'Person');

    OGMNeoOperationExecuter.batchWriteOperations([createUser1, createUser2]).then((result) => {
        let created1 = result[0];
        let created2 = result[1];
        OGMNeoRelation.relate(created1.id,'RIVALS', created2.id).then((result) => {
            OGMNeoNode.delete(created1).catch((error) => {
                // Must be not able to normal deletion because the node have relations.
                OGMNeoNode.deleteCascade(created1).then((deleted) => {
                    assert.equal(deleted, true);
                    OGMNeoNode.delete(created2).then((deleted)=> {
                        assert.equal(deleted, true);
                        assert.end();
                    });
                });
            });
        });
    });


});

test('Test delete FAIL MANY NODE', (assert) => {
    OGMNeoNode.deleteMany('').catch((error) => {
        assert.equal(error.message, 'The query object must be an instance of OGMNeoQuery');
        assert.end();
    });
});

test('Test delete MANY NODE', (assert) => {
    let query = OGMQueryBuilder.create('test').where(new OGMNeoWhere('name', { $eq: 'name1' }));
    OGMNeoNode.deleteMany(query).then((numberOfDeleted) => {
        assert.equal(numberOfDeleted, 1);
        let tests = OGMQueryBuilder.create('test');
        OGMNeoNode.deleteMany(tests).then((numberOfDeleted) => {
            assert.equal(numberOfDeleted, 2);
            assert.end();
        });
    });
    
});

test('Test Failed Count', (assert) => {
    OGMNeoNode.count('').catch((error) => {
        assert.equal(error.message, 'A OGMNeoQuery object must to be provided');
        assert.end();
    });
});

test('Test count', (assert) => {
    OGMNeoNode.countWithLabel('test').then((count) => {
        assert.plan(1);
        assert.equal(count, 0);
    });
});
