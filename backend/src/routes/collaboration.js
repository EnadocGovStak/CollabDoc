const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const DOCUMENTS_DIR = path.join(__dirname, '../../uploads/documents');
const PRESENCE_TTL_MS = 30000;
const rooms = new Map();

function assertSafeDocumentId(documentId) {
  if (!/^[a-zA-Z0-9._-]+$/.test(documentId || '')) {
    const error = new Error('Invalid document ID');
    error.status = 400;
    throw error;
  }
}

function getRoom(documentId) {
  if (!rooms.has(documentId)) {
    rooms.set(documentId, {
      revision: 1,
      collaborators: new Map(),
      updatedAt: null,
      updatedBy: null,
      updatedByName: null
    });
  }

  return rooms.get(documentId);
}

function normalizeUser(input = {}) {
  const clientId = String(input.clientId || input.userId || '').trim();
  const userId = String(input.userId || clientId || 'anonymous').trim();
  const userName = String(input.userName || input.name || 'Anonymous User').trim();

  return {
    clientId: clientId || userId,
    userId,
    userName
  };
}

function touchCollaborator(room, user) {
  if (!user.clientId) {
    return;
  }

  room.collaborators.set(user.clientId, {
    ...user,
    lastSeenAt: new Date().toISOString()
  });
}

function pruneCollaborators(room) {
  const cutoff = Date.now() - PRESENCE_TTL_MS;

  for (const [clientId, collaborator] of room.collaborators.entries()) {
    if (Date.parse(collaborator.lastSeenAt) < cutoff) {
      room.collaborators.delete(clientId);
    }
  }
}

function getCollaborators(room) {
  pruneCollaborators(room);
  return Array.from(room.collaborators.values())
    .sort((left, right) => left.userName.localeCompare(right.userName));
}

function normalizeContent(content) {
  if (typeof content === 'string') {
    JSON.parse(content);
    return content;
  }

  if (content && typeof content === 'object') {
    const serialized = JSON.stringify(content);
    JSON.parse(serialized);
    return serialized;
  }

  const error = new Error('Document content is required');
  error.status = 400;
  throw error;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function updateDocumentMetadata(documentId, updates) {
  const metadataPath = path.join(DOCUMENTS_DIR, `${documentId}.meta.json`);
  let metadata = {
    id: documentId,
    title: 'Untitled',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    currentVersion: 1,
    versions: []
  };

  if (await fileExists(metadataPath)) {
    try {
      metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    } catch (error) {
      console.warn(`Could not parse metadata for ${documentId}:`, error);
    }
  }

  await fs.writeFile(metadataPath, JSON.stringify({
    ...metadata,
    ...updates
  }, null, 2));
}

async function readDocumentContent(documentId) {
  const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
  const content = await fs.readFile(documentPath, 'utf8');

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

router.post('/:documentId/join', async (req, res, next) => {
  try {
    const { documentId } = req.params;
    assertSafeDocumentId(documentId);

    const room = getRoom(documentId);
    touchCollaborator(room, normalizeUser(req.body));

    res.json({
      documentId,
      revision: room.revision,
      updatedAt: room.updatedAt,
      updatedBy: room.updatedBy,
      updatedByName: room.updatedByName,
      collaborators: getCollaborators(room)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:documentId/state', async (req, res, next) => {
  try {
    const { documentId } = req.params;
    assertSafeDocumentId(documentId);

    const room = getRoom(documentId);
    touchCollaborator(room, normalizeUser(req.query));

    const sinceRevision = Number(req.query.since || 0);
    const response = {
      documentId,
      revision: room.revision,
      updatedAt: room.updatedAt,
      updatedBy: room.updatedBy,
      updatedByName: room.updatedByName,
      collaborators: getCollaborators(room)
    };

    if (sinceRevision < room.revision) {
      response.content = await readDocumentContent(documentId);
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/:documentId/snapshot', async (req, res, next) => {
  try {
    const { documentId } = req.params;
    assertSafeDocumentId(documentId);

    const user = normalizeUser(req.body);
    const content = normalizeContent(req.body.content);
    const timestamp = new Date().toISOString();
    const documentPath = path.join(DOCUMENTS_DIR, `${documentId}.sfdt`);
    const room = getRoom(documentId);

    const metadataUpdates = {
      modifiedAt: timestamp,
      collaborativeRevision: room.revision + 1,
      lastCollaborativeUpdate: {
        at: timestamp,
        by: user.userId,
        byName: user.userName,
        clientId: user.clientId
      }
    };

    if (req.body.title) {
      metadataUpdates.title = req.body.title;
    }

    await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
    await fs.writeFile(documentPath, content);
    await updateDocumentMetadata(documentId, metadataUpdates);

    room.revision += 1;
    room.updatedAt = timestamp;
    room.updatedBy = user.clientId;
    room.updatedByName = user.userName;
    touchCollaborator(room, user);

    res.json({
      documentId,
      revision: room.revision,
      updatedAt: room.updatedAt,
      updatedBy: room.updatedBy,
      updatedByName: room.updatedByName,
      collaborators: getCollaborators(room)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:documentId/leave', (req, res, next) => {
  try {
    const { documentId } = req.params;
    assertSafeDocumentId(documentId);

    const room = getRoom(documentId);
    const user = normalizeUser(req.body);

    if (user.clientId) {
      room.collaborators.delete(user.clientId);
    }

    res.json({
      documentId,
      revision: room.revision,
      collaborators: getCollaborators(room)
    });
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  next(err);
});

module.exports = router;