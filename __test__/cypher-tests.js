'use strict';

const test = require('tape');
const OGMNeoCypher = require('../lib/ogmneo-cypher');
const OGMNeo = require('../lib/ogmneo');

OGMNeo.connect(process.env.NEO4J_USER, process.env.NEO4J_PASS, process.env.NEO4J_HOST);
test('Test Connection', (assert) => {
    assert.notEqual(OGMNeo.driver, null);
    assert.equal(OGMNeo.isConnected, true);
    assert.end();
});

test('Test INVALID READ cypher', (assert) => {    
    OGMNeoCypher.transactionalRead(4324).catch((error) => {
         assert.notEqual(error,null);
         assert.equal(error.message, 'Cypher statements must to be a string or a non empty string array');
         assert.end();
    });
});

test('Test EXECUTE READ Transactional cypher', (assert) => {    
    OGMNeoCypher.transactionalRead('MATCH (n) RETURN n').then((result) => {
        assert.notEqual(result,null);
        assert.end();
   });
});

test('Test EXECUTE READ MANY Transactional cypher', (assert) => {    
    OGMNeoCypher.transactionalRead(['MATCH (n) RETURN COUNT(n)', 'MATCH (n) RETURN n']).then((result) => {
        assert.notEqual(result,null);
        assert.end();
   });
});

test('Test INVALID WRITE cypher', (assert) => {    
    OGMNeoCypher.transactionalWrite(4324).catch((error) => {
         assert.notEqual(error,null);
         assert.equal(error.message, 'Cypher statements must to be a string or a non empty string array');
         assert.end();
    });
});

test('Test EXECUTE WRITE Transactional cypher', (assert) => {    
    OGMNeoCypher.transactionalWrite('create (n {name: \'user1\'})').then((result) => {
         assert.notEqual(result,null);
         assert.end();
    });
 });
 
 test('Test EXECUTE WRITE MANY Transactional cypher', (assert) => {    
    OGMNeoCypher.transactionalWrite(['create (n {name: \'user1\'})', 'create (n {name: \'user2\'})']).then((result) => {
         assert.notEqual(result,null);
         assert.end();
    });
 });

