'use strict';

const test = require('tape');
const QueryBuilder = require('../lib/ogmneo-query');
const OGMNeoWhere = require('../lib/ogmneo-where');
const OGMNeoRelationQuery = require('../lib/ogmneo-relation-query');

test('TEST RELATION QUERY CYPHER MATCH', (assert) => {
    let query = OGMNeoRelationQuery.create('relation').startNode(23);
    assert.equal(query.matchCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23');
    query = OGMNeoRelationQuery.create().startNode(2, 'label');
    assert.equal(query.matchCypher(), 'MATCH p=(n1:label)-[r]->(n2) WHERE ID(n1) = 2');
    query = OGMNeoRelationQuery.create('relation').startNode(2, 'label').endNode(43, 'label');
    assert.equal(query.matchCypher(), 'MATCH p=(n1:label)-[r:relation]->(n2:label) WHERE ID(n1) = 2 AND ID(n2) = 43');
    query = OGMNeoRelationQuery.create('relation').startNode(2, 'label').endNode(43, 'label').relationWhere(OGMNeoWhere.create('property', { $eq: 2 }).or('other', { $eq: 3 }));
    assert.equal(query.matchCypher(), 'MATCH p=(n1:label)-[r:relation]->(n2:label) WHERE ID(n1) = 2 AND ID(n2) = 43 AND r.property = 2 OR r.other = 3');

    query = OGMNeoRelationQuery.create('relation').startNode(2, 'label').endNode(43, 'label')
        .relationWhere(OGMNeoWhere.create('property', { $eq: 2 }).or('other', { $eq: 3 }))
        .startNodeWhere(OGMNeoWhere.create('name', { $eq: 'a' }));
    assert.equal(query.matchCypher(), 'MATCH p=(n1:label)-[r:relation]->(n2:label) WHERE ID(n1) = 2 AND ID(n2) = 43 AND r.property = 2 OR r.other = 3 AND n1.name = \'a\'');
    query = OGMNeoRelationQuery.create('relation').startNode(2, 'label').endNode(43, 'label')
        .startNodeWhere(OGMNeoWhere.create('name', { $eq: 'a' }));
    assert.equal(query.matchCypher(), 'MATCH p=(n1:label)-[r:relation]->(n2:label) WHERE ID(n1) = 2 AND ID(n2) = 43 AND n1.name = \'a\'');
    query = OGMNeoRelationQuery.create()
        .startNodeWhere(OGMNeoWhere.create('name', { $eq: 'a' })).endNodeWhere(OGMNeoWhere.create('name', {$eq: 'dsadsa'}));
    assert.equal(query.matchCypher(), 'MATCH p=(n1)-[r]->(n2) WHERE n1.name = \'a\' AND n2.name = \'dsadsa\'');

    query = OGMNeoRelationQuery.create('relation').startNode(2, 'label').endNode(43, 'label')
        .relationWhere(OGMNeoWhere.create('property', { $eq: 2 }).or('other', { $eq: 3 }))
        .startNodeWhere(OGMNeoWhere.create('name', { $eq: 'a' }))
        .endNodeWhere(OGMNeoWhere.create('name', { $eq: 'b' }));
    assert.equal(query.matchCypher(), 'MATCH p=(n1:label)-[r:relation]->(n2:label) WHERE ID(n1) = 2 AND ID(n2) = 43 AND r.property = 2 OR r.other = 3 AND n1.name = \'a\' AND n2.name = \'b\'');
    assert.end();
});

test('TEST RELATION QUERY CYPHER QUERY', (assert) => {
    let query = OGMNeoRelationQuery.create('relation').startNode(23).limit(20);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r LIMIT 20');
    assert.equal(query.queryPopulatedCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r, n1, n2 LIMIT 20');
    
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnStartNode('date').limit(20);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r LIMIT 20');
    assert.equal(query.queryPopulatedCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r, n1.date, n2 LIMIT 20');
    
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnStartNode('date').descOrderBy(['name','test']).limit(20);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r ORDER BY r.name, r.test DESC LIMIT 20');
    assert.equal(query.queryPopulatedCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r, n1.date, n2 ORDER BY r.name, r.test DESC LIMIT 20');

    query = OGMNeoRelationQuery.create('relation').startNode(23).returnStartNode('date').returnEndNode(['name', 'test']).descOrderBy(['name', 'test']).limit(20);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r ORDER BY r.name, r.test DESC LIMIT 20');
    assert.equal(query.queryPopulatedCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r, n1.date, n2.name, n2.test ORDER BY r.name, r.test DESC LIMIT 20');

    query = OGMNeoRelationQuery.create('relation').startNode(23).returnStartNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r ORDER BY r.name, r.test ASC');
    assert.equal(query.queryPopulatedCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r, n1.date, n2.name, n2.test ORDER BY r.name, r.test ASC');

    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY r.name, r.test ASC');
    assert.equal(query.queryPopulatedCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date, n1, n2.name, n2.test ORDER BY r.name, r.test ASC');

    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY r.name, r.test ASC');
    assert.equal(query.queryNodesCypher('both', true), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN DISTINCT n1, n2.name, n2.test ORDER BY r.name, r.test ASC');
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY r.name, r.test ASC');
    assert.equal(query.queryNodesCypher('start', true), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN DISTINCT n1 ORDER BY r.name, r.test ASC');
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY r.name, r.test ASC');
    assert.equal(query.queryNodesCypher('end', true), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN DISTINCT n2.name, n2.test ORDER BY r.name, r.test ASC');
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY r.name, r.test ASC');
    assert.equal(query.queryNodesCypher('end'), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN n2.name, n2.test ORDER BY r.name, r.test ASC');

    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(['name', 'test'], ['name']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY r.name, r.test, n1.name ASC');
    assert.equal(query.queryNodesCypher('end'), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN n2.name, n2.test ORDER BY r.name, r.test, n1.name ASC');
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(null, ['name']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY n1.name ASC');
    assert.equal(query.queryNodesCypher('end'), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN n2.name, n2.test ORDER BY n1.name ASC');
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(null, null, ['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY n2.name, n2.test ASC');
    assert.equal(query.queryNodesCypher('end'), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN n2.name, n2.test ORDER BY n2.name, n2.test ASC');
    query = OGMNeoRelationQuery.create('relation').startNode(23).returnRelationNode('date').returnEndNode(['name', 'test']).ascOrderBy(null, ['dasd'], ['name', 'test']);
    assert.equal(query.queryCypher(), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN r.date ORDER BY n1.dasd, n2.name, n2.test ASC');
    assert.equal(query.queryNodesCypher('end'), 'MATCH p=(n1)-[r:relation]->(n2) WHERE ID(n1) = 23 RETURN n2.name, n2.test ORDER BY n1.dasd, n2.name, n2.test ASC');
    assert.end();

});



