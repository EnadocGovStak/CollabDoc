import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const handleCategoryClick = (category) => {
    onCategoryChange(selectedCategory === category ? null : category);
  };

  return (
    <div className="category-filter">
      <h3>Categories</h3>
      <div className="category-buttons">
        <button
          className={`category-button ${selectedCategory ? '' : 'active'}`}
          onClick={() => onCategoryChange(null)}
        >
          All
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
