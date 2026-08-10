import crypto from "crypto";

export function generateId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[crypto.randomInt(chars.length)];
  }
  return result;
}
