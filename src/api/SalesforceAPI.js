const jsforce = require("jsforce");
const log4js = require("log4js");

module.exports = class SalesforceAPI {

    constructor() {
        this.connection = new jsforce.Connection();
    }

    connect(username, password, successCallback) {
        this.connection.login(username, password,
            (error, user) => {

                if (error)
                    return global.logger.error("Error to connect to Salesforce! Error: ", error);

                global.logger.info("User connected! User id: ", user.id);
                successCallback();
            });
    }
}