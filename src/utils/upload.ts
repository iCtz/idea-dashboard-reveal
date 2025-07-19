
import { AttachmentFileType } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Uploads a single file to the local public directory.
 * In a production environment, this should be replaced with a cloud storage service (e.g., Vercel Blob, AWS S3).
 * @param file The file to upload.
 * @returns The public URL of the uploaded file and its original name.
 */
export async function uploadFile(
  file: File
): Promise<{ url: string; name: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename to avoid overwrites
  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  // For simplicity, saving to `public/uploads`. Ensure this directory exists.
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  return { url: `/uploads/${filename}`, name: file.name };
}
