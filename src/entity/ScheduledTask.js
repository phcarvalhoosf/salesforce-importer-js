module.exports = class ScheduledTask {

    constructor(type, cronExpression, data) {
        this.type = type;
        this.cronExpression = cronExpression;
        this.data = data;
    }

    save() {
        global.databaseAPI.scheduledTask.insert(this);
    }
}