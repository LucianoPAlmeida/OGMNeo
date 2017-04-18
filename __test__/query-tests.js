'use strict';

const test = require('blue-tape');
const QueryBuilder = require('../lib/ormneo-query');

test('A test test', (assert) => {
    let builder = new QueryBuilder();
    let query = builder._conditionToQuery({'n.name' : {$eq : 'value'}});
    assert.equal(query, 'n.name = \'value\'');
    query = builder._conditionToQuery({'n.name' : {$eq: 'value', $lt: 'ab'} });
    assert.equals(query, 'n.name = \'value\' AND n.name < \'ab\'');
    query = builder._conditionToQuery({'n.age' : {$eq: 26 } });
    assert.equals(query, 'n.age = 26');
    query = builder._conditionToQuery({'n.age' : {$lte: 50 } });
    assert.equals(query, 'n.age <= 50');
    query = builder._conditionToQuery({'n.age' : {$ne: 50 } });
    assert.equals(query, 'n.age != 50');
    query = builder._conditionToQuery({'n.age' : {$gt: 50 } });
    assert.equals(query, 'n.age > 50');
    query = builder._conditionToQuery({'n.age' : {$gte: 50 } });
    assert.equals(query, 'n.age >= 50');
    assert.end();
});