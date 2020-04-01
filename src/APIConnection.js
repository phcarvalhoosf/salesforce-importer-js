module.exports = class APIConnection {

    constructor() {
        const jsforce = require("jsforce");

        this.connection = new jsforce.Connection();
    }

    connect = (username, password, callback) => this.connection.login(username, password,
        (error, user) => {

            if (error) {
                return console.error(error);
            }

            console.log("User connected! User: ", user);
            callback();
        });

    getConnection() {

        if (!this.connection) {
            throw new Error('The APIConnection object was not created!');
        }

        return this.connection;
    }
}