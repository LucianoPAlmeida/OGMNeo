'use strict';

const test = require('tape');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('../lib/ogmneo-operation');
const OGMNeoOperationExecuter = require('../lib/ogmneo-operation-executer');
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