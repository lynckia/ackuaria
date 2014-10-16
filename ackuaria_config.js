var config = {}

/*********************************************************
 COMMON CONFIGURATION
 It's used by Ackuaria
**********************************************************/
config.rabbit = {};
config.rabbit.host = 'localhost'; //default value: 'localhost'
config.rabbit.port = 5672; //default value: 5672
config.logger = {};
config.logger.config_file = './log4js_configuration.json'; //default value: "../log4js_configuration.json"


/*********************************************************
 ACKUARIA CONFIGURATION
**********************************************************/

config.ackuaria = {};
config.ackuaria.useDB = true; // default value: true
config.ackuaria.dataBaseURL = "localhost/ackuariadb"; // default value: 'localhost/ackuariadb'

/***** END *****/
// Following lines are always needed.
var module = module || {};
module.exports = config;