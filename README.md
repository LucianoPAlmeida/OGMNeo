# ORMNeo

Abstract some trivial operations on neo4j driver for nodejs and make the use simpler. That's why we created ORMNeo.

## Instalation
```sh
 npm install ormneo
```
## Usage 

### Connecting to neo4j database

```js
ORMNeo.connect('user', 'pass', 'localhost');
```
   ORMNeo connects using the neo4j bolt protocol.

### Create node example

```js
  ORMNeoNode.create({ name: 'name', tes: 3 }, 'test').then((node) => {
       //Created returned object => {id: 1, name: 'name', tes: 3}
  }).catch((error) => {
       //Handle error
  });
```

### Find Nodes 
  ```js
    let query = ORMQueryBuilder.query('test').and('tes', {$eq: 3});
    ORMNeoNode.execute(query).then((nodes) => {
        //Found nodes.
    }).catch((error) => {
        //Handle error.
    });
  ```
### Create relations
```js
  ORMNeoRelation.relate(node1.id, node2.id, 'relatedto', {property: 'a'}).then((rels) => {
        // Created relation node {id: 2, type: 'relatedto', property: 'a'}
  }).catch((error) => {
        //Handle error
  });
```

## Find Relations 

```js
  ORMNeoRelation.find(node1.id, node2.id, 'relatedto',ORMQueryBuilder.query().and('property', {$eq: 'c'})).then((nodes) => {
        //Found relation nodes.
  }).catch((error) => {
        //Handle error.
  });
```

## Executing Cypher
You can executing cypher using the direct [Neo4j Driver](https://github.com/neo4j/neo4j-javascript-driver) session object.

```js
  let session = ORMNeo.session();
  session
  .run('CREATE (p:Person {name : {name} }) RETURN p', {name: 'Derp'})
  .then(function (result) {
    result.records.forEach(function (record) {
      console.log(record);
    });
    session.close();
  })
  .catch(function (error) {
    console.log(error);
  });
``` 

## Documentation

  See the full **API** documentation at [docs](docs). All docs was generated by [JSDoc](https://github.com/jsdoc3/jsdoc).

## Licence

ORMNeo is released under the [MIT License](https://opensource.org/licenses/MIT).
