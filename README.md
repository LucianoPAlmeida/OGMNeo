# OGMNeo

Abstract some trivial operations on neo4j driver for nodejs and make the use simpler. That's why we created OGMNeo.

[![npm version](https://badge.fury.io/js/ogmneo.svg)](https://badge.fury.io/js/ogmneo)
[![npm](https://img.shields.io/npm/dt/ogmneo.svg)](https://www.npmjs.com/package/ogmneo)
[![MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/LucianoPAlmeida/OGMNeo.svg)](https://travis-ci.org/LucianoPAlmeida/OGMNeo)
[![Codecov](https://img.shields.io/codecov/c/github/LucianoPAlmeida/OGMNeo.svg)](https://codecov.io/gh/LucianoPAlmeida/OGMNeo)

## Installation
You can find ogmneo in npm [here](https://www.npmjs.com/package/ogmneo) and install using the follow command
```sh
 npm install ogmneo
```
## Usage 

### Connecting to neo4j database

```js
const ogmneo = require('ogmneo');
ogmneo.Connection.connect('neo4j', 'databasepass', 'localhost');

```
   OGMNeo connects using the neo4j bolt protocol.
   
### Log generated cypher on console
You can see the generated cypher on your console by setting Connection.logCypherEnabled property true.

```js
const ogmneo = require('ogmneo');
ogmneo.Connection.logCypherEnabled = true;

```
   
### Create node example

```js
  const ogmneo = require('ogmneo');
  
  ogmneo.Node.create({ name: 'name', tes: 3 }, 'test')
  .then((node) => {
       //Created returned object => {id: 1, name: 'name', tes: 3}
  }).catch((error) => {
       //Handle error
  });
```

### Find Nodes 
  ```js
    const ogmneo = require('ogmneo');
    
    let query = ogmneo.Query.create('test')
                               .where(new ogmneo.Where('name', { $eq: 'name1' }));

    ogmneo.Node.find(query)
    .then((nodes) => {
        //Found nodes.
    }).catch((error) => {
        //Handle error.
    });
  ```
### Create relations
You can create relations between nodes.

```js
  const ogmneo = require('ogmneo');
  ogmneo.Relation.relate(node1.id, 'relatedto', node2.id, {property: 'a'})
  .then((rels) => {
        // Created relation node {id: 2, type: 'relatedto', property: 'a'}
  }).catch((error) => {
        //Handle error
  });
```

## Find Relations 
You can find the relation nodes.

```js
  const ogmneo = require('ogmneo');
  
  let query = ogmneo.RelationQuery.create('relatedto')
                                 .startNode(node1.id)
                                 .endNode(node2.id)
                                 .relationWhere(ogmneo.Where.create('property', { $eq: 'c' }))
                                 .ascOrderBy('property')
                                 .limit(3);
  ogmneo.Relation.find(query)
  .then((nodes) => {
        //Found relation nodes.
  }).catch((error) => {
        //Handle error.
  });
  
  //OR
  
  ogmneo.Relation.findPopulated(query)
  .then((nodes) => {
        //Found relation nodes with start and end nodes populated.
  }).catch((error) => {
        //Handle error.
  });
  
```

## Executing Cypher
You can executing cypher using the direct [Neo4j Driver](https://github.com/neo4j/neo4j-javascript-driver) session object. Or you can use OGMNeoCypher.

```js
  const ogmneo = require('ogmneo');

  ogmneo.Cypher.transactionalRead(cypherStatement)
  .then((result) => {
     console.log(result);
  }).catch((error) => {
     reject(error);
  });
  
  //OR
   ogmneo.Cypher.transactionalWrite(cypherStatement)
  .then((result) => {
     console.log(result);
  }).catch((error) => {
     reject(error);
  });
  
``` 
## Creating and dropping indexes
You can create and drop indexes in properties.

```js
  const ogmneo = require('ogmneo');
  //Creating
  ogmneo.Index.create('label', ['property'])
  .then((result) => {
     //Handle creation
  });
  //Dropping
  ogmneo.Index.drop('label', ['property'])
  .then((result) => {
     //Handle drop
  });
``` 

## Operation API

Almost every method on ogmneo.Node and ogmneo.Relation have now the Operation API, that instead of executing the function on database returning a promise, it creates an ogmneo.Operation object that can be executed after by the ogmneo.OperationExecuter. Exemple:
```js
  const ogmneo = require('ogmneo');
  
  let operation = ogmneo.Node.createOperation({ name: 'name', tes: 3 }, 'test');
  ogmneo.OperationExecuter.execute(operation)
  .then((node) => {
       //Created returned object => {id: 1, name: 'name', tes: 3}
  }).catch((error) => {
       //Handle error
  });
```

## Transactional API 
With the Operation API we can now execute as many READ or WRITE operations on the same transaction.
For exemple you want to create to nodes and then relate those two. But if the relation fails you want to rollback all the operations.
```js
  const ogmneo = require('ogmneo');
  
  let createDriver = ogmneo.Node.createOperation({name: 'Ayrton Senna', carNumber: 12 }, 'Driver');
  ogmneo.OperationExecuter.write((transaction) => {
        return ogmneo.OperationExecuter.execute(createDriver, transaction)
                               .then((driver) => {
                                    let createCar = ogmneo.Node.createOperation({name: 'MP4/4'}, 'Car');
                                    return ogmneo.OperationExecuter.execute(createCar, transaction).then((car) => {
                                       let relate = ogmneo.Relation.relateOperation(driver.id, 'DRIVES', car.id, {year: 1988});
                                       return ogmneo.OperationExecuter.execute(relate, transaction);
                                    });
                               });
    }).then((result) => {
       //Result here
    });
```
All of those operations will be executed on the same transaction and you can rollback anytime you want. The transaction is the [neo4j driver](https://github.com/neo4j/neo4j-javascript-driver) transaction object and you can see more about it on their docs [here](http://neo4j.com/docs/api/javascript-driver/current/class/src/v1/transaction.js~Transaction.html).

### Batching operation in a single transaction

You can also batch many operation READ or WRITE operations in a single transaction.

```js
    const ogmneo = require('ogmneo');
  
    let createUser1 = OGMNeoNode.createOperation({name: 'Ayrton Senna'}, 'Person');
    let createUser2 = OGMNeoNode.createOperation({name: 'Alain Prost'}, 'Person');

    ogmneo.OperationExecuter.batchWriteOperations([createUser1, createUser2]).then((result) => {
        let created1 = result[0];
        let created2 = result[1];
        console.log(created1.name); // 'Ayrton Senna'
        console.log(created2.name); // 'Alain Prost'
    });
```
If one of those fails, all other operations on the transaction will be rolledback automatically.

## Documentation

  See the full **API** documentation at [docs](http://ogmneo-docs.getforge.io/). All docs was generated by [JSDoc](https://github.com/jsdoc3/jsdoc).
  
## Exemple 
  
  See a demo sample on the [ogmneo-demo repository](https://github.com/LucianoPAlmeida/ogmneo-demo).
  
## Tests

  Most of this library functions are covered by unit tests. With 90% of coverage.
  See the code coverage on [codecov.io](https://codecov.io/gh/LucianoPAlmeida/OGMNeo).

## Licence

OGMNeo is released under the [MIT License](https://opensource.org/licenses/MIT).
