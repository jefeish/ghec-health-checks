/**
 * @description Class for creating reports
 * 
 */

const reportConverter = require('./healthChecks/reportAdapters/reportConverter.js')

class Report {
    constructor() {
        this.data = [];
    }

    /**
     * @description Add an item to the report
     * @param {*} item 
     */
    add(item) {
        this.data.push(item)
    }

    /**
     * @description Transform the JSON into a CSV string
     * @returns 
     */
    csv() {
        // transform the JSON into a CSV string
        return reportConverter.csvReport(this.data)
    }

    /**
     * @description Transform the JSON into a markdown table
     * @returns 
     */
    markdown() {
        console.log('this.data:'+ this.data)
        console.log('Report.markdown():'+ reportConverter.markdownReport(this.data))
        // transform the JSON into a markdown table
        return reportConverter.markdownReport(this.data)
    }

    /**
     * @description return the JSON as a string
     * @returns 
     */
    json() {
        return JSON.stringify(this.data)
    }
}

module.exports = Report;