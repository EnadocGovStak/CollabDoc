import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={handleInputChange}
        />
        {searchTerm && (
          <button className="clear-button" onClick={handleClear}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
