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