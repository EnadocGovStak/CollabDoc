const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const isAppService = Boolean(process.env.WEBSITE_SITE_NAME);

const storageRoot = process.env.STORAGE_ROOT || (isAppService
  ? path.join('/home', 'site', 'data', 'collabdoc')
  : repoRoot);

const templatesDir = process.env.TEMPLATES_DIR || path.join(storageRoot, 'templates');
const uploadsDir = process.env.UPLOADS_DIR || path.join(storageRoot, 'uploads');
const documentsDir = process.env.DOCUMENTS_DIR || path.join(uploadsDir, 'documents');
const versionsDir = process.env.VERSIONS_DIR || path.join(uploadsDir, 'versions');
const tempDir = process.env.TEMP_DIR || path.join(uploadsDir, 'temp');

module.exports = {
  storageRoot,
  templatesDir,
  uploadsDir,
  documentsDir,
  versionsDir,
  tempDir,
};