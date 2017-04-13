'use strict';

const chai = require('chai');
const chaiPromise = require('chai-as-promised');
chai.use(chaiPromise);
const should = chai.should();
// const assert = chai.assert;
// const expect = chai.expect;
const ORMneo = require('../lib/ormneo');

describe('Connection Test', () => {

    it('SHOULD Connect to neo4j database', (done) => {
        ORMneo.connect('neo4j', 'databasepass').should.be.fulfilled.and.notify(done);

    });

    it('SHOULD NOT Connect to neo4j database', (done) => {
        let promise = ORMneo.connect('neo4j', 'wrongpass').should.be.rejected.and.notify(done);
    });
});