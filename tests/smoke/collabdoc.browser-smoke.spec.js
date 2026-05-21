const { test, expect } = require('@playwright/test');
const fs = require('fs/promises');
const path = require('path');

const apiURL = process.env.SMOKE_API_URL || 'http://localhost:5000';
const templateId = process.env.SMOKE_TEMPLATE_ID || 'a2e8ed36-0112-4d3c-b698-131b76d49c91';
const documentName = 'Sprint 01 Browser Smoke Invoice';
const repoRoot = path.resolve(__dirname, '..', '..');

let generatedDocumentId;

async function cleanupGeneratedDocument(documentId) {
  if (!documentId) return;

  await Promise.all([
    fs.rm(path.join(repoRoot, 'backend', 'uploads', 'documents', `${documentId}.sfdt`), { force: true }),
    fs.rm(path.join(repoRoot, 'backend', 'uploads', 'documents', `${documentId}.meta.json`), { force: true })
  ]);
}

async function expectNoCrashOrRawSfdt(page) {
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toMatch(/Cannot read properties|isSelectionCompleted/i);
  expect(bodyText).not.toMatch(/"optimizeSfdt"|\{"sfdt"|"sections"\s*:|"sec"\s*:/i);
}

function isIgnorableConsoleError(text) {
  return text.includes('WebSocket connection') || text.includes('hot-update.json');
}

test.afterEach(async () => {
  await cleanupGeneratedDocument(generatedDocumentId);
  generatedDocumentId = undefined;
});

test('critical document/template browser workflow', async ({ page, request, baseURL }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnorableConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/documents');
  await page.evaluate(() => localStorage.clear());
  await expect(page.getByRole('heading', { name: 'My Documents' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Document' })).toBeVisible();
  await expect(page.locator('nav')).not.toContainText('Editor Test');
  await expectNoCrashOrRawSfdt(page);

  await page.getByRole('button', { name: 'Create Document' }).click();
  const modal = page.locator('.new-document-modal');
  await expect(modal.getByRole('heading', { name: 'Create New Document' })).toBeVisible();
  await expect(modal).not.toContainText('Failed to load templates');

  await modal.getByText('From Template').click();
  await page.locator('#template-select').selectOption(templateId);
  await expect(modal).toContainText('Continue to the template generation form');
  await modal.getByRole('button', { name: 'Create Document' }).click();
  await page.waitForURL(`**/templates/${templateId}/generate`);

  await expect(page.getByRole('heading', { name: 'Generate Document from Template' })).toBeVisible();
  await page.locator('#documentName').fill(documentName);

  const mergeData = {
    CompanyName: 'Acme Legal Operations',
    ClientName: 'Contoso Services',
    InvoiceNumber: 'INV-BROWSER-S01',
    InvoiceDate: '2026-05-19',
    DueDate: '2026-06-18',
    ServiceDescription: 'Browser smoke generation',
    Amount: '1250.00'
  };

  for (const [fieldName, value] of Object.entries(mergeData)) {
    const field = page.locator(`#field-${fieldName}`);
    await expect(field).toBeVisible();
    await field.fill(value);
  }

  await expect(page.locator('body')).not.toContainText('This template has no merge fields.');
  await expect(page.locator('body')).not.toContainText(/Sprint 02|managed library|Extracted from template content/i);
  await expect(page.locator('.view-mode-selector')).not.toContainText(/📄|📝|🔧/);
  await expectNoCrashOrRawSfdt(page);

  await page.getByRole('button', { name: /Generate Document/i }).click();
  await page.waitForURL(/\/editor\/[0-9a-f-]+/);
  generatedDocumentId = page.url().split('/').pop();
  expect(generatedDocumentId).toMatch(/^[0-9a-f-]+$/i);

  await expect(page.locator('body')).toContainText(documentName);
  await expect(page.locator('select[name="classification"]')).not.toHaveValue('', { timeout: 20000 });
  await expect(page.locator('select[name="retentionPeriod"]')).not.toHaveValue('', { timeout: 20000 });
  await expectNoCrashOrRawSfdt(page);

  await page.getByRole('link', { name: 'Templates' }).click();
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
  await expectNoCrashOrRawSfdt(page);

  const documentResponse = await request.get(`${apiURL}/api/documents/${generatedDocumentId}`);
  expect(documentResponse.ok()).toBeTruthy();

  const document = await documentResponse.json();
  expect(document.title).toBe(documentName);
  expect(document.version).toBe(1);
  expect(document.content.optimizeSfdt || document.content.sec || document.content.sections).toBeTruthy();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(baseURL).toBeTruthy();
});

test('existing template editor loads stored template metadata and editor surface', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnorableConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto(`/templates/${templateId}`);
  await expect(page.getByRole('heading', { name: 'Invoice Template' })).toBeVisible();
  await expect(page.locator('input[placeholder="Enter template name"]')).toHaveValue('Invoice Template');
  await expect(page.locator('textarea[placeholder="Enter template description"]')).toContainText('Professional invoice template');
  await expect(page.getByRole('heading', { name: 'Field Analysis' })).toBeVisible();
  await expect(page.locator('.template-field-summary')).toContainText('managed');
  await expect(page.getByRole('button', { name: 'Insert' }).first()).toBeVisible();
  await expect(page.locator('.editor-loading-overlay')).toBeHidden();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expectNoCrashOrRawSfdt(page);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('template save enriches managed and unmanaged field metadata', async ({ request }) => {
  const createResponse = await request.post(`${apiURL}/api/templates`, {
    data: {
      name: 'Smoke Field Metadata Template',
      description: 'Temporary save-time enrichment check',
      category: 'Smoke',
      documentType: 'Smoke',
      content: 'Hello {{CompanyName}} and {{CustomSaveField}}',
      mergeFields: []
    }
  });

  expect(createResponse.ok()).toBeTruthy();
  const created = await createResponse.json();

  try {
    const loadResponse = await request.get(`${apiURL}/api/templates/${created.id}`);
    expect(loadResponse.ok()).toBeTruthy();

    const template = await loadResponse.json();
    expect(template.mergeFields).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'CompanyName', managed: true, category: 'Organization' }),
      expect.objectContaining({ name: 'CustomSaveField', managed: false, category: 'Unmanaged Fields' })
    ]));
  } finally {
    await request.delete(`${apiURL}/api/templates/${created.id}`);
  }
});

