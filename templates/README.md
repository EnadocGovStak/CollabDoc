# Document Templates

This directory contains document templates in SFDT (Syncfusion Document Format) and DOCX formats.

## Template Structure

Templates are stored in two formats:
- `.json` files containing template metadata and SFDT content
- `.docx` files for original Word documents

## Merge Fields

Templates can contain merge fields that follow this syntax:

```
{{FieldName}}
```

When creating documents from templates, these fields will be replaced with actual data.

## Available Templates

- **Offer Letter**: Template for employment offer letters (`offer-letter.json`)
- **Contract Agreement**: Template for general contracts (`contract.json`)

## Adding New Templates

To add a new template:

1. Create a DOCX file with your content and merge fields
2. Use the API to upload it:
   ```
   POST /api/templates/upload
   ```
   With the file as multipart form data

Or manually:

1. Convert your DOCX to SFDT format (using Syncfusion tools)
2. Create a JSON file with this structure:
   ```json
   {
     "id": "unique-id",
     "name": "Template Name",
     "description": "Template description",
     "content": "SFDT-content-here",
     "createdBy": "admin",
     "createdAt": "2023-07-15T10:30:00Z",
     "updatedAt": "2023-07-15T10:30:00Z"
   }
   ```
3. Place the file in this directory 