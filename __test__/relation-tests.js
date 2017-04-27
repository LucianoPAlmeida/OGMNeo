'use strict';

const test = require('blue-tape');
const ORMNeo = require('../lib/ormneo');
const ORMNeoNode = require('../lib/ormneo-node');
const ORMQueryBuilder = require('../lib/ormneo-query');
const _ = require('lodash');

ORMNeo.connect('neo4j', 'databasepass', 'localhost');