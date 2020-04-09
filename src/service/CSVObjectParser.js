const ts = require("fs");

module.exports = class CSVObjectParser {

    constructor(filePath) {
        this.filePath = filePath;
    }

    parse(endCallback) {
        const readStream = ts.createReadStream(this.filePath);
        const objectArray = [];
        let templateObject = null;

        readStream.on('data',
            (chunk) => {
                const fileLineArray = chunk.toString().split("\r\n");

                fileLineArray.forEach((fileLine) => {
                    const fieldArray = fileLine.split(",");

                    if (fieldArray.length > 0) {

                        if (!templateObject) {
                            templateObject = this._buildTemplateObject(fieldArray);
                        } else {
                            objectArray.push(this._buildObject(templateObject, fieldArray));
                        }
                    }
                });
            })
            .on('end',
                () => endCallback(objectArray))
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

        return object;
    }
}