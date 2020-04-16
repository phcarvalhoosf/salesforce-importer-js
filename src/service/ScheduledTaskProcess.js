const CSVObjectParser = require("./CSVObjectParser");
const JobProcessor = require("./JobProcessor");

module.exports = class ScheduledTaskProcess {

    constructor() {

    }

    static importJob(scheduledTask) {
        const parser = new CSVObjectParser(scheduledTask.data.filePath);

        parser.parse((objectArray) => {
            const jobProcessor = new JobProcessor(scheduledTask.data.objectType, scheduledTask.data.operationType);

            jobProcessor.execute(objectArray);
        });
    }
}