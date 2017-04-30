'use strict';

let neo4j = require('neo4j-driver').v1;


var driver;
/**
    * @class ORMNeo
 */
class ORMNeo {

    /**
        * Creates a neo4j connection using bolt protocol. A successful connection creates a driver object 
        that can be accessed for ORMNeo.driver
        *
        * @static
        * @param {string} [user='neo4j'] - Neo4j user.
        * @param {string} [password='neo4j'] - Neo4j password.
        * @param {string} [host='localhost'] - Neo4j host.
    */
    static connect(user = 'neo4j', password = 'neo4j', host = 'localhost') {
        if (driver == null) {
            driver = neo4j.driver(`bolt://${host}`, neo4j.auth.basic(user, password));
            process.on('exit', () => { ORMNeo.disconnet(); });
        }
    }

    /**
        * Closes the current driver connection.
        *
        * @static
    */
    static disconnet() {
        if (driver) {
            driver.close();
            driver = undefined;
        }
    }

    /**
     * @static
     * @type {string}
    */
    static get driver() {
        return driver;
    }

    /**
        * Returns a driver NEW session.
        *
        * @static
        * @return {object} Neo4j driver session.
    */
    static session() {
        return (driver) ? driver.session() : undefined;
    }

    /**
     * @static
     * @type {boolean}
    */
    static get isConnected() {
        return (this.driver);
    }

}

module.exports = ORMNeo;