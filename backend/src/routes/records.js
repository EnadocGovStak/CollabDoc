const express = require('express');
const router = express.Router();

// Get document types for records management
router.get('/document-types', async (req, res) => {
    // Return common document types
    res.json([
        'Standard Document',
        'Policy',
        'Procedure',
        'Report',
        'Legal Contract',
        'Correspondence',
        'Operation Manual',
        'Technical Manual'
    ]);
});

// Get classifications for records management
router.get('/classifications', async (req, res) => {
    // Return classification levels
    res.json([
        'Public',
        'Internal',
        'Confidential',
        'Restricted'
    ]);
});

// Get retention periods for records management
router.get('/retention-periods', async (req, res) => {
    // Return common retention periods
    res.json([
        '1 Year',
        '3 Years',
        '5 Years',
        '7 Years',
        '10 Years',
        'Permanent'
    ]);
});

module.exports = router; 