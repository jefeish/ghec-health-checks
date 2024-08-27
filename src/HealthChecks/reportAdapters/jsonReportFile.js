/**
 * @description This module is responsible for writing JSON data to a file.
 * @param {*} jsonData
 * @param {*} outputFilePath
*/

const fs = require('fs');
const { jsonReport } = require('./reportConverter');
const Command = require('../common/command.js')
const { logger } = require('../../logger');

let instance = null

class jsonReportFile extends Command {

    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    }

    /**
     * Singleton pattern
     */
    static getInstance() {
        if (!instance) {
            instance = new jsonReportFile()
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
        logger.debug('jsonReportFile:config: ', config)

        const json = JSON.stringify(jsonReport(jsonData), null, 2);
        const outputFilePath = config.params.path;
        fs.writeFileSync(outputFilePath, json);

        return json;
    }
}

module.exports = jsonReportFile;