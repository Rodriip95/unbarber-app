// Arma el prototipo navegable como una sola página (dist-demo/index.html + demo/hero.jpg)
// para publicarlo y compartirlo sin desplegar la app. Uso: npm run demo:build
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist-demo");
rmSync(out, { recursive: true, force: true });
mkdirSync(resolve(out, "demo"), { recursive: true });

const js = await build({
  entryPoints: [resolve(root, "components/demo/standalone.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  target: "es2020",
  alias: { "@": root },
  define: { "process.env.NODE_ENV": '"production"' },
  logOverride: { "unsupported-directive": "silent" },
});

const cssFile = resolve(out, "app.css");
execFileSync(resolve(root, "node_modules/.bin/tailwindcss"), ["-i", "app/globals.css", "-o", cssFile, "--minify"], { cwd: root, stdio: "inherit" });
const css = readFileSync(cssFile, "utf8").replaceAll("</style", "<\\/style");
rmSync(cssFile);

const html = `<title>Unbarber demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Text:ital@0;1&display=swap">
<style>:root{--font-dm-serif:"DM Serif Text";--font-dm-sans:"DM Sans";color-scheme:light}${css}</style>
<div id="root"></div>
<script>${js.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script>
`;
writeFileSync(resolve(out, "index.html"), html);
cpSync(resolve(root, "public/demo/hero.jpg"), resolve(out, "demo/hero.jpg"));
console.log(`dist-demo/index.html ${(html.length / 1024).toFixed(0)} KB`);
