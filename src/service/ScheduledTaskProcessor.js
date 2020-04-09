const ScheduledTaskProcess = require("./ScheduledTaskProcess");
const cron = require("node-cron");

module.exports = class ScheduledTaskProcessor {

    constructor(scheduledTask) {
        const type = scheduledTask.type;
        const process = ScheduledTaskProcess[type];

        if (!process)
            throw new Error("Schedule task process not found! Schedule task type: " + type);

        this.scheduledTask = scheduledTask;
        this.process = process;
    }

    execute() {
        cron.schedule(this.scheduledTask.cronExpression,
            () => {
                console.log("Scheduled task started! Schedule Task: ", this.scheduledTask);
                this.process(this.scheduledTask);
            });
    }
}