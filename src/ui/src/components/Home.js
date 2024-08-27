import React, { useState, useEffect } from 'react'

import {
  SyncIcon,
  CheckCircleFillIcon,
  XCircleFillIcon,
  PencilIcon,
  CheckIcon
} from '@primer/octicons-react'

import {
  Box,
  Spinner,
  Button,
  Pagehead,
  Octicon
} from '@primer/react' // Import the Button component

const util = require('util')

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true); // Set loading state to true when fetching again

    // Define the URL of the API endpoint you want to fetch data from
    const apiUrl = 'api/reports';

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('data inspect: ' + util.inspect(data))
        setData(data); // Set the retrieved data in the state
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

  console.log('Data:', data); // Log the value of data

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderColor: 'lightgrey', p: 2, borderRadius: 5, background: '#ffaaaa', marginBottom: 20, paddingLeft: 20, verticalAlign: 'middle' }}>
        <Octicon color="red" icon={XCircleFillIcon} size={32} sx={{ mr: 2, paddingLeft: 20, paddingRight: 20 }} />
        Error: {error.message}
      </Box>
    );
  }

return (
  <div style={{ width: '100%' }}>
    <Pagehead>Latest Health Check Report</Pagehead>
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <th style={{ padding: '8px', background: '#f2f2f2', width: '50px' }}>Status</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Name</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Description</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Result</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Status</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Type</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Severity</th>
          <th style={{ padding: '8px', background: '#f2f2f2' }}>Elapsed</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} style={{ border: '1px solid #ccc', background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
            <td style={{ padding: '8px' }}>
              {item.status === 'pass' ? <CheckCircleFillIcon size={24} fill="green"/> : <XCircleFillIcon size={24} fill="red"/>}
            </td>
            <td style={{ padding: '8px' }}>{item.name}</td>
            <td style={{ padding: '8px' }}>{item.description}</td>
            <td style={{ padding: '8px' }}>{item.result}</td>
            <td style={{ padding: '8px' }}>{item.status}</td>
            <td style={{ padding: '8px' }}>{item.type}</td>
            <td style={{ padding: '8px' }}>{item.severity}</td>
            <td style={{ padding: '8px' }}>{item.elapsed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

export default Home;