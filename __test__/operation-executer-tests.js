'use strict';

const test = require('tape');
const { OGMNeoOperation, OGMNeoOperationBuilder } = require('../lib/ogmneo-operation');
const OGMNeoOperationExecuter = require('../lib/ogmneo-operation-executer');
const OGMNeoNode = require('../lib/ogmneo-node');
const OGMNeo = require('../lib/ogmneo');

const _ = require('lodash');

test('Test Invalid Operation', (assert) => {    
    OGMNeoOperationExecuter.execute({}).catch((error) => {
        assert.equal(error.message, 'The operation must be a instance of ogmneo.Operation');
        assert.end();
    }); 
});

//Testing OGMNeoOperationExecuter.write
test('Test invalid write type on operation', (assert) => {    
    OGMNeoOperationExecuter.write(null, (transaction) => {
        //Nothing to test
    }).catch((error) => {
        assert.equal(error.message, 'You must provide a session object. See ogmneo.Connection.session()');
        assert.end();
    });
});

//Testing OGMNeoOperationExecuter.read
test('Test invalid read type on operation', (assert) => {    
    OGMNeoOperationExecuter.read(null, (transaction) => {
        //Nothing to test
    }).catch((error) => {
        assert.equal(error.message, 'You must provide a session object. See ogmneo.Connection.session()');
        assert.end();
    });
});

//Testing OGMNeoOperationExecuter.read
test('Test write type on operation', (assert) => {  
    let create = OGMNeoNode.createOperation({name: 'Ayrton Senna', carNumber: 12 }, 'Person');
    let session = OGMNeo.session();  
    OGMNeoOperationExecuter.write(session, (transaction) => {
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
        session.close();
        assert.equal(result.name, 'Ayrton Senna');
        assert.equal(result.carNumber, 1);
        assert.end();
    });
});

    // let createUser1 = OGMNeoNode.createOperation({name: 'Ayrton Senna'}, 'Person');
    // let createUser2 = OGMNeoNode.createOperation({name: 'Alain Prost'}, 'Person');
    // OGMNeo.session().readTransaction((transaction) => {
    //     let r = transaction.run('MATCH (n) RETURN n').then((result)=> {
    //         console.log('result => ', result);
    //     });
    //     console.log(r);
    // });
    // OGMNeoOperationExecuter.executeWriteOperations([createUser1, createUser2]).then((result) => {
    //     let created1 = result[0];
    //     let created2 = result[1];
    //     assert.notEqual(created1.id, undefined);
    //     assert.equal(created1.name, 'Ayrton Senna');
    //     assert.notEqual(created2.id, undefined);
    //     assert.equal(created2.name, 'Alain Prost');
    //     assert.end();
    // });