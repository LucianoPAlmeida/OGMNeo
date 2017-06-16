'use strict';

const test = require('tape');
const OGMNeo = require('../lib/ogmneo');
const OGMNeoNode = require('../lib/ogmneo-node');
const OGMNeoRelation = require('../lib/ogmneo-relation');
const OGMQueryBuilder = require('../lib/ogmneo-query');
const OGMNeoWhere = require('../lib/ogmneo-where');
const OGMNeoQuery = require('../lib/ogmneo-query');
const OGMNeoRelationQuery = require('../lib/ogmneo-relation-query');

const _ = require('lodash');

var nodes;
var relations;

test('Setup', (assert) => {
    let values = [{ name: 'Test1', value: 2 }, { name: 'Test2', value: 4 }];
    let promises = values.map((node) => { return OGMNeoNode.create(node, 'object'); });
    Promise.all(promises).then((all) => {
        nodes = all;
        assert.equal(nodes.length, 2);
        assert.end();
    });
});

test('Test CREATE relation', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let rel1 = OGMNeoRelation.relate(node1.id, 'relatedto', node2.id, { property: 'a' });
    let rel2 = OGMNeoRelation.relate(node1.id, 'relatedto', node2.id, {});
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
    });
});

test('Test FAIL CREATE TYPE relation', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    OGMNeoRelation.relate(node1.id, null, node2.id, { property: 'a' }).catch((error) => {
        assert.equal(error.message, 'A relatioship type must be specified');
        assert.end();
    });
});

test('Test FAIL CREATE IDS relation', (assert) => {
    let node2 = nodes[1];
    OGMNeoRelation.relate('dasdsa', node2.id, 'type', { property: 'a' }).catch((error) => {
        assert.equal(error.message, 'Ids from node must to be integers');
        assert.end();
    });
});

test('Test UPDATE first relation', (assert) => {
    let relation = _.first(relations);
    assert.notEqual(relation, null);
    OGMNeoRelation.update(relation.id, { newProperty: 'b', property: 'c' })
        .then((updatedRel) => {
            assert.equal(updatedRel.newProperty, 'b');
            assert.equal(updatedRel.property, 'c');
            assert.end();
        });
});

test('Test UPDATE second relation', (assert) => {
    let relation = relations[1];
    assert.notEqual(relation, null);
    OGMNeoRelation.update(relation.id, { newProperty: 'b', property: 'a' })
        .then((updatedRel) => {
            assert.equal(updatedRel.newProperty, 'b');
            assert.equal(updatedRel.property, 'a');
            assert.end();
        });
});

test('Test FAIL UPDATE relation', (assert) => {
    OGMNeoRelation.update('', { newProperty: 'b', property: 'c' })
        .catch((error) => {
            assert.equal(error.message, 'Relation id must to be integer');
            assert.end();
        });
});

test('Test FAIL UPDATE MANY', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];

    OGMNeoRelation.updateMany({ newProperty: 'new!!!' }, null).catch((error) => {
        assert.equal(error.message, 'The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        assert.end();
    });
});

test('Test empty newProperties UPDATE MANY', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto').relationWhere(OGMNeoWhere.create('property', { $eq: 'c' }));
    OGMNeoRelation.updateMany({}, query)
        .then((updatedRelations) => {
            assert.equal(updatedRelations.length, 0);
            assert.end();
        });
});

test('Test UPDATE MANY', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id).relationWhere(OGMNeoWhere.create('property', { $eq: 'c' }));
    OGMNeoRelation.updateMany({ newProperty: 'new!!!' }, query)
        .then((updatedRelations) => {
            assert.equal(updatedRelations.length, 1);
            updatedRelations.forEach((relation) => {
                assert.equal(relation.property, 'c');
                assert.equal(relation.newProperty, 'new!!!');
            });
            assert.end();
        });
});

test('Test FIND relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query1 = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id);
    let find1 = OGMNeoRelation.find(query1);
    let query2 = OGMNeoRelationQuery.create('other').startNode(node1.id).endNode(node2.id);
    let find2 = OGMNeoRelation.find(query2);
    let query3 = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id).relationWhere(new OGMNeoWhere('property', { $eq: 'c' }));
    let find3 = OGMNeoRelation.find(query3);

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
    });
});

test('Test FAIL FIND', (assert) => {
    OGMNeoRelation.findPopulated('').catch((error) => {
        assert.equal(error.message, 'The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        assert.end();
    });
});


test('Test FAIL FIND POPULATED', (assert) => {
    OGMNeoRelation.find('').catch((error) => {
        assert.equal(error.message, 'The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        assert.end();
    });
});

test('Test FIND POPULATED relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id);
    OGMNeoRelation.findPopulated(query).then((foundNodes) => {
        assert.equal(foundNodes.length, 2);
        foundNodes.forEach((node) => {
            assert.notEqual(node.start, null);
            assert.deepEqual(node.start, { id: node1.id, name: 'Test1', value: 2 });
            assert.notEqual(node.end, null);
            assert.deepEqual(node.end, { id: node2.id, name: 'Test2', value: 4 });
        });
        assert.end();
    });
});

test('Test FIND relations ORDER BY DESC', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id).descOrderBy('property').limit(3);
    OGMNeoRelation.find(query).then((foundRelations) => {
        assert.equal(foundRelations.length, 2);
        let relation1 = foundRelations[0];
        let relation2 = foundRelations[1];
        assert.equal(relation1.property > relation2.property, true);
        assert.end();
    });
});

