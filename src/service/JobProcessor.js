module.exports = class JobProcessor {

    constructor(objectType, operationType) {
        this.objectType = objectType;
        this.operationType = operationType;
    }

    execute(objectArray, callback) {
        this.job = global.salesforceAPI.connection.bulk.createJob(this.objectType, this.operationType);
        this.job.info(
            (error, jobInfo) => {
                global.logger.info("Start job execution! Job id: ", jobInfo.id, " | Object type: ", jobInfo.object, " | Operation type: ", jobInfo.operation, " | Status: ", jobInfo.state, " | Object array length: ", objectArray.length);

                const chunk = 10000;

                for (let startIndex = 0; startIndex < objectArray.length; startIndex += chunk) {
                    const partialObjectArray = objectArray.slice(startIndex, startIndex + chunk);

                    global.logger.info("Start batch execution! Job id: ", jobInfo.id, " | Object array range: [", 1 + startIndex, ",", startIndex + partialObjectArray.length, "]");
                    this._executeNewBatch(partialObjectArray, callback);
                }
            });
    }

    _executeNewBatch(objectArray, callback) {
        const batch = this.job.createBatch();

        batch.execute(objectArray, callback);
        batch.on("queue", (batch) => {
            global.logger.info("Batch queued! Job id: ", batch.jobId, " | Batch id: ", batch.id);
            // batch.poll(15 * 1000, 60 * 1000);
        });
        batch.on("error", (batchInfo) => global.logger.error("Batch error! Batch info: ", batchInfo));
        batch.on("response", (responseArray) => {

            for (var counter = 0; counter < responseArray.length; counter++) {

                if (responseArray[counter].success)
                    global.logger.info("Batch finished with success! Response: " + responseArray[counter]);
                else
                    global.logger.info("Batch finished with error! Response: " + responseArray[counter]
                        + " | Message: " + responseArray[counter].errors.join(', '));
            }
        });
    }

    checkInfo() {
        this.job.check(
            (error, jobInfo) => global.logger.info("Check job! Id: ", jobInfo.id, " | Object type: ", jobInfo.object, " | Operation type: ", jobInfo.operation, " | Status: ", jobInfo.state));
        this.job.list(
            (batchInfoArray) => batchInfoArray.forEach(
                (batchInfo) => global.logger.info("Check batch! Id: ", batchInfo.id, " | State: ", batchInfo.state, " | State message: ", batchInfo.stateMessage)
            ));
    }
}