require("dotenv").config();

const connect = (callback) => {
    // Instantiate the API connection object and assign this to the global scope 
    // in order to handling this from everywhere
    const APIConnection = require("./APIConnection");

    global.apiConnection = new APIConnection();

    // Connect with Salesforce org
    const username = process.env.USER_NAME;
    const password = process.env.PASSWORD + process.env.SECURITY_TOKEN;

    global.apiConnection.connect(username, password, callback);
};

const importCSVAccount = () => {
    const objectType = "Account";

    // Instantiate a parser to CSV file - The parser logic is decoupled of the business logic 
    // in order to make easier to change the parser logic to another input data structure
    const CSVObjectParser = require("./CSVObjectParser");
    const parser = new CSVObjectParser("assets/Account.csv", "./account/Account");

    // Parse the input from a CSV file to a JSON object formatted to JSforce API
    const objectArray = [];

    parser.parse((objectArray) => {
        console.log("Object array: ", objectArray);

        // Instantiate a processor that encapsulates the business logic
        const JobProcessor = require("./JobProcessor");
        const jobProcessor = new JobProcessor(objectType, "insert");

        // Execute the processor
        jobProcessor.executeNewBatch(objectArray);
    });
};

const executeAfterLogin = () => {
    importCSVAccount();
}

connect(executeAfterLogin);