import React, { useEffect, useState } from 'react';
import { Pagehead } from '@primer/react'
import { Octicon } from '@primer/react'
import YamlEditor from './YamlEditor.js'

import {
  SyncIcon,
  XCircleFillIcon,
  PencilIcon
} from '@primer/octicons-react'

import {
  Box,
  Spinner,
  Button
} from '@primer/react' // Import the Button component

function Configuration() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true); // Set loading state to true when fetching again

    // Define the URL of the API endpoint you want to fetch data from
    const apiUrl = 'api/config';

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('data: ' + data);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ borderWidth: 1, borderStyle: 'solid', borderColor: 'lightgrey', p: 2, borderRadius: 8, background: '#ffaaaa', marginBottom: 20, paddingLeft: 20, verticalAlign: 'middle' }}>
        <Octicon color="red" icon={XCircleFillIcon} size={32} sx={{ mr: 2, paddingLeft: 20, paddingRight: 20 }} />
        Error: {error.message}
      </Box>
    );
  }

  const initialYamlData = `
  health_checks:
    - name: "check_repo_clone"
      description: standard repository checks (clone, push, PR)
      type: "repo"
      severity: "critical"
      message: "This is a custom message"
      params:
        repo: "" # required: repository name
        branch: "" # optional: default is "main"
        description: "" 
  
    - name: "check_repo_commit"
      description: standard repository checks (clone, push, PR)
      type: "repo"
      severity: "critical"
      message: "This is a custom message"
      params:
        repo: "" # required: repository name
        branch: "" # optional: default is "main"
        description: "" 
  
    - name: "check_repo_pr"
      description: standard repository checks (clone, push, PR)
      type: "repo"
      severity: "critical"
      message: "This is a custom message"
      params:
        repo: "" # required: repository name
        branch: "" # optional: default is "main"
        description: "" 
  
  reports:
    - name: "issue"
      description: "Markdown report"
      type: "markdown"
      params:
        path: "report.md" # optional: default is "report.md"
    - name: "db"
      description: "JSON report"
      type: "json"
      params:
        path: "report.json" # optional: default is "report.json"
    - name: "csv"
      description: "CSV report"
      type: "csv"
      params:
        path: "report.csv" # optional: default is "report.csv"  
  `;

  return (
    <div>
      <Pagehead>App Configuration</Pagehead>
      <YamlEditor style={{ fontSize: '20px' }} initialData={data} />
    </div>
  );
}

export default Configuration;