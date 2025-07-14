import React, { useState } from 'react';

const FocusTest = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Focus Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <label>Test Input: </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => console.log('Test input got focus')}
          onBlur={() => console.log('Test input lost focus')}
          style={{ marginLeft: '10px', padding: '5px' }}
        />
      </div>
      <div>
        <p>Type in the input above and check the console for focus events.</p>
        <p>Current value: {inputValue}</p>
      </div>
    </div>
  );
};

export default FocusTest;
