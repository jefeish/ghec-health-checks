import React, { useState } from 'react';
import { Pagehead } from '@primer/react'

function Configuration() {
  const [yaml, setYaml] = useState(''); // State to store the YAML content
  const listData = [
    { id: 1, name: 'Item 1', description: 'Description for Item 1' },
    { id: 2, name: 'Item 2', description: 'Description for Item 2' },
    { id: 3, name: 'Item 3', description: 'Description for Item 3' },
  ];

  return (
    <div>
      <Pagehead>App Configuration</Pagehead>

    </div>
  );
}

export default Configuration;