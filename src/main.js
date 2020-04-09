require("dotenv").config();
const SalesforceAPI = require("./api/SalesforceAPI");
const DatabaseAPI = require("./api/DatabaseAPI");
const ScheduledTaskProcessor = require("./service/ScheduledTaskProcessor");
const log4js = require("log4js");

const configureLogger = () => {
    log4js.configure({
        appenders: {
            stdout: { type: "stdout" },
            file: { type: "file", filename: "./logs/log.log" }
        },
        categories: {
            default: { appenders: ["stdout", "file"], level: "info" }
        }
    });

    global.logger = log4js.getLogger();
    global.logger.level = "info";
}

const connectToSalesforce = (successCallback) => {
    const username = process.env.USER_NAME;
    const password = process.env.PASSWORD + process.env.SECURITY_TOKEN;

    global.salesforceAPI = new SalesforceAPI();
    global.salesforceAPI.connect(username, password, successCallback);
};

const loadDatabase = () => {
    global.databaseAPI = new DatabaseAPI();
    global.databaseAPI.loadData();
}

const processScheduledTask = (scheduledTask) => {
    const scheduledTaskProcessor = new ScheduledTaskProcessor(scheduledTask);

    scheduledTaskProcessor.execute();
}

const processScheduledTaskArray = () => {
    global.databaseAPI.scheduledTask.find({},
        (error, scheduledTaskArray) => {

            if (error)
                global.logger.error("Error to find scheduled task array! Error: ", error);
            else
                scheduledTaskArray.forEach((scheduledTask) => processScheduledTask(scheduledTask));
        });
}

const connectSuccessCallback = () => {
    loadDatabase();
    processScheduledTaskArray();
}

configureLogger();
connectToSalesforce(connectSuccessCallback);