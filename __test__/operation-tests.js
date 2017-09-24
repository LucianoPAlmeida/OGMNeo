'use strict';

const test = require('tape');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('../lib/ogmneo-operation');
const _ = require('lodash');

test('Test create operation', (assert) => {    
    let operation = OGMNeoOperationBuilder.create()
                                    .cypher('CREATE (n:Label {property: {property}}) RETURN n')
                                    .object({property: 'value'})
                                    .type(OGMNeoOperation.READ)
                                    .then((result) => {
                                        return { id: 1, property: 'value' }
                                    }).build();
    
    assert.equal(operation.cypher, 'CREATE (n:Label {property: {property}}) RETURN n');
    assert.equal(operation.type, OGMNeoOperation.READ);
    assert.deepEqual(operation.object, {property: 'value'} );
    assert.true(_.isFunction(operation.then), 'Then is not a function');

    assert.end();
});

test('Test operation convenience methods', (assert) => {    
    let operation = OGMNeoOperationBuilder.create()
                                    .cypher('CREATE (n:Label {property: {property}}) RETURN n')
                                    .object({property: 'value'})
                                    .type(OGMNeoOperation.READ)
                                    .then((result)=> {
                                        return { id: 1, property: 'value' }
                                    }).build();
    assert.true(operation.isReadType, 'Then is not a read operation');
    assert.false(operation.isWriteType, 'Then is not a write operation');    
    assert.end();
});