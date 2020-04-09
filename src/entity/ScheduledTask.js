const moment = require('moment');

module.exports = class ScheduledTask {

    constructor(type, cronExpression, data) {
        const creationDate = moment();

        this.id = creationDate.unix();
        this.type = type;
        this.cronExpression = cronExpression;
        this.data = data;
        this.creationDate = creationDate.format();
    }

    save() {
        global.databaseAPI.scheduledTask.insert(this);
    }
}