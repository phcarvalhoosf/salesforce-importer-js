const ts = require("fs");
const eventStream = require('event-stream');

module.exports = class CSVObjectParser {

    constructor(filePath) {
        this.filePath = filePath;
    }

    parse(endCallback) {
        global.logger.info("Start file parse! File path: ", this.filePath);

        const readStream = ts.createReadStream(this.filePath);
        const objectArray = [];
        let templateObject = null;

        readStream.pipe(eventStream.split())
            .pipe(eventStream.mapSync(
                (fileLine) => {
                    global.logger.info("Read stream line! Line: ", fileLine);

                    const fieldArray = fileLine.split(",");

                    if (fieldArray.length > 0) {

                        if (!templateObject)
                            templateObject = this._buildTemplateObject(fieldArray);
                        else
                            objectArray.push(this._buildObject(templateObject, fieldArray));
                    }
                })
                .on('error',
                    (error) => global.logger.error("Read stream error! Error: ", error))
                .on('end',
                    () => {
                        global.logger.info("Read stream end!");
                        endCallback(objectArray);
                    })
            );
    }

    _buildTemplateObject(fieldNameArray) {
        const templateObject = {};

        fieldNameArray.forEach((fieldName, fieldNameIndex) => {
            templateObject[fieldNameIndex] = fieldName;
        });

        return templateObject;
    }

    _buildObject(templateObject, fieldValueArray) {
        const object = {};

        fieldValueArray.forEach((fieldValue, fieldValueIndex) => {
            const fieldName = templateObject[fieldValueIndex];

            object[fieldName] = fieldValue;
        });

        global.logger.info("Object built! Object: ", object);

        return object;
    }
}