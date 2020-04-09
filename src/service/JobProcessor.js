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
        batch.on("queue", function (batch) {
            console.log("Batch queued! Batch: ", batch);
            // this.batchArray.push(batch);
        });
        batch.on("response", function (responseArray) {

            for (var counter = 0; counter < responseArray.length; counter++) {

                if (responseArray[counter].success)
                    console.log("Batch finished with success! Response: " + responseArray[counter]);
                else
                    console.log("Batch finished with error! Response: " + responseArray[counter]
                        + " | Message: " + responseArray[counter].errors.join(', '));
            }
        });
    }
}