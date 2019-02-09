'use strict';

const test = require('tape');
const QueryBuilder = require('../lib/ogmneo-query');
const OGMNeoWhere = require('../lib/ogmneo-where');


test('Test FAILED WHERE assign', (assert) => {
    assert.throws(() => {
        new QueryBuilder('Object').where({});
    }, /where parameter must be an instance of OGMNeoWhere class or null/);
    assert.end();
});

test('Test count method', (assert) => {
    let where = new OGMNeoWhere('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' });
    let queryBuilder = new QueryBuilder('Object').where(where);
    let whereCypher = queryBuilder.countCypher();
    assert.equal(whereCypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN COUNT(n) as count');
    assert.end();
});



test('Test query builder', (assert) => {
    let where = new OGMNeoWhere('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' });
    let queryBuilder = new QueryBuilder('Object').where(where);
    let cypher = queryBuilder.queryCypher();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n');
    queryBuilder.limit(25);
    cypher = queryBuilder.queryCypher();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n LIMIT 25');
    queryBuilder.ascOrderBy(['name', 'age']);
    cypher = queryBuilder.queryCypher();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n ORDER BY n.name, n.age ASC LIMIT 25');
    queryBuilder.descOrderBy('name');
    cypher = queryBuilder.queryCypher();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n ORDER BY n.name DESC LIMIT 25');
    assert.end();
}); 

test('Test ORDER BY Clause', (assert) => {
    //ASC
    let query = new QueryBuilder('Object').ascOrderBy(['name', 'test']);
    assert.equal(query.orderByClause(), 'ORDER BY n.name, n.test ASC');
    query = new QueryBuilder('Object').ascOrderBy('name');
    assert.equal(query.orderByClause(), 'ORDER BY n.name ASC');
    //DESC
    query = new QueryBuilder('Object').descOrderBy(['name', 'test']);
    assert.equal(query.orderByClause(), 'ORDER BY n.name, n.test DESC');
    query = new QueryBuilder('Object').descOrderBy('name');
    assert.equal(query.orderByClause(), 'ORDER BY n.name DESC');
    assert.end();
});

test('Test Fail ORDER BY Clause', (assert) => {
    let query = new QueryBuilder('Object').ascOrderBy({});
    assert.equal(query.orderByClause(), '');
    assert.end();
});

test('Test RETURN Clause', (assert) => {
    let query = new QueryBuilder('Object').return('name').descOrderBy('name');
    assert.equal(query.queryCypher(), 'MATCH (n:Object) RETURN n.name ORDER BY n.name DESC');
    query = new QueryBuilder('Object').return(['name', 'tes']).descOrderBy('name');
    assert.equal(query.queryCypher(), 'MATCH (n:Object) RETURN n.name, n.tes ORDER BY n.name DESC');
    assert.end();
});

test('Test RETURN Clause with id', (assert) => {
    let query = new QueryBuilder('Object').return('id').descOrderBy('name');
    assert.equal(query.queryCypher(), 'MATCH (n:Object) RETURN ID(n) ORDER BY n.name DESC');
    query = new QueryBuilder('Object').return(['name', 'tes', 'id']).descOrderBy('name');
    assert.equal(query.queryCypher(), 'MATCH (n:Object) RETURN n.name, n.tes, ID(n) ORDER BY n.name DESC');
    assert.end();
});

test('Test Fail RETURN Clause', (assert) => {
    let query = new QueryBuilder('Object').return({}).descOrderBy('name');
    assert.equal(query.queryCypher(), 'MATCH (n:Object) RETURN n ORDER BY n.name DESC');
    query = new QueryBuilder('Object').return(3).descOrderBy(['name', 'tes']);
    assert.equal(query.queryCypher(), 'MATCH (n:Object) RETURN n ORDER BY n.name, n.tes DESC');
    assert.end();
});

