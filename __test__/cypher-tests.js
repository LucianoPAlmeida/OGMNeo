'use strict';

const test = require('blue-tape');
const ORMNeoCypher = require('../lib/ormneo-cypher');
const ORMNeo = require('../lib/ormneo');

ORMNeo.connect(process.env.NEO4J_USER, process.env.NEO4J_PASS, process.env.NEO4J_HOST);

test('Test EXECUTE Transactional cypher', (assert) => {    
   ORMNeoCypher.execute('MATCH (n) RETURN n', true).then((result) => {
        assert.notEqual(result,null);
        assert.end();
   });
});

test('Test EXECUTE NOT Transactional cypher', (assert) => {    
   ORMNeoCypher.execute('MATCH (n) RETURN n', false).then((result) => {
        assert.notEqual(result,null);
        assert.end();
   });
});

test('Test INVALID cypher', (assert) => {    
   ORMNeoCypher.execute(4324).catch((error) => {
        assert.notEqual(error,null);
        assert.equal(error.message, 'Cypher query must to be a string statement');
        assert.end();
   });
});