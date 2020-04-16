const moment = require('moment');
const fs = require("fs");

module.exports = class JobProcessor {

    constructor(objectType, operationType) {
        this.objectType = objectType;
        this.operationType = operationType;
    }

    execute(objectArray, responseCallback) {
        this.job = global.salesforceAPI.connection.bulk.createJob(this.objectType, this.operationType);
        this.job.info(
            (error, jobInfo) => {
                global.logger.info("Start job execution! Job id: ", jobInfo.id, " | Object type: ", jobInfo.object, " | Operation type: ", jobInfo.operation, " | Status: ", jobInfo.state, " | Object array length: ", objectArray.length);

                const chunk = 10000;

                for (let startIndex = 0; startIndex < objectArray.length; startIndex += chunk) {
                    const partialObjectArray = objectArray.slice(startIndex, startIndex + chunk);

                    global.logger.info("Start batch execution! Job id: ", jobInfo.id, " | Object array range: [", 1 + startIndex, ",", startIndex + partialObjectArray.length, "]");
                    this._executeNewBatch(partialObjectArray, responseCallback);
                }
            });
    }

    _executeNewBatch(objectArray, responseCallback) {
        const batch = this.job.createBatch();
        let batchFromServer = null;

        batch.execute(objectArray, responseCallback);
        batch.on("queue",
            (batch) => {
                global.logger.info("Fire batch queue event! Job id: ", batch.jobId, " | Batch id: ", batch.id);
                batchFromServer = this.job.batch(batch.id);
                batchFromServer.poll(15 * 1000, 60 * 1000);
            });
        batch.on("error",
            (batchInfo) => global.logger.error("Fire batch error event! Batch info: ", batchInfo));
        batch.on("response",
            (batchResultInfoArray) => {
                global.logger.info("Fire batch response event! Job id: ", batchFromServer.jobId, " | Batch id: ", batchFromServer.id);

                const baseFileName = moment().format("YYYY-MM-DD h.mm.ss A")/*  + " job-id-" + batchFromServer.jobId + " batch-id-" + batchFromServer.id */ + ".csv";

                this._generateSuccessFile(batchFromServer, batchResultInfoArray, baseFileName);
                this._generateErrorFile(batchFromServer, batchResultInfoArray, baseFileName);
            });
    }

    checkInfo() {
        this.job.check(
            (error, jobInfo) => global.logger.info("Check job info! Id: ", jobInfo.id, " | Object type: ", jobInfo.object, " | Operation type: ", jobInfo.operation, " | Status: ", jobInfo.state));
        this.job.list(
            (batchInfoArray) => batchInfoArray.forEach(
                (batchInfo) => global.logger.info("Check batch info! Id: ", batchInfo.id, " | State: ", batchInfo.state, " | State message: ", batchInfo.stateMessage)
            ));
    }

    _generateSuccessFile(batch, batchResultInfoArray, baseFileName) {
        const fileName = this.objectType + " (SUCCESS) " + baseFileName;
        const filePath = "assets/results/" + fileName;
        const writeStream = fs.createWriteStream(filePath, { flags: 'wx' });

        global.logger.info("Generate success file! Job id: ", batch.jobId, " | Batch id: ", batch.id, " | File path: ", filePath);
        writeStream.on("open",
            () => {
                writeStream.write("id" + "\r\n");
                batchResultInfoArray.forEach(
                    (batchResultInfo) => {

                        if (batchResultInfo.success) {
                            global.logger.info("Object processed with success! Object id: " + batchResultInfo.id);
                            writeStream.write(batchResultInfo.id + "\r\n");
                        }
                    }
                );
            });
        writeStream.on('error',
            (error) => global.logger.error("Fire response write stream error event! Error: ", error));
    }

    _generateErrorFile(batch, batchResultInfoArray, baseFileName) {
        const fileName = this.objectType + " (ERROR) " + baseFileName;
        const filePath = "assets/results/" + fileName;
        const writeStream = fs.createWriteStream(filePath, { flags: 'wx' });

        global.logger.info("Generate error file! Job id: ", batch.jobId, " | Batch id: ", batch.id, " | File path: ", filePath);
        writeStream.on("open",
            () => {
                writeStream.write("error" + "\r\n");
                batchResultInfoArray.forEach(
                    (batchResultInfo) => {

                        if (!batchResultInfo.success) {
                            global.logger.info("Object processed with error! Error: " + batchResultInfo.errors.join(', '));
                            writeStream.write(batchResultInfo.errors.join(', ') + "\r\n");
                        }
                    }
                );
            });
        writeStream.on('error',
            (error) => global.logger.error("Fire response write stream error event! Error: ", error));
    }
}