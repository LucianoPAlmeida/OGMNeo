'use strict';

const test = require('tape');
const OGMNeoOperation = require('../lib/ogmneo-operation');
const _ = require('lodash');

test('Test create operation', (assert) => {    
    let opertation = OGMNeoOperation.create()
                                    .cypher('CREATE (n:Label {property: {property}}) RETURN n')
                                    .object({property: 'value'})
                                    .type(OGMNeoOperation.READ)
                                    .then((result)=> {
                                        return { id: 1, property: 'value' }
                                    });
    
    assert.equal(opertation.cypher, 'CREATE (n:Label {property: {property}}) RETURN n');
    assert.equal(opertation.type, OGMNeoOperation.READ);
    assert.deepEqual(opertation.object, {property: 'value'} );
    assert.assert(_.isFunction(object.then), 'Then is not a function');

    assert.end();
});

test('Test operation convenience methods', (assert) => {    
    let opertation = OGMNeoOperation.create()
                                    .cypher('CREATE (n:Label {property: {property}}) RETURN n')
                                    .object({property: 'value'})
                                    .type(OGMNeoOperation.READ)
                                    .then((result)=> {
                                        return { id: 1, property: 'value' }
                                    });
    assert.assert(opertation.isRead, 'Then is not a read operation');
    assert.false(opertation.isWrite, 'Then is not a write operation');    
    assert.end();
});