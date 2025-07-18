
import { AttachmentFileType } from "@prisma/client";

export async function uploadAllFiles(files: { type: string; file: File }[]): Promise<{ url: string; type: AttachmentFileType }[]> {
// export async function uploadFile(file: File): Promise<string> {
	const formData = new FormData();
	const uploadPromises = files.map(async (file) => {
		formData.append("file", file.file);
		const { url } = await fetch("/api/upload", { method: "POST", body: formData });
		return { url, type: file.type as AttachmentFileType };
	});
	const results = await Promise.all(uploadPromises);
	return results;
  }
