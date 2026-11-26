import { v2 as cloudinary } from "cloudinary";
import { getServerEnv, isCloudinaryConfigured } from "@/lib/env";

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
    this.name = "CloudinaryNotConfiguredError";
  }
}

let configured = false;

function ensureCloudinaryConfigured() {
  if (configured) return;
  const env = getServerEnv();
  if (!isCloudinaryConfigured(env)) {
    throw new CloudinaryNotConfiguredError();
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export type UploadBufferOptions = {
  folder?: string;
  publicId?: string;
  tags?: string[];
};

/**
 * Upload a buffer to Cloudinary (server-side only).
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType: string,
  options?: UploadBufferOptions,
) {
  ensureCloudinaryConfigured();
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

  return cloudinary.uploader.upload(dataUri, {
    folder: options?.folder,
    public_id: options?.publicId,
    tags: options?.tags,
    resource_type: "image",
  });
}

export type SignedUploadParams = {
  timestamp: number;
  folder?: string;
  publicId?: string;
};

/**
 * Generate parameters for a signed client upload (optional pattern for mobile/web).
 */
export function createSignedUploadPayload(params: SignedUploadParams) {
  ensureCloudinaryConfigured();
  const env = getServerEnv();
  const toSign: Record<string, string | number> = {
    timestamp: params.timestamp,
  };
  if (params.folder) toSign.folder = params.folder;
  if (params.publicId) toSign.public_id = params.publicId;

  const signature = cloudinary.utils.api_sign_request(
    toSign,
    env.CLOUDINARY_API_SECRET!,
  );

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    signature,
    timestamp: params.timestamp,
    folder: params.folder,
    publicId: params.publicId,
  };
}