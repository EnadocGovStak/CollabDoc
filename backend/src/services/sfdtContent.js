const DEFAULT_CHARACTER_FORMAT = {
  fontSize: 11,
  fontFamily: 'Calibri',
  fontSizeBidi: 11,
  fontFamilyBidi: 'Calibri'
};

const DEFAULT_PARAGRAPH_FORMAT = {
  styleName: 'Normal',
  listFormat: {},
  lineSpacing: 1.15,
  lineSpacingType: 'Multiple'
};

const STRUCTURED_SFDT_KEYS = ['sections', 'sec', 'optimizeSfdt'];

const parseJson = (value) => {
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isStructuredSfdtObject = (value) => (
  value &&
  typeof value === 'object' &&
  STRUCTURED_SFDT_KEYS.some(key => Object.prototype.hasOwnProperty.call(value, key))
);

const isLegacyPlainSfdtWrapper = (value) => {
  if (!value || typeof value !== 'object' || typeof value.sfdt !== 'string') {
    return false;
  }

  const sfdtText = value.sfdt.trim();
  if (!sfdtText || sfdtText.startsWith('UEs')) {
    return false;
  }

  const nestedSfdt = parseJson(sfdtText);
  return !isStructuredSfdtObject(nestedSfdt);
};

const removeVerticalTabs = (value) => value.split(String.fromCharCode(11)).join('');
const normalizeLine = (line) => removeVerticalTabs(line).trimEnd();
const MERGE_FIELD_PATTERN = /\{\{\s*([^}\s]+)\s*\}\}/g;

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compactInlineText = (inline) => inline?.text || inline?.tlp || '';

const getInlineTextKey = (inline = {}) => {
  if (Object.prototype.hasOwnProperty.call(inline, 'text')) return 'text';
  if (Object.prototype.hasOwnProperty.call(inline, 'tlp')) return 'tlp';
  return 'text';
};

const extractTextFromFullSections = (sections) => sections
  .flatMap(section => section.blocks || [])
  .map(block => (block.inlines || []).map(compactInlineText).join(''))
  .join('\n');

const extractTextFromCompactSections = (sections) => sections
  .flatMap(section => section.b || [])
  .map(block => (block.i || []).map(compactInlineText).join(''))
  .join('\n');

const extractMergeFieldsFromText = (text, fields = []) => {
  if (!text) return fields;

  let match;
  MERGE_FIELD_PATTERN.lastIndex = 0;
  while ((match = MERGE_FIELD_PATTERN.exec(String(text))) !== null) {
    const fieldName = match[1].trim();
    if (fieldName && !fields.includes(fieldName)) {
      fields.push(fieldName);
    }
  }

  return fields;
};

const extractTextFromSfdtContent = (content) => {
  if (!content) return '';

  const parsedContent = typeof content === 'string' ? parseJson(content) : content;
  if (!parsedContent || typeof parsedContent !== 'object') {
    return String(content || '');
  }

  if (Array.isArray(parsedContent.sections)) {
    return extractTextFromFullSections(parsedContent.sections);
  }

  if (Array.isArray(parsedContent.sec)) {
    return removeVerticalTabs(extractTextFromCompactSections(parsedContent.sec));
  }

  if (typeof parsedContent.sfdt === 'string') {
    const nestedContent = parseJson(parsedContent.sfdt);
    return nestedContent ? extractTextFromSfdtContent(nestedContent) : parsedContent.sfdt;
  }

  return JSON.stringify(parsedContent, null, 2);
};

const extractMergeFieldsFromSfdtContent = (content) => extractMergeFieldsFromText(extractTextFromSfdtContent(content));

const replaceMergeFieldsInText = (text, mergeData = {}) => {
  let result = String(text || '');

  Object.entries(mergeData || {}).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, value != null ? String(value) : '');
  });

  return result;
};

const mergeInlineCollection = (owner, inlinesKey, mergeData) => {
  const inlines = owner?.[inlinesKey];
  if (!Array.isArray(inlines) || inlines.length === 0) return;

  const currentText = inlines.map(compactInlineText).join('');
  const mergedText = replaceMergeFieldsInText(currentText, mergeData);
  if (mergedText === currentText) return;

  const firstInline = { ...inlines[0] };
  firstInline[getInlineTextKey(firstInline)] = mergedText;
  owner[inlinesKey] = [firstInline];
};

