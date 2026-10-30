export interface UploadOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}

const DEFAULT_MAX_SIZE = 15 * 1024 * 1024; // 15MB

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
];

export class StorageService {
  static async upload(
    bucket: R2Bucket,
    key: string,
    data: ArrayBuffer | ReadableStream,
    contentType: string,
    options: UploadOptions = {}
  ): Promise<{ key: string; size: number }> {
    const allowed = options.allowedMimeTypes || DEFAULT_ALLOWED_TYPES;
    if (!allowed.includes(contentType)) {
      throw new Error(`Unsupported file type: ${contentType}. Allowed: ${allowed.join(', ')}`);
    }

    const max = options.maxSizeBytes || DEFAULT_MAX_SIZE;
    if (data instanceof ArrayBuffer && data.byteLength > max) {
      throw new Error(`File size ${data.byteLength} exceeds maximum limit of ${max} bytes`);
    }

    const object = await bucket.put(key, data, {
      httpMetadata: { contentType },
    });

    return {
      key: object.key,
      size: object.size,
    };
  }

  static async get(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
    return bucket.get(key);
  }

  static async delete(bucket: R2Bucket, key: string): Promise<void> {
    await bucket.delete(key);
  }
}

