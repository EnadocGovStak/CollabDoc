const path = require('path');
const fs = require('fs');

const backendRoot = path.resolve(__dirname, '..', '..');
const defaultTemplatesDir = path.resolve(backendRoot, 'templates');

function resolveBackendPath(configuredPath, fallbackPath) {
  const targetPath = configuredPath || fallbackPath;
  return path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(backendRoot, targetPath);
}

const uploadsDir = resolveBackendPath(process.env.STORAGE_PATH, 'uploads');
const templatesDir = resolveBackendPath(process.env.TEMPLATES_PATH, 'templates');

function seedTemplatesIfNeeded() {
  try {
    if (templatesDir === defaultTemplatesDir || !fs.existsSync(defaultTemplatesDir)) {
      return;
    }

    fs.mkdirSync(templatesDir, { recursive: true });

    const existingTemplates = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
    if (existingTemplates.length > 0) {
      return;
    }

    fs.readdirSync(defaultTemplatesDir)
      .filter(file => file.endsWith('.json'))
      .forEach(file => {
        fs.copyFileSync(path.join(defaultTemplatesDir, file), path.join(templatesDir, file));
      });
  } catch (error) {
    console.warn('Could not seed configured templates directory:', error.message);
  }
}

seedTemplatesIfNeeded();

module.exports = {
  defaultTemplatesDir,
  uploadsDir,
  templatesDir,
  documentsDir: path.join(uploadsDir, 'documents'),
  versionsDir: path.join(uploadsDir, 'versions'),
  tempDir: path.join(uploadsDir, 'temp')
};