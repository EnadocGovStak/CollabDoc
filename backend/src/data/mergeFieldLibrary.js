const STANDARD_FIELDS = {
  personal: [
    {
      name: 'FirstName',
      type: 'text',
      required: true,
      category: 'Personal',
      description: 'First name of the person',
      validation: {
        minLength: 1,
        maxLength: 50,
        regex: '^[A-Za-z\\s\\-\']+$'
      }
    },
    {
      name: 'LastName',
      type: 'text',
      required: true,
      category: 'Personal',
      description: 'Last name of the person',
      validation: {
        minLength: 1,
        maxLength: 50,
        regex: '^[A-Za-z\\s\\-\']+$'
      }
    },
    {
      name: 'FullName',
      type: 'text',
      required: true,
      category: 'Personal',
      description: 'Full name of the person',
      validation: {
        minLength: 1,
        maxLength: 100
      }
    },
    {
      name: 'Email',
      type: 'email',
      required: true,
      category: 'Personal',
      description: 'Email address',
      validation: {
        regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    },
    {
      name: 'PhoneNumber',
      type: 'text',
      required: false,
      category: 'Personal',
      description: 'Phone number',
      validation: {
        regex: '^[\\+]?[0-9\\s\\-\\(\\)]+$',
        minLength: 10,
        maxLength: 20
      }
    },
    {
      name: 'Address',
      type: 'textarea',
      required: false,
      category: 'Personal',
      description: 'Full address',
      validation: {
        maxLength: 500
      }
    },
    {
      name: 'DateOfBirth',
      type: 'date',
      required: false,
      category: 'Personal',
      description: 'Date of birth'
    },
    {
      name: 'SSN',
      type: 'text',
      required: false,
      category: 'Personal',
      description: 'Social Security Number',
      validation: {
        regex: '^\\d{3}-\\d{2}-\\d{4}$'
      }
    }
  ],

  company: [
    {
      name: 'CompanyName',
      type: 'text',
      required: true,
      category: 'Company',
      description: 'Company or organization name',
      validation: {
        minLength: 1,
        maxLength: 200
      }
    },
    {
      name: 'CompanyAddress',
      type: 'textarea',
      required: false,
      category: 'Company',
      description: 'Company address',
      validation: {
        maxLength: 500
      }
    },
    {
      name: 'CompanyPhone',
      type: 'text',
      required: false,
      category: 'Company',
      description: 'Company phone number',
      validation: {
        regex: '^[\\+]?[0-9\\s\\-\\(\\)]+$',
        minLength: 10,
        maxLength: 20
      }
    },
    {
      name: 'CompanyEmail',
      type: 'email',
      required: false,
      category: 'Company',
      description: 'Company email address'
    },
    {
      name: 'CompanyWebsite',
      type: 'text',
      required: false,
      category: 'Company',
      description: 'Company website URL',
      validation: {
        regex: '^https?:\\/\\/.+'
      }
    },
    {
      name: 'CompanyRegistrationNumber',
      type: 'text',
      required: false,
      category: 'Company',
      description: 'Company registration or tax ID number'
    },
    {
      name: 'Department',
      type: 'text',
      required: false,
      category: 'Company',
      description: 'Department or division'
    }
  ],

  employment: [
    {
      name: 'PositionTitle',
      type: 'text',
      required: true,
      category: 'Employment',
      description: 'Job title or position',
      validation: {
        minLength: 1,
        maxLength: 100
      }
    },
    {
      name: 'EmployeeID',
      type: 'text',
      required: false,
      category: 'Employment',
      description: 'Employee identification number'
    },
    {
      name: 'StartDate',
      type: 'date',
      required: true,
      category: 'Employment',
      description: 'Employment start date'
    },
    {
      name: 'EndDate',
      type: 'date',
      required: false,
      category: 'Employment',
      description: 'Employment end date'
    },
    {
      name: 'Salary',
      type: 'number',
      required: false,
      category: 'Employment',
      description: 'Annual salary amount',
      validation: {
        min: 0,
        max: 10000000
      }
    },
    {
      name: 'PayFrequency',
      type: 'dropdown',
      required: false,
      category: 'Employment',
      description: 'Pay frequency',
      options: ['Weekly', 'Bi-weekly', 'Monthly', 'Annually'],
      defaultValue: 'Bi-weekly'
    },
    {
      name: 'WorkLocation',
      type: 'text',
      required: false,
      category: 'Employment',
      description: 'Work location or office'
    },
    {
      name: 'ReportingManager',
      type: 'text',
      required: false,
      category: 'Employment',
      description: 'Name of direct supervisor'
    },
    {
      name: 'WeeklyHours',
      type: 'number',
      required: false,
      category: 'Employment',
      description: 'Hours per week',
      validation: {
        min: 1,
        max: 80
      },
      defaultValue: 40
    }
  ],

  legal: [
    {
      name: 'CaseNumber',
      type: 'text',
      required: false,
      category: 'Legal',
      description: 'Legal case number'
    },
    {
      name: 'CourtName',
      type: 'text',
      required: false,
      category: 'Legal',
      description: 'Name of the court'
    },
    {
      name: 'JudgeName',
      type: 'text',
      required: false,
      category: 'Legal',
      description: 'Name of the presiding judge'
    },
    {
      name: 'LawFirmName',
      type: 'text',
      required: false,
      category: 'Legal',
      description: 'Name of the law firm'
    },
    {
      name: 'AttorneyName',
      type: 'text',
      required: false,
      category: 'Legal',
      description: 'Name of the attorney'
    },
    {
      name: 'ContractDate',
      type: 'date',
      required: false,
      category: 'Legal',
      description: 'Contract or agreement date'
    },
    {
      name: 'ContractTerms',
      type: 'textarea',
      required: false,
      category: 'Legal',
      description: 'Contract terms and conditions',
      validation: {
        maxLength: 2000
      }
    },
    {
      name: 'LegalEntity',
      type: 'dropdown',
      required: false,
      category: 'Legal',
      description: 'Type of legal entity',
      options: ['Individual', 'Corporation', 'LLC', 'Partnership', 'Non-Profit']
    }
  ],

  finance: [
    {
      name: 'InvoiceNumber',
      type: 'text',
      required: true,
      category: 'Finance',
      description: 'Invoice identification number'
    },
    {
      name: 'InvoiceDate',
      type: 'date',
      required: true,
      category: 'Finance',
      description: 'Invoice date'
    },
    {
      name: 'DueDate',
      type: 'date',
      required: false,
      category: 'Finance',
      description: 'Payment due date'
    },
    {
      name: 'Amount',
      type: 'number',
      required: true,
      category: 'Finance',
      description: 'Total amount',
      validation: {
        min: 0,
        max: 999999999
      }
    },
    {
      name: 'Currency',
      type: 'dropdown',
      required: false,
      category: 'Finance',
      description: 'Currency type',
      options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      defaultValue: 'USD'
    },
    {
      name: 'TaxRate',
      type: 'number',
      required: false,
      category: 'Finance',
      description: 'Tax rate percentage',
      validation: {
        min: 0,
        max: 100
      }
    },
    {
      name: 'PaymentTerms',
      type: 'dropdown',
      required: false,
      category: 'Finance',
      description: 'Payment terms',
      options: ['Net 15', 'Net 30', 'Net 60', 'Due on Receipt'],
      defaultValue: 'Net 30'
    },
    {
      name: 'AccountNumber',
      type: 'text',
      required: false,
      category: 'Finance',
      description: 'Account number'
    },
    {
      name: 'ProjectCode',
      type: 'text',
      required: false,
      category: 'Finance',
      description: 'Project or cost center code'
    }
  ],

  project: [
    {
      name: 'ProjectName',
      type: 'text',
      required: true,
      category: 'Project',
      description: 'Name of the project',
      validation: {
        minLength: 1,
        maxLength: 200
      }
    },
    {
      name: 'ProjectDescription',
      type: 'textarea',
      required: false,
      category: 'Project',
      description: 'Project description',
      validation: {
        maxLength: 1000
      }
    },
    {
      name: 'ProjectManager',
      type: 'text',
      required: false,
      category: 'Project',
      description: 'Name of the project manager'
    },
    {
      name: 'ProjectStartDate',
      type: 'date',
      required: false,
      category: 'Project',
      description: 'Project start date'
    },
    {
      name: 'ProjectEndDate',
      type: 'date',
      required: false,
      category: 'Project',
      description: 'Project end date'
    },
    {
      name: 'Budget',
      type: 'number',
      required: false,
      category: 'Project',
      description: 'Project budget',
      validation: {
        min: 0,
        max: 999999999
      }
    },
    {
      name: 'Timeline',
      type: 'text',
      required: false,
      category: 'Project',
      description: 'Project timeline'
    },
    {
      name: 'ProjectStatus',
      type: 'dropdown',
      required: false,
      category: 'Project',
      description: 'Current project status',
      options: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      defaultValue: 'Planning'
    }
  ],

  general: [
    {
      name: 'Date',
      type: 'date',
      required: false,
      category: 'General',
      description: 'General date field',
      defaultValue: new Date().toISOString().split('T')[0]
    },
    {
      name: 'Title',
      type: 'text',
      required: false,
      category: 'General',
      description: 'Document or item title'
    },
    {
      name: 'Description',
      type: 'textarea',
      required: false,
      category: 'General',
      description: 'General description',
      validation: {
        maxLength: 1000
      }
    },
    {
      name: 'Notes',
      type: 'textarea',
      required: false,
      category: 'General',
      description: 'Additional notes',
      validation: {
        maxLength: 2000
      }
    },
    {
      name: 'Reference',
      type: 'text',
      required: false,
      category: 'General',
      description: 'Reference number or code'
    },
    {
      name: 'Status',
      type: 'dropdown',
      required: false,
      category: 'General',
      description: 'General status',
      options: ['Draft', 'In Review', 'Approved', 'Completed', 'Archived'],
      defaultValue: 'Draft'
    }
  ]
};

/**
 * Get all fields from a specific category
 * @param {string} category - The category name
 * @returns {Array} Array of field definitions
 */
const getFieldsByCategory = (category) => {
  return STANDARD_FIELDS[category] || [];
};

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
const getCategories = () => {
  return Object.keys(STANDARD_FIELDS);
};

/**
 * Get a specific field by name from any category
 * @param {string} fieldName - The field name to search for
 * @returns {Object|null} Field definition or null if not found
 */
const getFieldByName = (fieldName) => {
  for (const category of Object.keys(STANDARD_FIELDS)) {
    const field = STANDARD_FIELDS[category].find(f => f.name === fieldName);
    if (field) {
      return field;
    }
  }
  return null;
};

/**
 * Get all fields across all categories
 * @returns {Array} Array of all field definitions
 */
const getAllFields = () => {
  const allFields = [];
  for (const category of Object.keys(STANDARD_FIELDS)) {
    allFields.push(...STANDARD_FIELDS[category]);
  }
  return allFields;
};

/**
 * Get fields that match a search term
 * @param {string} searchTerm - The term to search for
 * @returns {Array} Array of matching field definitions
 */
const searchFields = (searchTerm) => {
  const allFields = getAllFields();
  const term = searchTerm.toLowerCase();
  
  return allFields.filter(field => 
    field.name.toLowerCase().includes(term) ||
    field.description.toLowerCase().includes(term) ||
    field.category.toLowerCase().includes(term)
  );
};

/**
 * Validate field data against field definition
 * @param {Object} fieldDef - Field definition
 * @param {any} value - Value to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validateFieldValue = (fieldDef, value) => {
  const result = { isValid: true, errors: [] };
  
  // Check required
  if (fieldDef.required && (!value || value.toString().trim() === '')) {
    result.errors.push(`${fieldDef.name} is required`);
    result.isValid = false;
    return result;
  }
  
  // Skip validation if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return result;
  }
  
  // Type-specific validation
  switch (fieldDef.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        result.errors.push(`${fieldDef.name} must be a valid email address`);
        result.isValid = false;
      }
      break;
      
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        result.errors.push(`${fieldDef.name} must be a number`);
        result.isValid = false;
      } else if (fieldDef.validation) {
        if (fieldDef.validation.min !== undefined && numValue < fieldDef.validation.min) {
          result.errors.push(`${fieldDef.name} must be at least ${fieldDef.validation.min}`);
          result.isValid = false;
        }
        if (fieldDef.validation.max !== undefined && numValue > fieldDef.validation.max) {
          result.errors.push(`${fieldDef.name} must be no more than ${fieldDef.validation.max}`);
          result.isValid = false;
        }
      }
      break;
      
    case 'date':
      if (isNaN(Date.parse(value))) {
        result.errors.push(`${fieldDef.name} must be a valid date`);
        result.isValid = false;
      }
      break;
  }
  
  // Custom validation rules
  if (fieldDef.validation && result.isValid) {
    const validation = fieldDef.validation;
    const strValue = value.toString();
    
    if (validation.minLength && strValue.length < validation.minLength) {
      result.errors.push(`${fieldDef.name} must be at least ${validation.minLength} characters`);
      result.isValid = false;
    }
    
    if (validation.maxLength && strValue.length > validation.maxLength) {
      result.errors.push(`${fieldDef.name} must be no more than ${validation.maxLength} characters`);
      result.isValid = false;
    }
    
    if (validation.regex && !new RegExp(validation.regex).test(strValue)) {
      result.errors.push(`${fieldDef.name} format is invalid`);
      result.isValid = false;
    }
  }
  
  return result;
};

module.exports = {
  STANDARD_FIELDS,
  getFieldsByCategory,
  getCategories,
  getFieldByName,
  getAllFields,
  searchFields,
  validateFieldValue
};
