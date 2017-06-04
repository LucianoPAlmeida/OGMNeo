'use strict';

const test = require('blue-tape');
const OGMNeoCypher = require('../lib/ogmneo-cypher');
const OGMNeo = require('../lib/ogmneo');

OGMNeo.connect(process.env.NEO4J_USER, process.env.NEO4J_PASS, process.env.NEO4J_HOST);
test('Test Connection', (assert) => {
    assert.notEqual(OGMNeo.driver, null);
    assert.equal(OGMNeo.isConnected, true);
    assert.end();
});

test('Test EXECUTE Transactional cypher', (assert) => {    
   OGMNeoCypher.execute('MATCH (n) RETURN n', true).then((result) => {
        assert.notEqual(result,null);
        assert.end();
   });
});

test('Test EXECUTE NOT Transactional cypher', (assert) => {    
   OGMNeoCypher.execute('MATCH (n) RETURN COUNT(n)', false).then((result) => {
        assert.notEqual(result,null);
        assert.end();
   });
});

test('Test INVALID cypher', (assert) => {    
   OGMNeoCypher.execute(4324).catch((error) => {
        assert.notEqual(error,null);
        assert.equal(error.message, 'Cypher query must to be a string statement');
        assert.end();
   });
});