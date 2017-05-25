module.exports = {
    Connection: require('ogmneo'),
    OGMNeoNode: require('./lib/ogmneo-node'),
    OGMNeoQuery: require('./lib/ogmneo-query'),
    OGMNeoRelation: require('./lib/ogmneo-relation'),
    OGMNeoCypher: require('./lib/ogmneo-cypher'),
    OGMNeoIndex: require('./lib/ogmneo-index'),
    OGMNeoWhere: require('./lib/ogmneo-where')
};
