import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';
import { StorageService } from '../../services/storage.service';

export const storageRoutes = new Hono<AppContext>();

// GET /api/storage/files/:key - Authenticated / public media stream
storageRoutes.get('/files/:key{.+}', async (c) => {
  const key = c.req.param('key');

  if (!c.env.STORAGE) {
    return c.json(errorResponse('STORAGE_NOT_CONFIGURED', 'R2 Storage binding not configured'), 503);
  }

  const object = await StorageService.get(c.env.STORAGE, key);
  if (!object) {
    return c.json(errorResponse('NOT_FOUND', 'File not found in storage'), 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(object.body, { headers });
});

// All upload/delete operations require authentication
storageRoutes.use('*', authMiddleware);

// POST /api/storage/upload - Upload to Cloudflare R2
storageRoutes.post('/upload', async (c) => {
  if (!c.env.STORAGE) {
    return c.json(errorResponse('STORAGE_NOT_CONFIGURED', 'R2 Storage binding not configured'), 503);
  }

  const formData = await c.req.parseBody();
  const file = formData['file'];

  if (!file || typeof file === 'string') {
    return c.json(errorResponse('VALIDATION_ERROR', 'No file uploaded under "file" field'), 400);
  }

  const uploadFile = file as File;
  const gymId = c.get('gym_id');
  const ext = uploadFile.name.split('.').pop() || 'bin';
  const objectKey = `gym-${gymId}/${generateUUID()}.${ext}`;

  try {
    const arrayBuffer = await uploadFile.arrayBuffer();
    const result = await StorageService.upload(
      c.env.STORAGE,
      objectKey,
      arrayBuffer,
      uploadFile.type || 'application/octet-stream'
    );

    return c.json(jsonResponse({
      key: result.key,
      url: `/api/storage/files/${result.key}`,
      size: result.size,
      mime_type: uploadFile.type,
      message: 'File stored successfully in Cloudflare R2',
    }), 201);
  } catch (err: any) {
    return c.json(errorResponse('UPLOAD_FAILED', err.message), 400);
  }
});

