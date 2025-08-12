// storage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

/**
 * Initialize Google Cloud Storage client
 * Uses Replit sidecar for credentials
 */
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
  projectId: process.env.GCP_PROJECT_ID || "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  /**
   * Upload a base64 image to object storage
   * @param base64Data Base64 image string (with or without data:image/... prefix)
   * @param userId User ID for storage folder structure
   * @returns Fully qualified public URL
   */
  async uploadBase64Image(base64Data: string, userId: string): Promise<string> {
    console.log("🔄 Starting base64 image upload...");

    try {
      // Ensure bucket is configured
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        throw new Error("❌ DEFAULT_OBJECT_STORAGE_BUCKET_ID environment variable not set");
      }

      // Normalize base64 input
      let imageType = "jpeg"; // default
      let cleanBase64 = base64Data;

      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        imageType = matches[1];
        cleanBase64 = matches[2];
      }

      const buffer = Buffer.from(cleanBase64, "base64");
      console.log(`📸 Image type: ${imageType}, Size: ${(buffer.length / 1024).toFixed(1)} KB`);

      // Create filename
      const filename = `stories/${userId}/${randomUUID()}.${imageType}`;
      console.log(`📝 Generated filename: ${filename}`);

      // Upload to storage
      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(filename);

      console.log("⬆️ Uploading to object storage...");
      await file.save(buffer, {
        metadata: {
          contentType: `image/${imageType}`,
          cacheControl: "public, max-age=31536000",
        },
      });

      console.log("✅ Upload completed successfully");

      // Build fully qualified public URL
      const serverUrl = process.env.SERVER_URL || "https://hot-girl-hunt-fenelon141.replit.app";
      const publicUrl = `${serverUrl}/public-objects/${filename}`;
      console.log(`🌍 Public URL: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error("💥 Error uploading image to object storage:", error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get private object directory path
   */
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error("❌ PRIVATE_OBJECT_DIR not set. Object storage not properly configured.");
    }
    return dir;
  }
}
