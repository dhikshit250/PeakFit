import ImageKit from "imagekit";
import { getServerEnv, isImageKitConfigured } from "@/lib/env";

export class ImageKitNotConfiguredError extends Error {
  constructor() {
    super(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.",
    );
    this.name = "ImageKitNotConfiguredError";
  }
}

let client: ImageKit | null = null;

function getImageKitClient(): ImageKit {
  if (client) return client;
  const env = getServerEnv();
  if (!isImageKitConfigured(env)) {
    throw new ImageKitNotConfiguredError();
  }
  client = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT!,
  });
  return client;
}

export type UploadBufferOptions = {
  folder?: string;
  fileName?: string;
  tags?: string[];
};

/**
 * Upload a buffer to ImageKit (server-side only).
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType: string,
  options?: UploadBufferOptions,
) {
  const ik = getImageKitClient();
  const fileName = options?.fileName ?? `upload-${Date.now()}`;

  return ik.upload({
    file: buffer,
    fileName,
    folder: options?.folder,
    tags: options?.tags,
    useUniqueFileName: true,
    responseFields: ["url", "fileId", "thumbnailUrl", "name"],
    ...(mimeType ? { mime: mimeType } : {}),
  });
}

export type ClientUploadAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

/**
 * Authentication parameters for client-side / mobile direct upload.
 */
export function createClientUploadAuth(): ClientUploadAuth {
  const env = getServerEnv();
  const ik = getImageKitClient();
  const params = ik.getAuthenticationParameters();

  return {
    ...params,
    publicKey: env.IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT!,
  };
}