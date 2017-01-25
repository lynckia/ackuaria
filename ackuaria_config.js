/*********************************************************
 AMQP CONFIGURATION
 AMQP server must be the same as Licode
**********************************************************/
exports.rabbit = {};
exports.rabbit.host = process.env.ACKUARIA_RABBIT_HOST || 'localhost';
exports.rabbit.port = process.env.ACKUARIA_RABBIT_PORT || 5672;

/*********************************************************
 Logger CONFIGURATION
**********************************************************/
exports.logger = {};
exports.logger.config_file = process.env.ACKUARIA_LOGGER_CONFIG_FILE || './log4js_configuration.json';

/*********************************************************
 DB CONFIGURATION.
 If not used, only real-time data will be provided
**********************************************************/
exports.ackuaria = {};
exports.ackuaria.useDB = process.env.ACKUARIA_DB_ENABLED || false;
exports.ackuaria.dataBaseURL = process.env.ACKUARIA_DB_URL || "localhost/ackuariadb";
exports.ackuaria.port = process.env.ACKUARIA_DB_PORT || 8888;

/*********************************************************
 ACKUARIA BEHAVIOR CONFIGURATION.
**********************************************************/
exports.ackuaria.call_time = process.env.ACKUARIA_NUVE_WAIT_BETWEEN_API_CALLS || 180;

/*********************************************************
 NUVE CONFIGURATION
**********************************************************/
exports.nuve = {};
exports.nuve.host = process.env.ACKUARIA_NUVE_HOST || 'http://localhost:3000/';
exports.nuve.superserviceID = process.env.ACKUARIA_NUVE_SUPERSERVICE_ID || '';
exports.nuve.superserviceKey = process.env.ACKUARIA_NUVE_SUPERSERVICE_KEY || '';
