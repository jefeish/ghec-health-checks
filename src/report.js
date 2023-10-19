/**
 * @description Class for creating reports
 * 
 */

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

        // Get the header
        const header = Object.keys(this.data[0]).join(',')

        // Get the rows
        const rows = this.data.map(obj => Object.values(obj).join(','))

        // Combine header and rows
        const csv = [header, ...rows].join('\n')

        return csv
    }

    /**
     * @description Transform the JSON into a markdown table
     * @returns 
     */
    markdown() {
        // Get the header
        const header = Object.keys(this.data[0])
        const headerRow = header.join(' | ').toUpperCase()

        // Create separator row
        const separatorRow = header.map(() => '---').join(' | ')

        // Get the rows
        const rows = this.data.map(obj => Object.values(obj).join(' | '))

        // Combine header, separator and rows
        const markdownTable = [headerRow, separatorRow, ...rows].join('\n')

        return markdownTable
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