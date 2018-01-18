'use strict';

let neo4j = require('neo4j-driver').v1;
const _ = require('lodash');

var driver;
var logCypher = false;
/**
    * @class OGMNeo
 */
class OGMNeo {

    /**
        * Creates a neo4j connection using bolt protocol. A successful connection will create a driver object that can be accessed for OGMNeo.driver
        *
        * @static
        * @param {string} [user=neo4j] - Neo4j user.
        * @param {string} [password=neo4j] - Neo4j password.
        * @param {string} [host=localhost] - Neo4j host.
        * @param {string} [configuration=undefined] - Optional extra configuration for neo4j driver.

    */
    static connect(user = 'neo4j', password = 'neo4j', host = 'localhost', configuration = undefined) {
        if (driver == null) {
            driver = neo4j.driver(`bolt://${host}`, neo4j.auth.basic(user, password), configuration);
            process.on('exit', () => { this.disconnect(); });
        }
    }

    /**
        * Closes the current driver connection.
        *
        * @static
    */
    static disconnect() {
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
        * Returns a driver NEW session, always a new instance.
        *
        * @static
        * @return {object} Neo4j driver session.
    */
    static session() {
        let session = driver.session();
        if (session) {
            return session;
        } else {
            throw new Error('Could not get a neo4j session');
        }
    }

    /**
     * @static
     * @type {boolean}
    */
    static get isConnected() {
        return (this.driver != null);
    }

    /**
        * Returns property that defines if the generated cypher must be logged on the console.
        *
        * @static
        * @return {boolean} True if log cypher option is enabled.
    */
    static get logCypherEnabled() {
        return logCypher;
    }

    /**
        * Set the property that defines if the generated cypher must be logged on the console.
        *
        * @static
        * @param {boolean} - If cypher log is enabled or not.
    */
    static set logCypherEnabled(value) {
        if (_.isBoolean(value)) {
            logCypher = value;
        }
    }
}

module.exports = OGMNeo;