const mergeStructuredSfdtObject = (sfdtObject, mergeData = {}) => {
  if (Array.isArray(sfdtObject.sections)) {
    sfdtObject.sections.forEach(section => {
      (section.blocks || []).forEach(block => mergeInlineCollection(block, 'inlines', mergeData));
    });
  }

  if (Array.isArray(sfdtObject.sec)) {
    sfdtObject.sec.forEach(section => {
      (section.b || []).forEach(block => mergeInlineCollection(block, 'i', mergeData));
    });
  }

  return sfdtObject;
};

const mergeSfdtContent = (content, mergeData = {}) => {
  if (!content) return content;

  if (typeof content === 'object') {
    const clonedContent = JSON.parse(JSON.stringify(content));
    if (isStructuredSfdtObject(clonedContent)) {
      return mergeStructuredSfdtObject(clonedContent, mergeData);
    }

    if (typeof clonedContent.sfdt === 'string') {
      const nestedContent = parseJson(clonedContent.sfdt);
      clonedContent.sfdt = nestedContent
        ? JSON.stringify(mergeStructuredSfdtObject(nestedContent, mergeData))
        : replaceMergeFieldsInText(clonedContent.sfdt, mergeData);
      return clonedContent;
    }

    return clonedContent;
  }

  if (typeof content !== 'string') {
    return content;
  }

  const parsedContent = parseJson(content);
  if (!parsedContent) {
    return replaceMergeFieldsInText(content, mergeData);
  }

  if (isStructuredSfdtObject(parsedContent)) {
    return JSON.stringify(mergeStructuredSfdtObject(parsedContent, mergeData));
  }

  if (typeof parsedContent.sfdt === 'string') {
    const nestedContent = parseJson(parsedContent.sfdt);
    parsedContent.sfdt = nestedContent
      ? JSON.stringify(mergeStructuredSfdtObject(nestedContent, mergeData))
      : replaceMergeFieldsInText(parsedContent.sfdt, mergeData);
    return JSON.stringify(parsedContent);
  }

  return replaceMergeFieldsInText(content, mergeData);
};

const isSeparatorLine = (line) => /^[-*_]{3,}$/.test(line.trim());
const isAllCapsHeading = (line) => {
  const trimmed = line.trim();
  return trimmed.length >= 3 &&
    trimmed.length <= 64 &&
    /[A-Z]/.test(trimmed) &&
    trimmed === trimmed.toUpperCase() &&
    !trimmed.includes('{{');
};
const isSectionHeading = (line) => {
  const trimmed = line.trim();
  return trimmed.endsWith(':') && trimmed.length <= 72 && !trimmed.includes('{{');
};
const isBulletLine = (line) => /^\s*([-*•]|\d+\.)\s+/.test(line);
const stripBulletPrefix = (line) => line.replace(/^\s*([-*•]|\d+\.)\s+/, '');

const createInline = (text, characterFormat = {}) => ({
  characterFormat: {
    ...DEFAULT_CHARACTER_FORMAT,
    ...characterFormat
  },
  text
});

const createParagraph = (text, paragraphFormat = {}, characterFormat = {}) => ({
  paragraphFormat: {
    ...DEFAULT_PARAGRAPH_FORMAT,
    ...paragraphFormat
  },
  characterFormat: {
    ...DEFAULT_CHARACTER_FORMAT,
    ...characterFormat
  },
  inlines: [createInline(text, characterFormat)]
});

