import React from 'react';
import {
  Octicon,
  Box
} from '@primer/react'

import {
  CheckCircleFillIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'

const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%'
};

const colmnStyle = {
  paddingLeft: '18px',
  textAlign: 'left',
  maxWidth: '200px'
};

function ReportsList({ data }) {
  try {
    return (
      <div>
        {data.map((report, index) => (
          <div key={index}>
            <h3>{report.report}</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5, border: '1px solid lightgrey', background: '#dddddd', padding: '20px', height: '50px' }}>
                  <th style={{ paddingLeft: 20, paddingRight: 20 }}>Status</th>
                  <th style={colmnStyle}>Name</th>
                  <th style={colmnStyle}>Description</th>
                </tr>
              </thead>
              <tbody>
                {report.checks.map((check, checkIndex) => (
                  <tr key={checkIndex} style={{ borderBottom: '1px solid lightgrey', height: '50px' }}>
                    <td style={{ width: '1%', paddingRight: 20 }}>
                      {check.status === 'pass' ? (
                        <Octicon icon={CheckCircleFillIcon} size={16} sx={{ color: 'green' }} />
                      ) : (
                        <Octicon icon={XCircleFillIcon} size={16} sx={{ color: 'red' }} />
                      )}
                    </td>
                    <td style={colmnStyle}>{check.name}</td>
                    <td style={colmnStyle}>{check.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderColor: 'lightgrey', p: 2, borderRadius: 8, background: '#ffaaaa', marginBottom: 20, paddingLeft: 20, verticalAlign: 'middle' }}>
        <Octicon color="red" icon={XCircleFillIcon} size={16} sx={{ mr: 2, paddingLeft: 20, paddingRight: 20 }} />
        Error Rendering Report List: {error.message}
      </Box>
    );
  }
}

export default ReportsList;
