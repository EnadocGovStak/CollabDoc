// Test the TemplateMergeEngine functionality
const TemplateMergeEngine = require('./TemplateMergeEngine').default;

// Test basic merge functionality
console.log('=== TemplateMergeEngine Tests ===');

// Test 1: Simple text merge
const simpleTemplate = "Hello {{name}}, welcome to {{company}}!";
const simpleData = { name: "John", company: "Acme Corp" };
const simpleResult = TemplateMergeEngine.mergeTemplate(simpleTemplate, simpleData);
console.log('Test 1 - Simple merge:');
console.log('Template:', simpleTemplate);
console.log('Data:', simpleData);
console.log('Result:', simpleResult);
console.log('Expected: Hello John, welcome to Acme Corp!');
console.log('✓ Test 1 passed:', simpleResult === "Hello John, welcome to Acme Corp!");

// Test 2: SFDT-like content
const sfdtTemplate = JSON.stringify({
  sections: [{
    blocks: [{
      paragraphFormat: {},
      inlines: [{ text: "Dear {{recipient}}, this is your {{document_type}}." }]
    }]
  }]
});
const sfdtData = { recipient: "Alice", document_type: "contract" };
const sfdtResult = TemplateMergeEngine.mergeTemplate(sfdtTemplate, sfdtData);
console.log('\nTest 2 - SFDT merge:');
console.log('Template type:', typeof sfdtTemplate);
console.log('Result includes Alice:', sfdtResult.includes('Alice'));
console.log('Result includes contract:', sfdtResult.includes('contract'));

// Test 3: Extract merge fields
const fieldsTemplate = "{{first_name}} {{last_name}} works at {{company}} in {{department}}.";
const extractedFields = TemplateMergeEngine.extractMergeFields(fieldsTemplate);
console.log('\nTest 3 - Extract fields:');
console.log('Template:', fieldsTemplate);
console.log('Extracted fields:', extractedFields);
console.log('Expected: ["first_name", "last_name", "company", "department"]');

// Test 4: Validation
const validationFields = [
  { name: 'first_name', required: true },
  { name: 'last_name', required: true },
  { name: 'company', required: false }
];
const validData = { first_name: 'John', last_name: 'Doe' };
const invalidData = { first_name: 'John' }; // missing last_name
const validResult = TemplateMergeEngine.validateMergeData(validData, validationFields);
const invalidResult = TemplateMergeEngine.validateMergeData(invalidData, validationFields);
console.log('\nTest 4 - Validation:');
console.log('Valid data result:', validResult);
console.log('Invalid data result:', invalidResult);

console.log('\n=== Tests Complete ===');
