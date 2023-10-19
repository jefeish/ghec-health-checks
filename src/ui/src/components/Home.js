import React, { useState, useEffect } from 'react';

import { Box } from '@primer/react'
import { Pagehead } from '@primer/react'

function Home() {

  return (
    <div>
      <Pagehead>Status</Pagehead>
      <div style={{ textAlign: 'center' }}>
        <img src="logo-192.png" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
      </div>
    </div>
  );
}

export default Home;