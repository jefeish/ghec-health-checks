/**
 * @description This module is responsible for converting JSON data to CSV format and writing it to a file.
 * @param {*} jsonData
 * @param {*} outputFilePath
 */

const fs = require('fs');
const { csvReport } = require('./reportConverter');
const Command = require('../common/command.js')
let instance = null

class csvReportFile extends Command {

    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    }

    /**
     * Singleton pattern
     */
    static getInstance() {
        if (!instance) {
            instance = new csvReportFile()
        }

        return instance
    }

    /**
     * @description Main entry point for invocation from client
     * 
     * @param {*} context 
     * @param {*} data 
     */
    async execute(context, config, jsonData) {
        console.log('csvReportFile:config: ', config)

        const csv = csvReport(jsonData);
        const outputFilePath = config.params.path;
        fs.writeFileSync(outputFilePath, csv);

        return csv;
    }
}

module.exports = csvReportFile;