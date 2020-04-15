const CSVObjectParser = require("./CSVObjectParser");
const JobProcessor = require("./JobProcessor");

module.exports = class ScheduledTaskProcess {

    constructor() {

    }

    static importJob(scheduledTask) {
        const parser = new CSVObjectParser(scheduledTask.data.filePath);

        parser.parse((objectArray) => {
            const jobProcessor = new JobProcessor(scheduledTask.data.objectType, scheduledTask.data.operationType);

            jobProcessor.executeNewBatch(objectArray,
                (recordResultArray, batchResultInfoArray) => {
                    global.logger.info("Batch executed!");
                    batchResultInfoArray.forEach(
                        (batchResultInfo) => global.logger.info("Check batch result! Id: ", batchResultInfo.id, " | Batch id: ", batchResultInfo.batchId, " | Job id: ", batchResultInfo.jobId)
                    );
                    recordResultArray.forEach(
                        (recordResult) => global.logger.info("Check record result! Id: ", batchInfo.id, " | Success: ", batchInfo.success, " | Errors: ", errors.join(', '))
                    );
                });
        });
    }
}