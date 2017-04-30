'use strict';

const test = require('blue-tape');
const ORMNeo = require('../lib/ormneo');
const ORMNeoNode = require('../lib/ormneo-node');
const ORMNeoRelation = require('../lib/ormneo-relation');
const ORMQueryBuilder = require('../lib/ormneo-query');
const _ = require('lodash');

ORMNeo.connect('neo4j', 'databasepass', 'localhost');
var nodes;
var relations;

test('Setup', (assert) => {
    let values = [{name: 'Test1', value: 2}, {name: 'Test2', value: 4}];
    let promises = values.map((node)=> { return ORMNeoNode.create(node, 'object');});
    Promise.all(promises).then((all) => {
        nodes = all;
        assert.equal(nodes.length, 2);
        assert.end();
    });
});

test('Test CREATE relation', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let rel1 = ORMNeoRelation.relate(node1.id, node2.id, 'relatedto', {property: 'a'});
    let rel2 = ORMNeoRelation.relate(node1.id, node2.id, 'relatedto', {});
    Promise.all([rel1, rel2]).then((rels) => {
        assert.equal(rels.length, 2);
        let relation1 = rels[0];
        let relation2 = rels[1];
        assert.notEqual(relation1.id, null);
        assert.notEqual(relation2.id, null);
        assert.deepEqual(relation1.type, 'relatedto');
        assert.deepEqual(relation2.type, 'relatedto');
        assert.equal(relation1.property, 'a');
        assert.equal(relation2.property, undefined);
        relations = rels;
        assert.end();
    }).catch((error) => {
        assert.fail('Fail with error');
        assert.end();
    });
});

test('Test FAIL CREATE TYPE relation', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    ORMNeoRelation.relate(node1.id, node2.id, null , {property: 'a'}).then(()=> {
        assert.fail();
        assert.end();
    }).catch((error)=> {
        assert.equal(error.message, 'A relatioship type must be specified');
        assert.end();
    });
});

test('Test FAIL CREATE IDS relation', (assert) => {
    let node2 = nodes[1];
    ORMNeoRelation.relate('dasdsa', node2.id, 'type' , {property: 'a'}).then(()=> {
        assert.fail();
        assert.end();
    }).catch((error)=> {
        assert.equal(error.message, 'Ids from node must to be integers');
        assert.end();
    });
});

test('Test UPDATE relation', (assert) => {
    let relation = _.first(relations);
    assert.notEqual(relation, null);
    ORMNeoRelation.update(relation.id, {newProperty: 'b', property: 'c'})
    .then((updatedRel) => {
        assert.equal(updatedRel.newProperty, 'b');
        assert.equal(updatedRel.property, 'c');
        assert.end();
    }).catch((error)=> {
        assert.fail('Fail with error');
        assert.end();
    });
});

test('Test FIND relations', (assert) => {
    assert.end();
});

test('Test COUNT relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let count1 = ORMNeoRelation.count(node1.id, node2.id, 'relatedto');
    let count2 = ORMNeoRelation.count(node1.id, node2.id, 'other');
    let count3 = ORMNeoRelation.count(node1.id, node2.id, 'relatedto',ORMQueryBuilder.query().and('property', {$eq: 'c'}));

    Promise.all([count1, count2, count3]).then((counts) => {
        assert.equal(counts[0], 2);
        assert.equal(counts[1], 0);
        assert.equal(counts[2], 1);
        assert.end();
    }).catch((error)=> {
        assert.fail('Fail with error');
        assert.end();
    });

});

test('Test EXISTS relations', (assert) => {
        assert.end();

});

test('TEST DELETE relation', (assert) => {
    assert.end();
});

test('Test DELETE ALL relations', (assert) => {
    assert.end();
});

test('Test COUNT relation', (assert) => {
    assert.end();
});