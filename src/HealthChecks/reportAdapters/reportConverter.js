/** 
 * @description Utility functions for converting JSON data to different formats.
 * @param {*} jsonData
 * @returns {string} The converted data in the desired format.
 */

/**
 * @description Converts JSON data to a CSV format.
 * @param {*} jsonData 
 * @returns 
 */
// function csvReport(jsonData) {
//     let keys = Object.keys(jsonData[0]);
//     let csv = keys.join(',') + '\n';

//     jsonData.forEach(item => {
//         console.log('item: ', item)
//         let row = keys.map(key => {
//             let value = item[key];
//             // Check if the value is not empty and contains a comma
//             if(value !== null && value !== undefined && value !== '' && value.includes(',') ) {
//                 // Wrap the value in double quotes and escape any existing double quotes
//                 value = `"${value.replace(/"/g, '""')}"`;
//             }
//             return value;
//         }).join(',');
//         csv += row + '\n';
//     });
//     return csv;
// }

function csvReport(jsonData) {
    let keys = ['Index'].concat(Object.keys(jsonData[0]));
    let csv = keys.join(',') + '\n';

    jsonData.forEach((item, index) => {
        let row = [index + 1].concat(keys.slice(1).map(key => item[key])).join(',');
        csv += row + '\n';
    });

    return csv;
}

/**
 * @description Converts JSON data to a markdown table.
 * @param {*} jsonData 
 * @returns 
 */
function markdownReport(jsonData) {
    let keys = ['#'].concat(Object.keys(jsonData[0]));
    let markdown = '| ' + keys.join(' | ') + ' |\n';
    markdown += '| ' + keys.map(() => '------').join(' | ') + ' |\n';

    jsonData.forEach((item, index) => {
        let row = [index + 1].concat(keys.slice(1).map(key => item[key])).join(' | ');
        markdown += '| ' + row + ' |\n';
    });

    return markdown;
}


function jsonReport(jsonData) {
    return jsonData;
}


module.exports = { csvReport, markdownReport, jsonReport };