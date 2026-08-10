const { neon } = require("@neondatabase/serverless");
const url =
  "postgresql://neondb_owner:npg_yuCP9UqtS1ZL@ep-solitary-boat-zaqqhecd-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function test(label, s) {
  try {
    neon(s);
    console.log("OK   ", label);
  } catch (e) {
    console.log("FAIL ", label, "->", e.message.split(".")[0]);
  }
}

test("exact url", url);
test("exact url + trailing CR", url + "\r");
test("exact url + trailing LF", url + "\n");
test("exact url + trailing CRLF", url + "\r\n");
test("exact url + BOM prefix", "\uFEFF" + url);
test("url without channel_binding", url.replace("&channel_binding=require", ""));
console.log("new URL exact:", (() => { try { new URL(url); return "OK"; } catch (e) { return "FAIL " + e.message; } })());
