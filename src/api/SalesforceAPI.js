const jsforce = require("jsforce");

module.exports = class SalesforceAPI {

    constructor() {
        this.connection = new jsforce.Connection();
    }

    connect(username, password, successCallback) {
        this.connection.login(username, password,
            (error, user) => {

                if (error) {
                    return console.error(error);
                }

                console.log("User connected! User: ", user);
                successCallback();
            });
    }
}