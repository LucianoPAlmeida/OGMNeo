'use strict';

let neo4j = require('neo4j-driver').v1;


var driver;

class ORMNeo {


    static connect(user = 'neo4j', password = 'neo4j', host = 'localhost') {

        driver = neo4j.driver(`bolt://${host}`, neo4j.auth.basic(user, password));

        process.on('exit', () => { ORMNeo.disconnet(); });
        
    }

    static disconnet() {
        if (driver) {
            driver.close();
        }
    }
}

module.exports = ORMNeo;