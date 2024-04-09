/** 
 * @description Utility functions for converting JSON data to different formats.
 * @param {*} jsonData
 * @returns {string} The converted data in the desired format.
 */

function csvReport(jsonData) {
    let keys = Object.keys(jsonData[0]);
    let csv = keys.join(',') + '\n';

    jsonData.forEach(item => {
        console.log('item: ', item)
        let row = keys.map(key => {
            let value = item[key];
            // Check if the value is not empty and contains a comma
            if(value !== null && value !== undefined && value !== '' && value.includes(',') ) {
                // Wrap the value in double quotes and escape any existing double quotes
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
        csv += row + '\n';
    });

    return csv;
}


function markdownReport(jsonData) {
    let keys = Object.keys(jsonData[0]);
    let markdown = '| ' + keys.join(' | ') + ' |\n';
    markdown += '| ' + keys.map(() => '------').join(' | ') + ' |\n';

    jsonData.forEach(item => {
        let row = keys.map(key => item[key]).join(' | ');
        markdown += '| ' + row + ' |\n';
    });

    return markdown;
}



function jsonReport(jsonData) {
    return jsonData;
}


module.exports = { csvReport, markdownReport, jsonReport };