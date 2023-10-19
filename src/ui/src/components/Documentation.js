import React, { useState } from 'react';
import { Pagehead } from '@primer/react'

function Documentation() {
  const [yaml, setYaml] = useState(''); // State to store the YAML content

  return (
    <div>
        <Pagehead>App Documentation</Pagehead>
    </div>
  );
}

export default Documentation;