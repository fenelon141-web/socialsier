import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// Object storage client
export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  // Upload base64 image data to object storage and return public URL
  async uploadBase64Image(base64Data: string, userId: string): Promise<string> {
    try {
      console.log('Starting base64 image upload...');
      
      // Extract image type and data from base64 string
      const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image data format');
      }
      
      const [, imageType, imageData] = matches;
      const buffer = Buffer.from(imageData, 'base64');
      
      console.log(`Image type: ${imageType}, Size: ${buffer.length} bytes`);
      
      // Generate unique filename
      const filename = `stories/${userId}/${randomUUID()}.${imageType}`;
      console.log(`Generated filename: ${filename}`);
      
      // Get bucket from environment
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        throw new Error('Object storage bucket not configured');
      }
      
      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(filename);
      
      console.log('Uploading to object storage...');
      
      // Upload the buffer to object storage
      await file.save(buffer, {
        metadata: {
          contentType: `image/${imageType}`,
          cacheControl: 'public, max-age=31536000',
        },
        public: true, // Make file publicly accessible
      });
      
      console.log('Upload completed successfully');
      
      // Return the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketId}/${filename}`;
      console.log(`Public URL: ${publicUrl}`);
      
      return publicUrl;
      
    } catch (error) {
      console.error('Error uploading image to object storage:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get private object directory
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Object storage not properly configured."
      );
    }
    return dir;
  }
}