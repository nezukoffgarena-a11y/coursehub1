import { put, get, del } from "@vercel/blob";

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

export async function getFileUrl(blobUrl: string): Promise<string> {
  const result = await get(blobUrl, { access: "private" });
  if (!result) throw new Error("Blob not found");
  return result.blob.downloadUrl;
}

export async function deleteFile(blobUrl: string): Promise<void> {
  await del(blobUrl);
}
