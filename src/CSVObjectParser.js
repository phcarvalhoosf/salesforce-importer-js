module.exports = class CSVObjectParser {

    constructor(filePath) {
        this.filePath = filePath;
    }

    parse(callback) {
        // Create readable stream for CSV file to upload
        const readStream = require('fs').createReadStream(this.filePath);
        const objectArray = [];
        let prototypeObject = null;

        readStream.on('data',
            (chunk) => {
                const fileLineArray = chunk.toString().split("\r\n");

                fileLineArray.forEach((fileLine) => {
                    const fieldArray = fileLine.split(",");

                    if (fieldArray.length > 0) {

                        if (!prototypeObject) {
                            prototypeObject = this.buildPrototypeObject(fieldArray);
                        } else {
                            objectArray.push(this.buildObject(prototypeObject, fieldArray));
                        }
                    }
                });
            })
            .on('end',
                () => callback(objectArray))
    }

    buildPrototypeObject(fieldNameArray) {
        const prototypeObject = {};

        fieldNameArray.forEach((fieldName, fieldNameIndex) => {
            prototypeObject[fieldNameIndex] = fieldName;
        });

        return prototypeObject;
    }

    buildObject(prototypeObject, fieldValueArray) {
        const object = {};
        const initialObject = { ...prototypeObject };

        fieldValueArray.forEach((fieldValue, fieldValueIndex) => {
            const fieldName = initialObject[fieldValueIndex];

            object[fieldName] = fieldValue;
        });

        return object;
    }
}