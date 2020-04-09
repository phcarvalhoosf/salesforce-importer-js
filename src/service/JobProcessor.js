module.exports = class JobProcessor {

    constructor(objectType, operationType) {
        this.batchArray = [];
        this.objectType = objectType;
        this.operationType = operationType;
        this.job = global.salesforceAPI.connection.bulk.createJob(objectType, operationType);
    }

    executeNewBatch(objectArray) {
        const batch = this.job.createBatch();

        batch.execute(objectArray);
        batch.on("queue", (batch) => {
            global.logger.info("Batch queued! Batch id: ", batch.id, " | Job id: ", batch.jobId);
            // this.batchArray.push(batch);
        });
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
}