import { put, del } from "@vercel/blob";

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const blob = await put(key, body, {
    access: "private",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function streamBlob(blobUrl: string): Promise<Response> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Blob storage not configured");
  return fetch(blobUrl, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function deleteFile(blobUrl: string): Promise<void> {
  await del(blobUrl);
}
