'use strict';

const test = require('tape');
const OGMNeoWhere = require('../lib/ogmneo-where');

test('Test CONSTRUCT an where object', (assert) => {
    let where = new OGMNeoWhere('name', { $eq: 'value' });
    assert.equal(where.clause, 'n.name = \'value\'');
    assert.end();
});

test('Test condition to query method', (assert) => {
    let where = new OGMNeoWhere();
    let query = where._conditionToQuery({ 'name': { $eq: 'value' } });
    assert.equal(query, 'n.name = \'value\'');
    query = where._conditionToQuery({ 'name': { $eq: 'value', $lt: 'ab' } });
    assert.equal(query, 'n.name = \'value\' AND n.name < \'ab\'');
    query = where._conditionToQuery({ 'age': { $eq: 26 } });
    assert.equal(query, 'n.age = 26');
    query = where._conditionToQuery({ 'age': { $lte: 50 } });
    assert.equal(query, 'n.age <= 50');
    query = where._conditionToQuery({ 'age': { $ne: 50 } });
    assert.equal(query, 'n.age <> 50');
    query = where._conditionToQuery({ 'age': { $gt: 50 } });
    assert.equal(query, 'n.age > 50');
    query = where._conditionToQuery({ 'age': { $gte: 50 } });
    assert.equal(query, 'n.age >= 50');
    query = where._conditionToQuery({ 'age': { $e: 50 } });
    assert.equal(query, '');
    query = where._conditionToQuery({});
    assert.equal(query, '');
    query = where._conditionToQuery({ 'age': { $eq: null } });
    assert.equal(query, 'n.age = null');
    query = where._conditionToQuery({ 'name': { $regex: '.*[tes]' } });
    assert.equal(query, 'n.name =~ \'.*[tes]\'');
    query = where._conditionToQuery({ 'name': { $regex: 3 } });
    assert.equal(query, '');
    query = where._conditionToQuery({ 'name': { $startsWith: 'r' } });
    assert.equal(query, 'n.name STARTS WITH \'r\'');
    query = where._conditionToQuery({ 'name': { $startsWith: 3 } });
    assert.equal(query, '');
    query = where._conditionToQuery({ 'name': { $endsWith: 'r' } });
    assert.equal(query, 'n.name ENDS WITH \'r\'');
    query = where._conditionToQuery({ 'name': { $endsWith: 3 } });
    assert.equal(query, '');
    query = where._conditionToQuery({ 'name': { $contains: 'r' } });
    assert.equal(query, 'n.name CONTAINS \'r\'');
    query = where._conditionToQuery({ 'name': { $contains: 3 } });
    assert.equal(query, '');
    query = where._conditionToQuery({ 'date': { $lt: new Date('2017-05-20T05:28:02.719Z')}});
    assert.equal(query, 'n.date < 1495258082719');
    query = where._conditionToQuery({'name' : {$in: ['value', 9, null]}})
    assert.equal(query, 'n.name IN [ \'value\' , 9 , null ]');
    query = where._conditionToQuery({ 'name': { $exists: true } })
    assert.equal(query, 'EXISTS(n.name)');
    query = where._conditionToQuery({ 'name': { $exists: false } })
    assert.equal(query, 'NOT EXISTS(n.name)');
    query = where._conditionToQuery({ 'name': { $exists: '' } })
    assert.equal(query, '');
    assert.end();


});

test('Test WHERE CLAUSE', (assert) => {
    let where = new OGMNeoWhere('name', { $contains: 'r' })
        .and('age', { $lte: 20 })
        .and('property', {$exists: true})
        .or('gender', { $eq: 'm' });
    assert.equal(where.clause, 'n.name CONTAINS \'r\' AND n.age <= 20 AND EXISTS(n.property) OR n.gender = \'m\'');
    assert.end();
});
