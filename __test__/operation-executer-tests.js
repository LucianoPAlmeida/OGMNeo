'use strict';

const test = require('tape');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('../lib/ogmneo-operation');
const OGMNeoOperationExecuter = require('../lib/ogmneo-operation-executer');
const OGMNeoNode = require('../lib/ogmneo-node');
const _ = require('lodash');

test('Test Invalid Operation', (assert) => {    
    OGMNeoOperationExecuter.execute({}).catch((error) => {
        assert.equal(error.message, 'The operation must be a instance of ogmneo.Operation');
        assert.end();
    }); 
});

test('Test invalid array of operations', (assert) => {    
    OGMNeoOperationExecuter.executeReadOperations({}).catch((error) => {
        assert.equal(error.message, 'The parameter operations must be an array');
        assert.end();
    }); 
});

test('Test invalid item on operations array', (assert) => {    
    OGMNeoOperationExecuter.executeReadOperations([{}]).catch((error) => {
        assert.equal(error.message, 'The parameter operations must be an array that contains only instances of ogmneo.Operation');
        assert.end();
    }); 
});

test('Test invalid operation type on operations array', (assert) => {    
    let operation = OGMNeoOperationBuilder.create().type(OGMNeoOperation.WRITE).build();
    OGMNeoOperationExecuter.executeReadOperations([operation]).catch((error) => {
        assert.equal(error.message, 'The parameter operations must be an array that contains only instances of ogmneo.Operation that have type : READ');
        assert.end();
    }); 
});

//Testing OGMNeoOperationExecuter.executeWriteOperations executor
test('Test invalid operation type on operations array', (assert) => {    
    let createUser1 = OGMNeoNode.createOperation({name: 'Ayrton Senna'}, 'Person');
    let createUser2 = OGMNeoNode.createOperation({name: 'Alain Prost'}, 'Person');
    
    OGMNeoOperationExecuter.executeWriteOperations([createUser1, createUser2]).then((result) => {
        let created1 = result[0];
        let created2 = result[1];
        assert.notEqual(created1.id, undefined);
        assert.equal(created1.name, 'Ayrton Senna');
        assert.notEqual(created2.id, undefined);
        assert.equal(created2.name, 'Alain Prost');
        assert.end();
    });
});