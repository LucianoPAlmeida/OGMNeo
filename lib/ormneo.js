'use strict';

const neo4j = require('neo4j-driver').v1;


class ORMNeo {

    static driver;

    static connect(user = 'neo4j', password = 'neo4j', host = 'localhost', port = '7474') {
        //Disconnecting
        process.on('exit', () => { ORMNeo.disconnet(); });

        driver = neo4j.driver(`bolt://${host}:${port}`, neo4j.auth.basic(user, pass));

        return new Promise((resolve, reject) => {
            driver.onCompleted = () => {
                resolve();
            };
            driver.onError = (error) => {
                reject(error);
            };
        });



    }

    static disconnet() {
        if (driver) {
            driver.close();
        }
    }
}

module.exports = ORMNeo;