test('Test FIND relations ORDER BY ASC', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id).ascOrderBy('property').limit(3);
    OGMNeoRelation.find(query).then((foundRelations) => {
        assert.equal(foundRelations.length, 2);
        let relation1 = foundRelations[0];
        let relation2 = foundRelations[1];
        assert.equal(relation1.property < relation2.property, true);
        assert.end();
    });
});

//===============================================================================
test('Test FIND relations WITH Filter Return Relation', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto')
        .startNode(node1.id)
        .endNode(node2.id)
        .relationWhere(new OGMNeoWhere('property', { $eq: 'c' }))
        .returnRelationNode(['property'])
        .descOrderBy('property')
        .limit(20);
    OGMNeoRelation.findPopulated(query).then((foundRelations) => {
        assert.equal(foundRelations.length, 1);
        let relation = _.first(foundRelations);
        assert.equal(relation.property, 'c');
        assert.equal(relation.newProperty, undefined);
        assert.end();
    });
});

test('Test FIND POPULATED relations WITH Filter Return Start Node', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto')
        .startNode(node1.id)
        .endNode(node2.id)
        .relationWhere(new OGMNeoWhere('property', { $eq: 'c' }))
        .returnStartNode(['name'])
        .descOrderBy('property')
        .limit(20);
    OGMNeoRelation.findPopulated(query).then((foundRelations) => {
        assert.equal(foundRelations.length, 1);
        let relation = _.first(foundRelations);
        assert.notEqual(relation.start, null);
        assert.deepEqual(relation.start, { name: 'Test1'});
        assert.notEqual(relation.end, null);
        assert.deepEqual(relation.end, { id: node2.id, name: 'Test2', value: 4 });
        assert.equal(relation.property, 'c');
        assert.equal(relation.newProperty, 'new!!!');
        assert.end();
    });
});

test('Test FIND POPULATED relations WITH Filter Return End Node', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto')
        .startNode(node1.id)
        .endNode(node2.id)
        .relationWhere(new OGMNeoWhere('property', { $eq: 'c' }))
        .returnEndNode(['name'])
        .descOrderBy('property')
        .limit(20);
    OGMNeoRelation.findPopulated(query).then((foundRelations) => {
        assert.equal(foundRelations.length, 1);
        let relation = _.first(foundRelations);
        assert.notEqual(relation.start, null);
        assert.deepEqual(relation.start, { id: node1.id, name: 'Test1', value: 2 });
        assert.notEqual(relation.end, null);
        assert.deepEqual(relation.end, { name: 'Test2' });
        assert.equal(relation.property, 'c');
        assert.equal(relation.newProperty, 'new!!!');
        assert.end();
    });
});
//===============================================================================
test('Test COUNT relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query1 = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id);
    let count1 = OGMNeoRelation.count(query1);
    let query2 = OGMNeoRelationQuery.create('other').startNode(node1.id).endNode(node2.id);
    let count2 = OGMNeoRelation.count(query2);
    let query3 = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id).relationWhere(new OGMNeoWhere('property', { $eq: 'c' }));
    let count3 = OGMNeoRelation.count(query3);

    Promise.all([count1, count2, count3]).then((counts) => {
        assert.equal(counts[0], 2);
        assert.equal(counts[1], 0);
        assert.equal(counts[2], 1);
        assert.end();
    });

});

test('Test FAIL COUNT', (assert) => {
    OGMNeoRelation.count({}).catch((error) => {
        assert.equal(error.message, 'The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        assert.end();
    });
});

test('Test EXISTS relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];

    let query1 = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id);
    let exists1 = OGMNeoRelation.exists(query1);
    let query2 = OGMNeoRelationQuery.create('other').startNode(node1.id).endNode(node2.id);
    let exists2 = OGMNeoRelation.exists(query2);
    let query3 = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id).relationWhere(new OGMNeoWhere('property', { $eq: 'c' }));
    let exists3 = OGMNeoRelation.exists(query3);

    Promise.all([exists1, exists2, exists3]).then((exists) => {
        assert.equal(exists[0], true);
        assert.equal(exists[1], false);
        assert.equal(exists[2], true);
        assert.end();
    });

});

test('Test FAIL DELETE Relation', (assert) => {
    OGMNeoRelation.deleteRelation({}).catch((error) => {
        assert.equal(error.message, 'Relation id must to be an integer number');
        assert.end();
    });
});

test('TEST DELETE relation', (assert) => {
    let rel = _.first(relations);
    assert.notEqual(rel, undefined);
    OGMNeoRelation.deleteRelation(rel.id).then((deletedRel) => {
        assert.equal(rel.id, deletedRel.id);
        assert.end();
    })
});

test('Test FAIL DELETE MANY', (assert) => {
    OGMNeoRelation.deleteMany('').catch((error) => {
        assert.equal(error.message, 'The query object can\'t be null and must be an instance of OGMNeoRelationQuery');
        assert.end();
    });
});

test('Test DELETE MANY relations', (assert) => {
    let node1 = nodes[0];
    let node2 = nodes[1];
    let query = OGMNeoRelationQuery.create('relatedto').startNode(node1.id).endNode(node2.id);
    OGMNeoRelation.deleteMany(query).then((deletedRels) => {
        assert.equal(deletedRels.length, 1);
        assert.end();
    });
});

test.onFinish(() => {
    OGMNeo.disconnect();
});