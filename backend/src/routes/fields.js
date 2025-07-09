const express = require('express');
const router = express.Router();
const {
  getFieldsByCategory,
  getCategories,
  getFieldByName,
  getAllFields,
  searchFields,
  validateFieldValue
} = require('../data/mergeFieldLibrary');

/**
 * GET /api/fields/categories
 * Get all available field categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = getCategories();
    res.json({
      success: true,
      categories: categories.map(category => ({
        name: category,
        displayName: category.charAt(0).toUpperCase() + category.slice(1)
      }))
    });
  } catch (error) {
    console.error('Error getting field categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get field categories'
    });
  }
});

/**
 * GET /api/fields/category/:categoryName
 * Get all fields in a specific category
 */
router.get('/category/:categoryName', (req, res) => {
  try {
    const { categoryName } = req.params;
    const fields = getFieldsByCategory(categoryName);
    
    if (fields.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Category '${categoryName}' not found`
      });
    }
    
    res.json({
      success: true,
      category: categoryName,
      fields: fields
    });
  } catch (error) {
    console.error('Error getting fields by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fields by category'
    });
  }
});

/**
 * GET /api/fields/all
 * Get all fields across all categories
 */
router.get('/all', (req, res) => {
  try {
    const allFields = getAllFields();
    res.json({
      success: true,
      fields: allFields,
      count: allFields.length
    });
  } catch (error) {
    console.error('Error getting all fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get all fields'
    });
  }
});

/**
 * GET /api/fields/search?q=searchTerm
 * Search for fields by name, description, or category
 */
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const matchingFields = searchFields(q);
    res.json({
      success: true,
      query: q,
      fields: matchingFields,
      count: matchingFields.length
    });
  } catch (error) {
    console.error('Error searching fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search fields'
    });
  }
});

/**
 * GET /api/fields/:fieldName
 * Get a specific field by name
 */
router.get('/:fieldName', (req, res) => {
  try {
    const { fieldName } = req.params;
    const field = getFieldByName(fieldName);
    
    if (!field) {
      return res.status(404).json({
        success: false,
        error: `Field '${fieldName}' not found`
      });
    }
    
    res.json({
      success: true,
      field: field
    });
  } catch (error) {
    console.error('Error getting field by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get field'
    });
  }
});

/**
 * POST /api/fields/validate
 * Validate field values against field definitions
 */
router.post('/validate', (req, res) => {
  try {
    const { fieldName, value } = req.body;
    
    if (!fieldName) {
      return res.status(400).json({
        success: false,
        error: 'Field name is required'
      });
    }
    
    const fieldDef = getFieldByName(fieldName);
    if (!fieldDef) {
      return res.status(404).json({
        success: false,
        error: `Field '${fieldName}' not found`
      });
    }
    
    const validationResult = validateFieldValue(fieldDef, value);
    
    res.json({
      success: true,
      fieldName: fieldName,
      value: value,
      validation: validationResult
    });
  } catch (error) {
    console.error('Error validating field value:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate field value'
    });
  }
});

/**
 * POST /api/fields/validate-multiple
 * Validate multiple field values
 */
router.post('/validate-multiple', (req, res) => {
  try {
    const { fields } = req.body;
    
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        error: 'Fields array is required'
      });
    }
    
    const results = [];
    
    for (const fieldData of fields) {
      const { fieldName, value } = fieldData;
      const fieldDef = getFieldByName(fieldName);
      
      if (!fieldDef) {
        results.push({
          fieldName: fieldName,
          value: value,
          validation: {
            isValid: false,
            errors: [`Field '${fieldName}' not found in standard library`]
          }
        });
      } else {
        const validationResult = validateFieldValue(fieldDef, value);
        results.push({
          fieldName: fieldName,
          value: value,
          validation: validationResult
        });
      }
    }
    
    const overallValid = results.every(result => result.validation.isValid);
    
    res.json({
      success: true,
      isValid: overallValid,
      results: results,
      errorCount: results.filter(r => !r.validation.isValid).length
    });
  } catch (error) {
    console.error('Error validating multiple fields:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate fields'
    });
  }
});

module.exports = router;