const createStyledSfdtFromText = (textContent, options = {}) => {
  const normalizedText = String(textContent || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedText.split('\n').map(normalizeLine);
  const firstContentIndex = lines.findIndex(line => line.trim().length > 0 && !isSeparatorLine(line));

  const blocks = lines.map((line, index) => {
    const trimmed = line.trim();

    if (isSeparatorLine(trimmed)) {
      return createParagraph('', { beforeSpacing: 4, afterSpacing: 8 });
    }

    if (!trimmed) {
      return createParagraph('', { afterSpacing: 3 });
    }

    if (index === firstContentIndex && isAllCapsHeading(trimmed)) {
      return createParagraph(trimmed, {
        styleName: 'Title',
        afterSpacing: 14,
        textAlignment: 'Center'
      }, {
        bold: true,
        fontSize: 18,
        fontColor: '#1F4E79'
      });
    }

    if (isAllCapsHeading(trimmed) || isSectionHeading(trimmed)) {
      return createParagraph(trimmed, {
        styleName: 'Heading 2',
        beforeSpacing: 10,
        afterSpacing: 6
      }, {
        bold: true,
        fontSize: 12,
        fontColor: '#1F4E79'
      });
    }

    if (isBulletLine(line)) {
      return createParagraph(`• ${stripBulletPrefix(line)}`, {
        leftIndent: 18,
        firstLineIndent: -18,
        afterSpacing: 3
      });
    }

    if (/signature/i.test(trimmed)) {
      return createParagraph(trimmed, { beforeSpacing: 10, afterSpacing: 4 });
    }

    return createParagraph(trimmed, { afterSpacing: 5 });
  });

  if (options.title && firstContentIndex === -1) {
    blocks.unshift(createParagraph(options.title, {
      styleName: 'Title',
      afterSpacing: 14,
      textAlignment: 'Center'
    }, {
      bold: true,
      fontSize: 18,
      fontColor: '#1F4E79'
    }));
  }

  return JSON.stringify({
    sections: [{
      sectionFormat: {
        pageWidth: 612,
        pageHeight: 792,
        leftMargin: 72,
        rightMargin: 72,
        topMargin: 72,
        bottomMargin: 72,
        differentFirstPage: false,
        differentOddAndEvenPages: false,
        headerDistance: 36,
        footerDistance: 36,
        bidi: false
      },
      blocks,
      headersFooters: {}
    }],
    characterFormat: DEFAULT_CHARACTER_FORMAT,
    paragraphFormat: DEFAULT_PARAGRAPH_FORMAT,
    defaultTabWidth: 36,
    trackChanges: false,
    enforcement: false,
    hashValue: '',
    saltValue: '',
    formatting: false,
    protectionType: 'NoProtection',
    dontUseHTMLParagraphAutoSpacing: false,
    formFieldShading: true,
    styles: [{
      name: 'Normal',
      type: 'Paragraph',
      paragraphFormat: DEFAULT_PARAGRAPH_FORMAT,
      characterFormat: DEFAULT_CHARACTER_FORMAT,
      next: 'Normal'
    }, {
      name: 'Title',
      type: 'Paragraph',
      paragraphFormat: {
        ...DEFAULT_PARAGRAPH_FORMAT,
        textAlignment: 'Center',
        afterSpacing: 14
      },
      characterFormat: {
        ...DEFAULT_CHARACTER_FORMAT,
        bold: true,
        fontSize: 18,
        fontColor: '#1F4E79'
      },
      basedOn: 'Normal',
      next: 'Normal'
    }, {
      name: 'Heading 2',
      type: 'Paragraph',
      paragraphFormat: {
        ...DEFAULT_PARAGRAPH_FORMAT,
        beforeSpacing: 10,
        afterSpacing: 6
      },
      characterFormat: {
        ...DEFAULT_CHARACTER_FORMAT,
        bold: true,
        fontSize: 12,
        fontColor: '#1F4E79'
      },
      basedOn: 'Normal',
      next: 'Normal'
    }]
  });
};

const normalizeSfdtContent = (content, options = {}) => {
  if (!content) return null;

  if (typeof content === 'string') {
    const trimmedContent = content.trim();
    const parsedContent = parseJson(trimmedContent);

    if (parsedContent) {
      if (isStructuredSfdtObject(parsedContent)) {
        return trimmedContent;
      }

      if (isLegacyPlainSfdtWrapper(parsedContent)) {
        return createStyledSfdtFromText(parsedContent.sfdt, options);
      }

      if (parsedContent.sfdt) {
        return trimmedContent;
      }

      return createStyledSfdtFromText(JSON.stringify(parsedContent, null, 2), options);
    }

    return createStyledSfdtFromText(content, options);
  }

  if (typeof content === 'object') {
    if (isStructuredSfdtObject(content)) {
      return JSON.stringify(content);
    }

    if (isLegacyPlainSfdtWrapper(content)) {
      return createStyledSfdtFromText(content.sfdt, options);
    }

    if (content.sfdt) {
      return JSON.stringify(content);
    }

    return createStyledSfdtFromText(JSON.stringify(content, null, 2), options);
  }

  return null;
};

module.exports = {
  createStyledSfdtFromText,
  extractMergeFieldsFromSfdtContent,
  extractTextFromSfdtContent,
  mergeSfdtContent,
  normalizeSfdtContent
};