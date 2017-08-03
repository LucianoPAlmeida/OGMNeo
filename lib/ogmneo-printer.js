'use strict';
const ogmneo = require('./ogmneo');

class Printer {
    
    //
    static printCypherIfEnabled(cypher) {
        if(ogmneo.logCypherEnabled == true) {
            console.info(cypher);
        }
    }
}

module.exports = Printer;