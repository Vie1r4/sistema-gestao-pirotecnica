import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app");

const tagRe =
  /(<[a-zA-Z][a-zA-Z0-9]*)([^>]*?)style=\{\{\s*paddingTop:\s*CONTENT_OFFSET_TOP\s*\}\}([^>]*?)>/g;

function patchFile(file) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("paddingTop: CONTENT_OFFSET_TOP")) return false;

  src = src.replace(tagRe, (_, tag, before, after) => {
    let attrs = `${before}${after}`;
    if (/className=/.test(attrs)) {
      attrs = attrs.replace(/className="([^"]*)"/, (m, cls) =>
        cls.includes("pt-content-offset") ? m : `className="${cls} pt-content-offset"`
      );
    } else {
      attrs += ' className="pt-content-offset"';
    }
    return `${tag}${attrs}>`;
  });

  fs.writeFileSync(file, src);
  return true;
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".tsx")) {
      if (patchFile(full)) console.log("patched", full);
    }
  }
}

walk(root);
