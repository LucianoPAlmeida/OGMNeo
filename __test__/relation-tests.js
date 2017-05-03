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

    }).catch((error)=> {
        assert.equal(error.message, 'A relatioship type must be specified');
        assert.end();
    });
});

test('Test FAIL CREATE IDS relation', (assert) => {
    let node2 = nodes[1];
    ORMNeoRelation.relate('dasdsa', node2.id, 'type' , {property: 'a'}).then(()=> {
        
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
    let node1 = nodes[0];
    let node2 = nodes[1];
    let find1 = ORMNeoRelation.find(node1.id, node2.id, 'relatedto');
    let find2 = ORMNeoRelation.find(node1.id, node2.id, 'other');
    let find3 = ORMNeoRelation.find(node1.id, node2.id, 'relatedto',ORMQueryBuilder.query().and('property', {$eq: 'c'}));

    Promise.all([find1, find2, find3]).then((finds) => {
        assert.equal(finds[0].length, 2);
        finds[0].forEach((rel) => {
            assert.equal(rel.type, 'relatedto');
        });
        assert.equal(_.isEmpty(finds[1]), true);
        assert.equal(finds[2].length, 1);
        let rel = _.first(finds[2]);
        assert.equal(rel.type, 'relatedto');
        assert.equal(rel.property, 'c');
        assert.end();
    }).catch((error)=> {
        assert.fail('Fail with error');
        assert.end();
    });
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
    let node1 = nodes[0];
    let node2 = nodes[1];
    let exists1 = ORMNeoRelation.exists(node1.id, node2.id, 'relatedto');
    let exists2 = ORMNeoRelation.exists(node1.id, node2.id, 'other');
    let exists3 = ORMNeoRelation.exists(node1.id, node2.id, 'relatedto',ORMQueryBuilder.query().and('property', {$eq: 'c'}));

    Promise.all([exists1, exists2, exists3]).then((exists) => {
        assert.equal(exists[0], true);
        assert.equal(exists[1], false);
        assert.equal(exists[2], true);
        assert.end();
    }).catch((error)=> {
        assert.fail('Fail with error');
        assert.end();
    });

});

test('TEST DELETE relation', (assert) => {
    let rel = _.first(relations);
    assert.notEqual(rel, undefined);
    ORMNeoRelation.deleteRelation(rel.id).then((deletedRel) => {
        assert.equal(rel.id, deletedRel.id);
        assert.end();
    }).catch((error) => {
        assert.fail();
        assert.end();
    });
});

test('Test DELETE ALL relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    ORMNeoRelation.deleteAll(node1.id, node2.id, 'relatedto').then((deletedRels) => {
        assert.equal(deletedRels.length, 1);
        assert.end();
    }).catch((error) => {
        assert.fail();
        assert.end();
    });
});

test.onFinish(() => {
    ORMNeo.disconnet();
});