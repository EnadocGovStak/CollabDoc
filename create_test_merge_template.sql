INSERT INTO Documents (Name, Content, IsTemplate, CreatedDate, LastModified) 
VALUES ('Test Merge Template', 
'{"sfdt": "Hello {{< CustomerName >}}, your invoice {{< InvoiceNumber >}} for ${{< TotalAmount >}} is ready."}', 
1, 
datetime('now'), 
datetime('now'));