test('field library lists and filters managed fields', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnorableConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/field-library');
  await expect(page.getByRole('heading', { name: 'Field Library' })).toBeVisible();
  await expect(page.locator('.field-library-summary')).toContainText('33 fields');
  await expect(page.locator('.field-library-table')).toContainText('Company name');
  await expect(page.locator('.field-library-table')).toContainText('Payment terms');

  await page.getByLabel('Filter by category').selectOption('Invoice');
  await expect(page.locator('.field-library-table')).toContainText('Invoice number');
  await expect(page.locator('.field-library-table')).not.toContainText('Company address');

  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('heading', { name: 'Edit Field' })).toBeVisible();
  await expect(page.locator('input[name="name"]')).not.toHaveValue('');

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('template editor reviews unmanaged fields before library promotion', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  let promotedFieldPayload;

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnorableConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.route('**/api/templates/field-library', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    promotedFieldPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        field: {
          ...promotedFieldPayload,
          managed: true,
          libraryId: promotedFieldPayload.name
        }
      })
    });
  });

  await page.goto('/templates/business-letter-template');
  await expect(page.getByRole('heading', { name: 'Business Letter Template' })).toBeVisible();
  await expect(page.locator('.template-readiness-panel')).toContainText('Save readiness');
  await expect(page.locator('.template-field-summary')).toContainText('8 unmanaged');

  await page.locator('.template-field-migrate-button').first().click();
  const reviewForm = page.locator('.template-field-migration-review');
  await expect(reviewForm).toBeVisible();
  await expect(reviewForm.getByRole('heading', { name: 'Review field' })).toBeVisible();

  const fieldName = await reviewForm.locator('input[name="name"]').inputValue();
  expect(fieldName).not.toBe('');

  await reviewForm.locator('input[name="label"]').fill('Reviewed service type');
  await reviewForm.locator('input[name="category"]').fill('Project');
  await reviewForm.locator('select[name="type"]').selectOption('select');
  await reviewForm.locator('textarea[name="optionsText"]').fill('Discovery\nImplementation');
  await reviewForm.locator('textarea[name="description"]').fill('Reviewed during template authoring.');
  await reviewForm.locator('input[name="exampleValue"]').fill('Discovery');
  await reviewForm.getByRole('button', { name: /Add to library/i }).click();

  await expect(reviewForm).toBeHidden();
  await expect(page.locator('.template-field-summary')).toContainText('6 managed');
  await expect(page.locator('.template-field-summary')).toContainText('7 unmanaged');

  expect(promotedFieldPayload).toEqual(expect.objectContaining({
    name: fieldName,
    label: 'Reviewed service type',
    category: 'Project',
    type: 'select',
    description: 'Reviewed during template authoring.',
    exampleValue: 'Discovery',
    options: ['Discovery', 'Implementation']
  }));
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('template editor blocks governed save until readiness notes are resolved', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  let saveRequestCount = 0;
  let saveRequestBody;

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnorableConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.route('**/api/templates/business-letter-template', async (route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }

    saveRequestCount += 1;
    saveRequestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'business-letter-template',
        name: saveRequestBody.name,
        description: saveRequestBody.description,
        category: saveRequestBody.category,
        documentType: saveRequestBody.documentType,
        recordsManagement: saveRequestBody.recordsManagement,
        mergeFields: [],
        fieldAnalysis: {
          extractedFields: [],
          managedFieldCount: 0,
          unmanagedFieldCount: 0,
          unknownFields: [],
          migrationRequired: false
        }
      })
    });
  });

  await page.goto('/templates/business-letter-template');
  await expect(page.getByRole('heading', { name: 'Business Letter Template' })).toBeVisible();
  await expect(page.locator('.editor-loading-overlay')).toBeHidden();
  await expect(page.locator('.template-readiness-panel')).toContainText('2 notes');

  await page.locator('.template-editor-actions .save-button').click();
  await expect(page.locator('.template-readiness-error')).toContainText('Resolve readiness notes before saving as a governed template');
  expect(saveRequestCount).toBe(0);

  await page.locator('.template-readiness-draft-button').click();
  await expect.poll(() => saveRequestCount).toBe(1);
  await expect(page.locator('.save-status')).toContainText('Draft saved with 2 readiness notes');

  expect(saveRequestBody).toEqual(expect.objectContaining({
    name: 'Business Letter Template'
  }));
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('template preview renders optimized and legacy templates as formatted documents', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnorableConsoleError(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/templates');
  await expect(page.locator('.template-card').first()).toBeVisible();

  async function openPreviewByHeading(headingText) {
    const matchingCard = page.locator('.template-card').filter({
      has: page.locator('h3', { hasText: headingText })
    }).first();

    await expect(matchingCard.locator('h3')).toHaveText(headingText);
    await matchingCard.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('.template-preview-modal')).toBeVisible();
    await expect(page.locator('.template-preview-modal')).not.toContainText(/Loading template preview|Loading document editor/i);
    await expect(page.locator('.template-preview-modal')).not.toContainText(/optimizeSfdt|"sections"\s*:|"sec"\s*:|"tlp"\s*:/i);
    await expect(page.locator('.template-preview-modal .e-documenteditor')).toBeVisible();

    const previewMetrics = await page.locator('.template-preview-modal').evaluate((modal) => {
      const editor = modal.querySelector('.e-documenteditor');
      const canvases = Array.from(modal.querySelectorAll('canvas'));
      const editorRect = editor?.getBoundingClientRect();
      const largestCanvas = canvases
        .map(canvas => {
          const rect = canvas.getBoundingClientRect();
          return {
            width: Math.max(rect.width, canvas.width || 0),
            height: Math.max(rect.height, canvas.height || 0)
          };
        })
        .sort((first, second) => (second.width * second.height) - (first.width * first.height))[0];

      return {
        editorWidth: editorRect?.width || 0,
        editorHeight: editorRect?.height || 0,
        canvasCount: canvases.length,
        canvasWidth: largestCanvas?.width || 0,
        canvasHeight: largestCanvas?.height || 0
      };
    });

    expect(previewMetrics.editorWidth).toBeGreaterThan(900);
    expect(previewMetrics.editorHeight).toBeGreaterThan(300);
    expect(previewMetrics.canvasCount).toBeGreaterThan(0);
    expect(previewMetrics.canvasWidth).toBeGreaterThan(900);
    expect(previewMetrics.canvasHeight).toBeGreaterThan(300);
  }

  await openPreviewByHeading('Salary Advance');
  await page.locator('.template-preview-modal .close-button').click();
  await expect(page.locator('.template-preview-modal')).toBeHidden();

  await openPreviewByHeading('Professional Invoice Template');
  await page.locator('.template-preview-modal .close-button').click();
  await expect(page.locator('.template-preview-modal')).toBeHidden();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
