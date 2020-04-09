const Datastore = require("nedb");

module.exports = class DatabaseAPI {

    constructor() {

    }

    loadData() {
        this.scheduledTask = new Datastore({
            filename: "database/scheduled-task.db",
            autoload: true
        });
    }
}