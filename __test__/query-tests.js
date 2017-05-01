'use strict';

const test = require('blue-tape');
const QueryBuilder = require('../lib/ormneo-query');

test('Test condition to query method', (assert) => {
    let builder = new QueryBuilder();
    let query = builder._conditionToQuery({ 'name': { $eq: 'value' } });
    assert.equal(query, 'n.name = \'value\'');
    query = builder._conditionToQuery({ 'name': { $eq: 'value', $lt: 'ab' } });
    assert.equal(query, 'n.name = \'value\' AND n.name < \'ab\'');
    query = builder._conditionToQuery({ 'age': { $eq: 26 } });
    assert.equal(query, 'n.age = 26');
    query = builder._conditionToQuery({ 'age': { $lte: 50 } });
    assert.equal(query, 'n.age <= 50');
    query = builder._conditionToQuery({ 'age': { $ne: 50 } });
    assert.equal(query, 'n.age != 50');
    query = builder._conditionToQuery({ 'age': { $gt: 50 } });
    assert.equal(query, 'n.age > 50');
    query = builder._conditionToQuery({ 'age': { $gte: 50 } });
    assert.equal(query, 'n.age >= 50');
    assert.end();
});

test('Test where method', (assert) => {
    let where = new QueryBuilder('Object').and('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' })
        .where();
    assert.equal(where, 'WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\'');
    assert.end();
});

test('Test count method', (assert) => {
    let queryBuilder = new QueryBuilder('Object');
    let where = queryBuilder.and('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' })
        .count();
    assert.equal(where, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN COUNT(n) as count');
    assert.end();
});



test('Test query builder', (assert) => {
    let queryBuilder = new QueryBuilder('Object');
    let cypher = queryBuilder.and('name', { $eq: 'derp' })
        .or('age', { $lt: 25 })
        .and('last', { $eq: 'value' })
        .match();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n');
    queryBuilder.limit(25);
    cypher = queryBuilder.match();
    assert.equal(cypher, 'MATCH (n:Object) WHERE n.name = \'derp\' OR n.age < 25 AND n.last = \'value\' RETURN n LIMIT 25');

    assert.end();
}); 