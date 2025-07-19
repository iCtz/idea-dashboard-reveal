import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  // For simplicity, we're saving to the public directory.
  // In a real-world application, you'd upload to a cloud storage service.
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename to avoid overwrites
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const publicPath = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(publicPath, filename);

  try {
    await writeFile(filePath, buffer);
    console.log(`File saved to ${filePath}`);

    // Return the public URL of the file
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Error saving file.' }, { status: 500 });
  }
}
