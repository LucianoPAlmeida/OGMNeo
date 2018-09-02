'use strict';

const test = require('tape');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('../lib/ogmneo-operation');
const OGMNeoOperationExecuter = require('../lib/ogmneo-operation-executer');
const OGMNeoNode = require('../lib/ogmneo-node');
const OGMNeoQuery = require('../lib/ogmneo-query');
const OGMNeoWhere = require('../lib/ogmneo-where');

const _ = require('lodash');

test('Test invalid operation type', (assert) => {
    assert.throws(() => {
        OGMNeoOperationBuilder.create().cypher('').type(2).build();
    }, /The type cannot be null or undefined and must be a string with either value  'READ' or 'WRITE'/);
    assert.end();
});

test('Test Invalid Operation', (assert) => {    
    OGMNeoOperationExecuter.execute({}).catch((error) => {
        assert.equal(error.message, 'The operation must be a instance of ogmneo.Operation');
        assert.end();
    }); 
});

//Testing OGMNeoOperationExecuter.write
test('Test write type on operation', (assert) => {  
    let create = OGMNeoNode.createOperation({name: 'Ayrton Senna', carNumber: 12 }, 'Person');
    OGMNeoOperationExecuter.write((transaction) => {
        return OGMNeoOperationExecuter.execute(create, transaction)
                               .then((created) => {
                                    assert.equal(created.name, 'Ayrton Senna');
                                    assert.equal(created.carNumber, 12);
                                    let id = created.id;
                                    created.carNumber = 1;
                                    let update = OGMNeoNode.updateOperation(created);
                                    return OGMNeoOperationExecuter.execute(update, transaction);
                               });
    }).then((result) => {
        assert.equal(result.name, 'Ayrton Senna');
        assert.equal(result.carNumber, 1);
        assert.end();
    });
});

test('Test batch write type operations', (assert) => {  
    let createUser1 = OGMNeoNode.createOperation({name: 'Ayrton Senna'}, 'Person');
    let createUser2 = OGMNeoNode.createOperation({name: 'Alain Prost'}, 'Person');

    OGMNeoOperationExecuter.batchWriteOperations([createUser1, createUser2]).then((result) => {
        let created1 = result[0];
        let created2 = result[1];
        assert.notEqual(created1.id, undefined);
        assert.equal(created1.name, 'Ayrton Senna');
        assert.notEqual(created2.id, undefined);
        assert.equal(created2.name, 'Alain Prost');
        assert.end();
    });
});

test('Test batch write type operations empty', (assert) => {  

    OGMNeoOperationExecuter.batchWriteOperations([]).then((results) => {
        assert.equal(results.length, 0);
        assert.end();
    });
});

test('Test batch read type operations', (assert) => {  
    let query1 = OGMNeoNode.findOneOperation(OGMNeoQuery.create('Person').where(OGMNeoWhere.create('name', { $eq: 'Ayrton Senna' })));
    let query2 = OGMNeoNode.findOneOperation(OGMNeoQuery.create('Person').where(OGMNeoWhere.create('name', { $eq: 'Alain Prost' })));

    OGMNeoOperationExecuter.batchReadOperations([query1, query2]).then((result) => {
        let found1 = result[0];
        let found2 = result[1];
        assert.notEqual(found1.id, undefined);
        assert.equal(found1.name, 'Ayrton Senna');
        assert.notEqual(found2.id, undefined);
        assert.equal(found2.name, 'Alain Prost');
        assert.end();
    });
});

test('Test batch read type operations empty', (assert) => {  

    OGMNeoOperationExecuter.batchReadOperations([]).then((results) => {
        assert.equal(results.length, 0);
        assert.end();
    });
});

test('Test validate batch operations', (assert) => {  
    let query1 = OGMNeoNode.findOneOperation(OGMNeoQuery.create('Person').where(OGMNeoWhere.create('name', { $eq: 'Ayrton Senna' })));

    assert.throws(() => {
        OGMNeoOperationExecuter._validateOperations('',OGMNeoOperation.READ);
    }, /The parameter operations must be an array/);

    assert.throws(() => {
        OGMNeoOperationExecuter._validateOperations([''],OGMNeoOperation.READ);
    }, /The parameter operations must be an array that contains only instances of ogmneo.Operation/);
    
    assert.throws(() => {
        OGMNeoOperationExecuter._validateOperations([query1], OGMNeoOperation.WRITE);
    }, /The parameter operations must be an array that contains only instances of ogmneo.Operation that have type : WRITE/);
    assert.end();
});
