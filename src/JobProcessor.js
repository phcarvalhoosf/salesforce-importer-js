module.exports = class JobProcessor {

    constructor(objectType, operationType) {
        const connection = global.apiConnection.getConnection();

        this.objectType = objectType;
        this.operationType = operationType;
        this.batchArray = [];
        this.job = connection.bulk.createJob(objectType, operationType);
    }

    executeNewBatch(objectArray) {
        const batch = this.job.createBatch();

        batch.execute(objectArray);
        // fired when batch request is queued in server.
        batch.on("queue", function (batch) {
            console.log("EVENT | BATCH QUEUED: ", batch);
            this.batchArray.push(batch);
        });
        // fired when batch is finished and result retrieved
        batch.on("response", function (rets) {

            for (var i = 0; i < rets.length; i++) {

                if (rets[i].success) {
                    console.log("EVENT | BATCH FINISHED - SUCCESS: " + rets[i]);
                } else {
                    console.log("EVENT | BATCH FINISHED - FAIL: " + rets[i] + " | MESSAGE: " + rets[i].errors.join(', '));
                }
            }
        });
    }

    checkBatchStatus() {
        return conn.bulk.job(jobId).batch(batchId).check((err, results) => {
            // Note: all returned data is of type String from parsing the XML response from Salesforce, 
            // but the following attributes are actually numbers: apexProcessingTime, apiActiveProcessingTime, numberRecordsFailed, numberRecordsProcessed, totalProcessingTime

            if (err) {
                return console.error(err);
            }

            console.log('results', results);
        });
    }
}