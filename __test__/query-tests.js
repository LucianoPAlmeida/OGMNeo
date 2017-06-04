'use strict';

const test = require('tape');
const QueryBuilder = require('../lib/ogmneo-query');
const OGMNeoWhere = require('../lib/ogmneo-where');


test('Test FAILED WHERE assign', (assert) => {
    try {
        let queryBuilder = new QueryBuilder('Object', '');
    } catch(error) {
        assert.equal(error.message, 'where parameter must be an instance of OGMNeoWhere class or null');
        assert.end();
    }
});

test('Test count method', (assert) => {
    let where = new OGMNeoWhere('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' })
    let queryBuilder = new QueryBuilder('Object', where);
    let whereCypher = queryBuilder.countCypher();
    assert.equal(whereCypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN COUNT(n) as count');
    assert.end();
});



test('Test query builder', (assert) => {
    let where = new OGMNeoWhere('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' })
    let queryBuilder = new QueryBuilder('Object', where);
    let cypher = queryBuilder.queryCypher();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n');
    queryBuilder.limit(25);
    cypher = queryBuilder.queryCypher();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n LIMIT 25');
    assert.end();
}); 